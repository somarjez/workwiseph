from __future__ import annotations
import io
import pandas as pd
from sqlalchemy import text
from data_pipeline.config import TableSpec, settings
from data_pipeline.parsers.key_indicator import parse_key_indicator
from data_pipeline.parsers.age_sex import parse_age_sex
from data_pipeline.parsers.category import parse_category
from data_pipeline.parsers.pay_matrix import parse_pay_matrix
from data_pipeline.clean import clean_long
from backend.app.db.session import engine

CLEAN_TABLE = "fact_long"
CLEAN_COLUMNS = [
    "year", "month", "month_number", "period_type", "reference_date",
    "sex", "age_group", "category", "indicator_name", "value", "unit",
    "source_table", "source_updated_at",
]


def parse_and_clean(spec: TableSpec) -> pd.DataFrame:
    path = settings.datasets_dir / spec.filename
    parser = {
        "key_indicator": parse_key_indicator,
        "age_sex": parse_age_sex,
        "category": parse_category,
        "pay_matrix": parse_pay_matrix,
    }[spec.archetype]
    return clean_long(parser(path, spec), spec)


def reset_clean() -> None:
    with engine.begin() as c:
        c.execute(text(f"TRUNCATE TABLE clean.{CLEAN_TABLE} RESTART IDENTITY"))


def load_clean(df_clean: pd.DataFrame) -> int:
    """Bulk-insert cleaned long rows into clean.fact_long via Postgres COPY.

    COPY is a single round-trip and is dramatically faster than row-by-row
    INSERTs over a remote pooled connection.
    """
    out = df_clean[CLEAN_COLUMNS].copy()
    # month_number is float (NaN for annual rows); cast to nullable int so COPY
    # sees "1"/"" rather than "1.0" for the integer column.
    out["month_number"] = out["month_number"].astype("Int64")
    buf = io.StringIO()
    out.to_csv(buf, index=False, header=False, na_rep="\\N")
    buf.seek(0)
    columns = ", ".join(CLEAN_COLUMNS)
    copy_sql = (
        f"COPY clean.{CLEAN_TABLE} ({columns}) "
        "FROM STDIN WITH (FORMAT csv, NULL '\\N')"
    )
    raw_conn = engine.raw_connection()
    try:
        cur = raw_conn.cursor()
        cur.copy_expert(copy_sql, buf)
        raw_conn.commit()
    finally:
        raw_conn.close()
    return len(df_clean)

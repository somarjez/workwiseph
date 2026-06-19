from __future__ import annotations
import pandas as pd
from sqlalchemy import text
from data_pipeline.config import TableSpec, settings
from data_pipeline.parsers.key_indicator import parse_key_indicator
from data_pipeline.parsers.age_sex import parse_age_sex
from data_pipeline.clean import clean_long
from backend.app.db.session import engine

CLEAN_TABLE = "fact_long"


def parse_and_clean(spec: TableSpec) -> pd.DataFrame:
    path = settings.datasets_dir / spec.filename
    if spec.archetype == "key_indicator":
        parsed = parse_key_indicator(path, spec)
    else:
        parsed = parse_age_sex(path, spec)
    return clean_long(parsed, spec)


def load_raw(df_clean: pd.DataFrame, spec: TableSpec) -> int:
    schema, table = spec.source_table.split(".")
    df_clean.to_sql(table, engine, schema=schema, if_exists="replace", index=False)
    return len(df_clean)


def reset_clean() -> None:
    with engine.begin() as c:
        c.execute(text(f"TRUNCATE TABLE clean.{CLEAN_TABLE} RESTART IDENTITY"))


def load_clean(df_clean: pd.DataFrame) -> int:
    df_clean.to_sql(CLEAN_TABLE, engine, schema="clean",
                    if_exists="append", index=False)
    return len(df_clean)

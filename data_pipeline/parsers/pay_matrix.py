from __future__ import annotations
from pathlib import Path
import pandas as pd
from data_pipeline.config import TableSpec
from data_pipeline.parsers.key_indicator import VALID_MONTHS


def _is_numeric(v) -> bool:
    if v is None:
        return False
    s = str(v).strip().replace(",", "")
    if s in ("", "nan", "NaN", "None", ".", "-"):
        return False
    try:
        float(s)
        return True
    except ValueError:
        return False


def parse_pay_matrix(path: Path, spec: TableSpec) -> pd.DataFrame:
    """Parse the average-pay matrix: years/months across columns, industries down rows.

    Row 2 holds the year (forward-filled across its month columns); row 3 holds the
    month; column 0 holds the industry category (with `..`/`....` hierarchy prefixes).
    A data row is kept only if it has at least one numeric cell (drops footer rows).
    """
    raw = pd.read_excel(path, header=None)
    years = raw.iloc[2].ffill()
    months = raw.iloc[3]
    body = raw.iloc[4:]

    records = []
    for _, r in body.iterrows():
        category = str(r[0]).lstrip(". ").strip() if pd.notna(r[0]) else ""
        value_cols = range(1, raw.shape[1])
        if not category or not any(_is_numeric(r[col]) for col in value_cols):
            continue
        for col in value_cols:
            year, month = years[col], months[col]
            if pd.isna(year) or month not in VALID_MONTHS:
                continue
            records.append({
                "year": int(year),
                "month": month,
                "category": category,
                "value_raw": r[col],
            })
    return pd.DataFrame(records, columns=["year", "month", "category", "value_raw"])

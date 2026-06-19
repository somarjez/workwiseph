from __future__ import annotations
from pathlib import Path
import pandas as pd
from data_pipeline.config import TableSpec
from data_pipeline.parsers.key_indicator import VALID_MONTHS


def parse_category(path: Path, spec: TableSpec) -> pd.DataFrame:
    """Parse a single-header category table (industry, occupation, etc.).

    Row 2 holds category names across the columns; data starts at row 3 with
    year in col 0 (forward-filled) and month in col 1.
    """
    raw = pd.read_excel(path, header=None)
    categories = raw.iloc[2]
    body = raw.iloc[3:].copy()
    body[0] = body[0].ffill()
    body = body[body[1].isin(VALID_MONTHS)]

    records = []
    for col in range(2, raw.shape[1]):
        category = categories[col]
        if pd.isna(category):
            continue
        for _, r in body.iterrows():
            records.append({
                "year": int(r[0]),
                "month": r[1],
                "category": str(category).strip(),
                "value_raw": r[col],
            })
    return pd.DataFrame(records, columns=["year", "month", "category", "value_raw"])

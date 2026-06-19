from __future__ import annotations
from pathlib import Path
import pandas as pd
from data_pipeline.config import TableSpec

VALID_MONTHS = {
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December", "Annual",
}


def parse_key_indicator(path: Path, spec: TableSpec) -> pd.DataFrame:
    raw = pd.read_excel(path, header=None)
    groups = raw.iloc[2].ffill()          # indicator group per column
    sexes = raw.iloc[3]                    # sex per column
    body = raw.iloc[4:].copy()
    body[0] = body[0].ffill()              # forward-fill year
    body = body[body[1].isin(VALID_MONTHS)]  # drop footer / blank rows

    records = []
    for col in range(2, raw.shape[1]):
        indicator = groups[col]
        sex = sexes[col]
        if pd.isna(indicator) or pd.isna(sex):
            continue
        for _, r in body.iterrows():
            records.append({
                "year": int(r[0]),
                "month": r[1],
                "sex": sex,
                "indicator_name": indicator,
                "value_raw": r[col],
            })
    return pd.DataFrame(records,
                        columns=["year", "month", "sex", "indicator_name", "value_raw"])

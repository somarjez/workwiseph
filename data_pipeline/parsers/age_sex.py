from __future__ import annotations
from pathlib import Path
import pandas as pd
from data_pipeline.config import TableSpec
from data_pipeline.parsers.key_indicator import VALID_MONTHS


def parse_age_sex(path: Path, spec: TableSpec) -> pd.DataFrame:
    raw = pd.read_excel(path, header=None)
    sexes = raw.iloc[2].ffill()        # Both Sexes / Male / Female across 7 cols each
    ages = raw.iloc[3]
    body = raw.iloc[4:].copy()
    body[0] = body[0].ffill()
    body = body[body[1].isin(VALID_MONTHS)]

    records = []
    for col in range(2, raw.shape[1]):
        sex = sexes[col]
        age = ages[col]
        if pd.isna(sex) or pd.isna(age):
            continue
        for _, r in body.iterrows():
            records.append({
                "year": int(r[0]),
                "month": r[1],
                "sex": sex,
                "age_group": age,
                "value_raw": r[col],
            })
    return pd.DataFrame(records,
                        columns=["year", "month", "sex", "age_group", "value_raw"])

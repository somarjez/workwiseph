from __future__ import annotations
from datetime import date
import pandas as pd
from data_pipeline.config import TableSpec

MONTH_NUMBER = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11,
    "December": 12,
}

# Friendly indicator name for age-sex tables, keyed by TableSpec.key
AGE_SEX_INDICATOR = {
    "population": "Population 15 Years and Over",
    "labor_force": "Persons in the Labor Force",
    "employed": "Employed Persons",
    "unemployed": "Unemployed Persons",
    "underemployed": "Underemployed Persons",
    "not_in_labor_force": "Persons Not in the Labor Force",
    "visible_underemployed": "Visibly Underemployed Persons",
    "invisible_underemployed": "Invisibly Underemployed Persons",
}


def to_numeric(v) -> float | None:
    if v is None:
        return None
    s = str(v).strip().replace(",", "")
    if s in (".", "", "nan", "NaN", "None", "-"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def clean_long(df: pd.DataFrame, spec: TableSpec) -> pd.DataFrame:
    out = pd.DataFrame()
    out["year"] = df["year"].astype(int)
    out["month"] = df["month"]
    out["month_number"] = df["month"].map(MONTH_NUMBER)
    out["period_type"] = df["month"].apply(
        lambda m: "annual" if m == "Annual" else "monthly")
    out["reference_date"] = [
        (date(int(y), MONTH_NUMBER[m], 1) if m in MONTH_NUMBER else None)
        for y, m in zip(df["year"], df["month"])
    ]
    out["sex"] = df["sex"].replace({"Both sexes": "Both Sexes"})
    out["age_group"] = df["age_group"] if "age_group" in df else "Total"
    if "indicator_name" in df:
        out["indicator_name"] = df["indicator_name"]
    else:
        out["indicator_name"] = AGE_SEX_INDICATOR[spec.key]
    out["value"] = df["value_raw"].apply(to_numeric)
    out["unit"] = spec.unit
    out["source_table"] = spec.source_table
    out["source_updated_at"] = pd.Timestamp.utcnow()
    return out[["year", "month", "month_number", "period_type", "reference_date",
                "sex", "age_group", "indicator_name", "value", "unit",
                "source_table", "source_updated_at"]]

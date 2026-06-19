import math
import pandas as pd
from datetime import date
from data_pipeline.config import TableSpec
from data_pipeline.clean import clean_long, to_numeric

KI_SPEC = TableSpec("rates", "x", "key_indicator", "percent", "raw.lfs_rates", [])
AS_SPEC = TableSpec("underemployed", "x", "age_sex", "persons", "raw.underemployed_age_sex")
CAT_SPEC = TableSpec("employed_industry", "x", "category", "persons", "raw.employed_industry_2009")

STD_COLS = ["year", "month", "month_number", "period_type", "reference_date",
            "sex", "age_group", "category", "indicator_name", "value", "unit",
            "source_table", "source_updated_at"]


def test_to_numeric():
    assert to_numeric(".") is None
    assert to_numeric("1,234.5") == 1234.5
    assert to_numeric("64.821") == 64.821
    assert to_numeric(None) is None


def test_key_indicator_clean_schema():
    df_in = pd.DataFrame([
        {"year": 2005, "month": "April", "sex": "Both sexes",
         "indicator_name": "Unemployment Rate", "value_raw": "8.28"},
    ])
    out = clean_long(df_in, KI_SPEC)
    assert list(out.columns) == STD_COLS
    row = out.iloc[0]
    assert row.sex == "Both Sexes"          # normalized
    assert row.age_group == "Total"          # default for key-indicator
    assert row.month_number == 4
    assert row.period_type == "monthly"
    assert row.reference_date == date(2005, 4, 1)
    assert row.value == 8.28
    assert row.unit == "percent"
    assert row.source_table == "raw.lfs_rates"


def test_annual_row_has_null_month_number_and_date():
    df_in = pd.DataFrame([
        {"year": 2005, "month": "Annual", "sex": "Male",
         "indicator_name": "Employment Rate", "value_raw": "90.0"},
    ])
    out = clean_long(df_in, KI_SPEC)
    row = out.iloc[0]
    assert row.period_type == "annual"
    assert row.month_number is None or math.isnan(row.month_number)
    assert row.reference_date is None


def test_age_sex_indicator_name_and_dot_to_null():
    df_in = pd.DataFrame([
        {"year": 2005, "month": "January", "sex": "Female",
         "age_group": "15 - 24 Years Old", "value_raw": "."},
    ])
    out = clean_long(df_in, AS_SPEC)
    row = out.iloc[0]
    assert row.indicator_name == "Underemployed Persons"
    assert row.value is None or (isinstance(row.value, float) and math.isnan(row.value))
    assert row.unit == "persons"


def test_category_clean_defaults():
    df_in = pd.DataFrame([
        {"year": 2012, "month": "January", "category": "AGRICULTURE", "value_raw": "12112.06"},
    ])
    out = clean_long(df_in, CAT_SPEC)
    assert list(out.columns) == STD_COLS
    row = out.iloc[0]
    assert row.category == "AGRICULTURE"
    assert row.sex == "Both Sexes"      # defaulted (no sex dimension)
    assert row.age_group == "Total"      # defaulted
    assert row.indicator_name == "Employed Persons by Industry"
    assert row.value == 12112.06

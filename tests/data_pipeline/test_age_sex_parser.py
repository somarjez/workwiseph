from pathlib import Path
from openpyxl import Workbook
from data_pipeline.config import TableSpec
from data_pipeline.parsers.age_sex import parse_age_sex

SPEC = TableSpec("underemployed", "x.xlsx", "age_sex", "persons", "raw.underemployed_age_sex")
AGES = ["Total", "15 - 24 Years Old", "25 - 34 Years Old", "35 - 44 Years Old",
        "45 - 54 Years Old", "55 - 64 Years Old", "65 Years Old and Over"]


def _make_xlsx(tmp_path: Path) -> Path:
    wb = Workbook(); ws = wb.active
    ws.append(["Underemployed Persons by Sex and by Age Group: April 2005 to April 2026"])
    ws.append([])
    ws.append([None, None, "Both Sexes", None, None, None, None, None, None,
               "Male", None, None, None, None, None, None,
               "Female", None, None, None, None, None, None])
    ws.append([None, None] + AGES + AGES + AGES)
    ws.append([2005, "January"] + ["."] * 21)
    ws.append([None, "April"] + [str(i) for i in range(1, 22)])
    ws.append(["Internal reference code:"])
    p = tmp_path / "x.xlsx"; wb.save(p); return p


def test_columns_and_shape(tmp_path):
    df = parse_age_sex(_make_xlsx(tmp_path), SPEC)
    assert list(df.columns) == ["year", "month", "sex", "age_group", "value_raw"]
    # 2 month rows x 3 sexes x 7 age groups = 42
    assert len(df) == 42


def test_sex_forward_filled(tmp_path):
    df = parse_age_sex(_make_xlsx(tmp_path), SPEC)
    assert set(df["sex"].unique()) == {"Both Sexes", "Male", "Female"}


def test_age_groups(tmp_path):
    df = parse_age_sex(_make_xlsx(tmp_path), SPEC)
    assert set(df["age_group"].unique()) == set(AGES)


def test_footer_dropped(tmp_path):
    df = parse_age_sex(_make_xlsx(tmp_path), SPEC)
    assert df["month"].isin(["January", "April"]).all()

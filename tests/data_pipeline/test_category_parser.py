from pathlib import Path
from openpyxl import Workbook
from data_pipeline.config import TableSpec
from data_pipeline.parsers.category import parse_category

SPEC = TableSpec("employed_industry", "x.xlsx", "category", "persons", "raw.employed_industry_2009")


def _make_xlsx(tmp_path: Path) -> Path:
    wb = Workbook(); ws = wb.active
    ws.append(["Number of Employed Persons by Major Industry Group"])  # row0 title
    ws.append([])                                                       # row1 blank
    ws.append([None, None, "TOTAL", "AGRICULTURE", "INDUSTRY"])         # row2 categories
    ws.append([2012, "January", "37334.18", "12112.06", "5515.60"])    # row3 data
    ws.append([None, "April", ".", ".", "."])
    ws.append([None, "Annual", "37000.0", "12000.0", "5500.0"])
    ws.append(["Database:"])                                            # footer
    p = tmp_path / "x.xlsx"; wb.save(p); return p


def test_columns_and_shape(tmp_path):
    df = parse_category(_make_xlsx(tmp_path), SPEC)
    assert list(df.columns) == ["year", "month", "category", "value_raw"]
    # 3 month rows x 3 categories = 9
    assert len(df) == 9


def test_categories(tmp_path):
    df = parse_category(_make_xlsx(tmp_path), SPEC)
    assert set(df["category"].unique()) == {"TOTAL", "AGRICULTURE", "INDUSTRY"}


def test_footer_dropped(tmp_path):
    df = parse_category(_make_xlsx(tmp_path), SPEC)
    assert "Database:" not in df["month"].values
    assert df["month"].isin(["January", "April", "Annual"]).all()


def test_value_preserved(tmp_path):
    df = parse_category(_make_xlsx(tmp_path), SPEC)
    row = df[(df.month == "January") & (df.category == "TOTAL")]
    assert row.iloc[0]["value_raw"] == "37334.18"

import pandas as pd
from pathlib import Path
from openpyxl import Workbook
from data_pipeline.config import TableSpec
from data_pipeline.parsers.key_indicator import parse_key_indicator

SPEC = TableSpec("rates", "x.xlsx", "key_indicator", "percent", "raw.lfs_rates",
                 ["Labor Force Participation Rate", "Employment Rate"])


def _make_xlsx(tmp_path: Path) -> Path:
    wb = Workbook(); ws = wb.active
    ws.append(["Rates Key Employment Indicators: April 2005 to April 2026"])  # row0 title
    ws.append([])                                                              # row1 blank
    ws.append([None, None, "Labor Force Participation Rate", None, None,
               "Employment Rate", None, None])                                 # row2 groups
    ws.append([None, None, "Both sexes", "Male", "Female",
               "Both sexes", "Male", "Female"])                               # row3 sexes
    ws.append([2005, "January", ".", ".", ".", ".", ".", "."])
    ws.append([None, "April", "64.821", "79.517", "50.201", "91.72", "92", "91"])
    ws.append([None, "Annual", "63.0", "78.0", "49.0", "90.0", "91", "89"])
    ws.append(["Database:"])  # footer
    p = tmp_path / "x.xlsx"; wb.save(p); return p


def test_parse_shape_and_columns(tmp_path):
    df = parse_key_indicator(_make_xlsx(tmp_path), SPEC)
    assert list(df.columns) == ["year", "month", "sex", "indicator_name", "value_raw"]
    # 3 data rows (Jan, April, Annual) x 2 indicators x 3 sexes = 18
    assert len(df) == 18


def test_year_forward_filled(tmp_path):
    df = parse_key_indicator(_make_xlsx(tmp_path), SPEC)
    assert set(df["year"].unique()) == {2005}


def test_footer_dropped(tmp_path):
    df = parse_key_indicator(_make_xlsx(tmp_path), SPEC)
    assert "Database:" not in df["month"].values


def test_value_preserved_raw(tmp_path):
    df = parse_key_indicator(_make_xlsx(tmp_path), SPEC)
    row = df[(df.month == "April") & (df.sex == "Both sexes") &
             (df.indicator_name == "Labor Force Participation Rate")]
    assert row.iloc[0]["value_raw"] == "64.821"

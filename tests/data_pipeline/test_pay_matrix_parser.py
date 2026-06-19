from pathlib import Path
from openpyxl import Workbook
from data_pipeline.config import TableSpec
from data_pipeline.parsers.pay_matrix import parse_pay_matrix

SPEC = TableSpec("average_pay_industry", "x.xlsx", "pay_matrix", "PHP", "raw.average_pay_industry")


def _make_xlsx(tmp_path: Path) -> Path:
    wb = Workbook(); ws = wb.active
    ws.append(["Average Daily Basic Pay ..."])                          # row0 title
    ws.append([])                                                        # row1 blank
    ws.append([None, 2016, None, 2017, None])                            # row2 years
    ws.append([None, "January", "Annual", "January", "Annual"])         # row3 months
    ws.append(["TOTAL", "387.56", "400.95", "414.64", "420.0"])         # data
    ws.append(["..AGRICULTURE", "201.55", "209.33", "210.13", "215.0"])  # data (dotted)
    ws.append(["Internal reference code:", None, None, None, None])      # footer (no numbers)
    p = tmp_path / "x.xlsx"; wb.save(p); return p


def test_columns_and_shape(tmp_path):
    df = parse_pay_matrix(_make_xlsx(tmp_path), SPEC)
    assert list(df.columns) == ["year", "month", "category", "value_raw"]
    # 2 categories x (2016 Jan, 2016 Annual, 2017 Jan, 2017 Annual) = 8
    assert len(df) == 8


def test_year_filled_and_months(tmp_path):
    df = parse_pay_matrix(_make_xlsx(tmp_path), SPEC)
    assert set(df["year"].unique()) == {2016, 2017}
    assert set(df["month"].unique()) == {"January", "Annual"}


def test_category_dots_stripped(tmp_path):
    df = parse_pay_matrix(_make_xlsx(tmp_path), SPEC)
    assert set(df["category"].unique()) == {"TOTAL", "AGRICULTURE"}


def test_footer_row_dropped(tmp_path):
    df = parse_pay_matrix(_make_xlsx(tmp_path), SPEC)
    assert not df["category"].str.contains("Internal").any()


def test_value_lookup(tmp_path):
    df = parse_pay_matrix(_make_xlsx(tmp_path), SPEC)
    row = df[(df.category == "TOTAL") & (df.year == 2016) & (df.month == "January")]
    assert row.iloc[0]["value_raw"] == "387.56"

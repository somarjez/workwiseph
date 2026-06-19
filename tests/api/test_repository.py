import pytest
from backend.app.repositories import labor_repository as repo

pytestmark = pytest.mark.usefixtures("require_data")


def test_fetch_series_rates():
    rows = repo.fetch_series("raw.lfs_rates", "Unemployment Rate", "Both Sexes", "monthly")
    assert len(rows) > 50
    assert {"year", "month", "value", "unit"} <= set(rows[0].keys())
    assert rows[0]["unit"] == "percent"


def test_fetch_kpis():
    rows = repo.fetch_kpis()
    assert len(rows) >= 4
    assert {"indicator_name", "value", "unit", "reference_date"} <= set(rows[0].keys())

import pytest
from sqlalchemy import text
from backend.app.db.session import engine
from data_pipeline.config import TABLE_REGISTRY
from data_pipeline.loader import parse_and_clean, load_clean, reset_clean
from data_pipeline.scripts.run_etl import run_full_etl

# This module truncates clean.fact_long and reloads, so it is destructive and
# hits the remote DB heavily. Deselected by default; run with `pytest -m etl`.
pytestmark = pytest.mark.etl


def _spec(key):
    return next(t for t in TABLE_REGISTRY if t.key == key)


@pytest.fixture(scope="module", autouse=True)
def restore_full_data_after():
    # These tests truncate clean.fact_long and reload only one table. Restore the
    # complete dataset afterwards so the DB stays usable for the app and reruns.
    yield
    run_full_etl()


def test_load_clean_roundtrip():
    reset_clean()
    df = parse_and_clean(_spec("rates"))
    n = load_clean(df)
    with engine.connect() as c:
        count = c.execute(text(
            "select count(*) from clean.fact_long where source_table='raw.lfs_rates'"
        )).scalar()
    assert count == n == len(df)

import pytest
from sqlalchemy import text
from backend.app.db.session import engine

EXPECTED_SOURCE_TABLES = 18


def data_is_complete() -> bool:
    """True when clean.fact_long holds all source tables and KPIs exist.

    Read-only: never triggers the ETL. Tests that need loaded data skip when
    this is False, keeping the default suite fast and independent of the
    remote database's contents.
    """
    try:
        with engine.connect() as c:
            n_sources = c.execute(text(
                "SELECT count(DISTINCT source_table) FROM clean.fact_long")).scalar()
            has_kpis = c.execute(text(
                "SELECT to_regclass('analytics.dashboard_kpis') IS NOT NULL")).scalar()
        return n_sources == EXPECTED_SOURCE_TABLES and bool(has_kpis)
    except Exception:
        return False


@pytest.fixture(scope="session")
def require_loaded_data():
    if not data_is_complete():
        pytest.skip("Database not fully loaded — run `python -m data_pipeline.scripts.run_etl`")

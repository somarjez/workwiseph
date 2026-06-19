import pytest
from sqlalchemy import text
from backend.app.db.session import engine

pytestmark = pytest.mark.usefixtures("require_loaded_data")


@pytest.fixture(scope="module")
def conn():
    with engine.connect() as c:
        yield c


def test_no_negative_values(conn):
    n = conn.execute(text(
        "SELECT count(*) FROM clean.fact_long WHERE value < 0")).scalar()
    assert n == 0


def test_rates_within_bounds(conn):
    n = conn.execute(text(
        "SELECT count(*) FROM clean.fact_long "
        "WHERE unit='percent' AND value IS NOT NULL AND (value < 0 OR value > 100)"
    )).scalar()
    assert n == 0


def test_sex_labels_normalized(conn):
    rows = conn.execute(text(
        "SELECT DISTINCT sex FROM clean.fact_long")).scalars().all()
    assert set(rows) <= {"Both Sexes", "Male", "Female"}


def test_all_source_tables_present(conn):
    rows = conn.execute(text(
        "SELECT DISTINCT source_table FROM clean.fact_long")).scalars().all()
    assert len(rows) == 13  # 10 V1 core + industry/occupation/pay


def test_pay_rows_are_php_and_positive(conn):
    bad = conn.execute(text(
        "SELECT count(*) FROM clean.fact_long "
        "WHERE source_table='raw.average_pay_industry' "
        "AND value IS NOT NULL AND (unit <> 'PHP' OR value <= 0)")).scalar()
    assert bad == 0
    total = conn.execute(text(
        "SELECT count(*) FROM clean.fact_long "
        "WHERE source_table='raw.average_pay_industry' AND value IS NOT NULL")).scalar()
    assert total > 0


def test_category_rows_have_category(conn):
    # industry/occupation/pay rows must carry a category; V1 age-sex rows must not.
    missing = conn.execute(text(
        "SELECT count(*) FROM clean.fact_long "
        "WHERE source_table IN ('raw.employed_industry_2009','raw.employed_occupation_2012',"
        "'raw.average_pay_industry') AND category IS NULL")).scalar()
    assert missing == 0


def test_2026_present_and_partial(conn):
    # 2026 is an incomplete year: only the early months carry real values,
    # even though placeholder rows exist for all 12 months.
    months_with_data = conn.execute(text(
        "SELECT count(DISTINCT month_number) FROM clean.fact_long "
        "WHERE year=2026 AND period_type='monthly' AND value IS NOT NULL")).scalar()
    assert 0 < months_with_data < 12  # partial year


def test_kpis_have_four_rate_indicators(conn):
    n = conn.execute(text(
        "SELECT count(*) FROM analytics.dashboard_kpis "
        "WHERE unit='percent'")).scalar()
    assert n >= 4

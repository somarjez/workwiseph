from sqlalchemy import text
from backend.app.db.session import engine


def fetch_series(source_table, indicator, sex, period_type, age_group="Total"):
    sql = """
        SELECT year, month, value, unit
        FROM clean.fact_long
        WHERE source_table = :st AND sex = :sex
          AND period_type = :pt AND age_group = :ag
          AND (:ind IS NULL OR indicator_name = :ind)
        ORDER BY reference_date NULLS LAST
    """
    with engine.connect() as c:
        rows = c.execute(text(sql), {
            "st": source_table, "ind": indicator, "sex": sex,
            "pt": period_type, "ag": age_group}).mappings().all()
    return [dict(r) for r in rows]


def fetch_age_sex(source_table, sex, period_type):
    sql = """
        SELECT year, month, age_group, value, unit
        FROM clean.fact_long
        WHERE source_table = :st AND sex = :sex AND period_type = :pt
        ORDER BY reference_date NULLS LAST, age_group
    """
    with engine.connect() as c:
        rows = c.execute(text(sql), {
            "st": source_table, "sex": sex, "pt": period_type}).mappings().all()
    return [dict(r) for r in rows]


def fetch_category_latest(source_table):
    """Values per category at the latest period that has data, highest first."""
    sql = """
        WITH latest AS (
            SELECT max(reference_date) AS d FROM clean.fact_long
            WHERE source_table = :st AND value IS NOT NULL AND period_type = 'monthly'
        )
        SELECT category, value, unit, year, month
        FROM clean.fact_long
        WHERE source_table = :st AND value IS NOT NULL
          AND reference_date = (SELECT d FROM latest)
        ORDER BY value DESC
    """
    with engine.connect() as c:
        rows = c.execute(text(sql), {"st": source_table}).mappings().all()
    return [dict(r) for r in rows]


def fetch_series_for_category(source_table, category):
    """Monthly time series for one specific category (e.g. 'Mean Hours')."""
    sql = """
        SELECT year, month, value, unit
        FROM clean.fact_long
        WHERE source_table = :st AND category = :cat AND period_type = 'monthly'
        ORDER BY reference_date NULLS LAST
    """
    with engine.connect() as c:
        rows = c.execute(text(sql), {"st": source_table, "cat": category}).mappings().all()
    return [dict(r) for r in rows]


def fetch_total_series(source_table):
    """Time series for the aggregate (TOTAL) category."""
    sql = """
        SELECT year, month, value, unit
        FROM clean.fact_long
        WHERE source_table = :st AND category ILIKE 'total'
          AND period_type = 'monthly'
        ORDER BY reference_date NULLS LAST
    """
    with engine.connect() as c:
        rows = c.execute(text(sql), {"st": source_table}).mappings().all()
    return [dict(r) for r in rows]


def fetch_kpis():
    sql = """
        SELECT indicator_name, value, unit, reference_date, previous_value AS previous
        FROM analytics.dashboard_kpis
        ORDER BY unit, indicator_name
    """
    with engine.connect() as c:
        rows = c.execute(text(sql)).mappings().all()
    return [dict(r) for r in rows]

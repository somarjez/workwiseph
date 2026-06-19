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


def fetch_kpis():
    sql = """
        SELECT indicator_name, value, unit, reference_date
        FROM analytics.dashboard_kpis
        ORDER BY unit, indicator_name
    """
    with engine.connect() as c:
        rows = c.execute(text(sql)).mappings().all()
    return [dict(r) for r in rows]

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


def explore_options():
    """Per source_table, the distinct dimension values present (for the explorer UI)."""
    sql = """
        SELECT source_table,
               array_agg(DISTINCT indicator_name ORDER BY indicator_name) AS indicators,
               array_agg(DISTINCT sex) AS sexes,
               array_agg(DISTINCT age_group) AS age_groups,
               array_agg(DISTINCT category) FILTER (WHERE category IS NOT NULL) AS categories,
               max(unit) AS unit
        FROM clean.fact_long
        GROUP BY source_table
        ORDER BY source_table
    """
    with engine.connect() as c:
        rows = c.execute(text(sql)).mappings().all()
    return [dict(r) for r in rows]


def explore_series(source_table, indicator=None, sex=None, age_group=None,
                   category=None, period_type="monthly"):
    """Generic filtered long series. All filters except source are optional."""
    clauses = ["source_table = :source", "value IS NOT NULL", "period_type = :pt"]
    params = {"source": source_table, "pt": period_type}
    if indicator:
        clauses.append("indicator_name = :indicator"); params["indicator"] = indicator
    if sex:
        clauses.append("sex = :sex"); params["sex"] = sex
    if age_group:
        clauses.append("age_group = :age_group"); params["age_group"] = age_group
    if category:
        clauses.append("category = :category"); params["category"] = category
    sql = (
        "SELECT reference_date, year, month, sex, age_group, category, value, unit "
        "FROM clean.fact_long WHERE " + " AND ".join(clauses) +
        " ORDER BY reference_date NULLS LAST, category, age_group"
    )
    with engine.connect() as c:
        rows = c.execute(text(sql), params).mappings().all()
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

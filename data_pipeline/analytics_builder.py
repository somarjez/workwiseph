from __future__ import annotations
from sqlalchemy import text
from backend.app.db.session import engine

RATE_INDICATORS = ("Labor Force Participation Rate", "Employment Rate",
                   "Unemployment Rate", "Underemployment Rate")


def build_monthly_labor_summary() -> int:
    sql = """
    DROP TABLE IF EXISTS analytics.monthly_labor_summary;
    CREATE TABLE analytics.monthly_labor_summary AS
    SELECT reference_date, year, month_number,
           MAX(value) FILTER (WHERE indicator_name='Labor Force Participation Rate') AS lfpr,
           MAX(value) FILTER (WHERE indicator_name='Employment Rate')        AS employment_rate,
           MAX(value) FILTER (WHERE indicator_name='Unemployment Rate')      AS unemployment_rate,
           MAX(value) FILTER (WHERE indicator_name='Underemployment Rate')   AS underemployment_rate
    FROM clean.fact_long
    WHERE source_table='raw.lfs_rates' AND sex='Both Sexes'
      AND period_type='monthly' AND reference_date IS NOT NULL
    GROUP BY reference_date, year, month_number
    ORDER BY reference_date;
    """
    with engine.begin() as c:
        c.execute(text(sql))
        return c.execute(text("SELECT count(*) FROM analytics.monthly_labor_summary")).scalar()


def build_dashboard_kpis() -> int:
    sql = """
    DROP TABLE IF EXISTS analytics.dashboard_kpis;
    CREATE TABLE analytics.dashboard_kpis AS
    WITH latest AS (
      SELECT indicator_name, value, unit, reference_date,
             ROW_NUMBER() OVER (PARTITION BY indicator_name
                                ORDER BY reference_date DESC NULLS LAST) AS rn
      FROM clean.fact_long
      WHERE sex='Both Sexes' AND age_group='Total'
        AND period_type='monthly' AND value IS NOT NULL
        AND source_table IN ('raw.lfs_rates','raw.lfs_levels')
    )
    SELECT indicator_name, value, unit, reference_date
    FROM latest WHERE rn=1;
    """
    with engine.begin() as c:
        c.execute(text(sql))
        return c.execute(text("SELECT count(*) FROM analytics.dashboard_kpis")).scalar()

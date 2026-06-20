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
    # Latest value per indicator + the value from the same month a year earlier
    # (year-over-year), so the dashboard can show a delta.
    sql = """
    DROP TABLE IF EXISTS analytics.dashboard_kpis;
    CREATE TABLE analytics.dashboard_kpis AS
    WITH ranked AS (
      SELECT indicator_name, value, unit, reference_date, year, month_number, source_table,
             ROW_NUMBER() OVER (PARTITION BY indicator_name
                                ORDER BY reference_date DESC NULLS LAST) AS rn
      FROM clean.fact_long
      WHERE sex='Both Sexes' AND age_group='Total'
        AND period_type='monthly' AND value IS NOT NULL
        AND source_table IN ('raw.lfs_rates','raw.lfs_levels')
    ),
    latest AS (SELECT * FROM ranked WHERE rn=1)
    SELECT l.indicator_name, l.value, l.unit, l.reference_date,
           prev.value AS previous_value
    FROM latest l
    LEFT JOIN clean.fact_long prev
      ON prev.indicator_name = l.indicator_name
     AND prev.source_table = l.source_table
     AND prev.sex='Both Sexes' AND prev.age_group='Total'
     AND prev.period_type='monthly'
     AND prev.year = l.year - 1 AND prev.month_number = l.month_number;
    """
    with engine.begin() as c:
        c.execute(text(sql))
        return c.execute(text("SELECT count(*) FROM analytics.dashboard_kpis")).scalar()

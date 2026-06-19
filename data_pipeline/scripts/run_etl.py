from __future__ import annotations
from data_pipeline.config import TABLE_REGISTRY
from data_pipeline.loader import parse_and_clean, load_clean, reset_clean
from data_pipeline.analytics_builder import (
    build_monthly_labor_summary, build_dashboard_kpis)


def run_full_etl() -> dict[str, int]:
    counts: dict[str, int] = {}
    reset_clean()
    for spec in TABLE_REGISTRY:
        df = parse_and_clean(spec)
        counts[spec.key] = load_clean(df)
    counts["monthly_labor_summary"] = build_monthly_labor_summary()
    counts["dashboard_kpis"] = build_dashboard_kpis()
    return counts


if __name__ == "__main__":
    result = run_full_etl()
    total = sum(v for k, v in result.items()
                if k not in ("monthly_labor_summary", "dashboard_kpis"))
    print("ETL complete.")
    for k, v in result.items():
        print(f"  {k:28s} {v:>8d}")
    print(f"  {'TOTAL clean rows':28s} {total:>8d}")

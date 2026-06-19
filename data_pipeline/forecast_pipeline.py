"""Build forecasts/anomalies/metrics for the key rate indicators and persist to ml.*."""
from __future__ import annotations
from datetime import date
import pandas as pd
from sqlalchemy import text
from backend.app.db.session import engine
from data_pipeline.forecasting import (
    forecast_series, backtest_metrics, detect_anomalies)

TARGETS = [
    "Unemployment Rate", "Underemployment Rate",
    "Employment Rate", "Labor Force Participation Rate",
]
HORIZON = 6
SEASON = 12
MONTHLY_FROM = date(2021, 1, 1)


def monthly_rate_series(indicator: str) -> list[dict]:
    sql = """
        SELECT reference_date, value
        FROM clean.fact_long
        WHERE source_table = 'raw.lfs_rates' AND sex = 'Both Sexes'
          AND indicator_name = :ind AND period_type = 'monthly'
          AND value IS NOT NULL AND reference_date >= :from_date
        ORDER BY reference_date
    """
    with engine.connect() as c:
        rows = c.execute(text(sql), {"ind": indicator, "from_date": MONTHLY_FROM}).mappings().all()
    return [dict(r) for r in rows]


def _future_months(last: date, horizon: int) -> list[date]:
    months = pd.date_range(last, periods=horizon + 1, freq="MS")[1:]
    return [d.date() for d in months]


def run_forecasts() -> dict[str, int]:
    fc_rows, an_rows, mt_rows = [], [], []
    for indicator in TARGETS:
        series = monthly_rate_series(indicator)
        values = [r["value"] for r in series]
        dates = [r["reference_date"] for r in series]
        if not values:
            continue

        fc = forecast_series(values, HORIZON, SEASON)
        metrics = backtest_metrics(values, HORIZON, SEASON)
        flags = detect_anomalies(values, window=SEASON, z=3.0)

        for d, p, lo, up in zip(_future_months(dates[-1], HORIZON),
                                fc["point"], fc["lower"], fc["upper"]):
            fc_rows.append({"indicator": indicator, "horizon_month": d,
                            "value": p, "lower": lo, "upper": up,
                            "generated_at": pd.Timestamp.utcnow()})
        for d, v, fl in zip(dates, values, flags):
            an_rows.append({"indicator": indicator, "reference_date": d,
                            "value": v, "is_anomaly": bool(fl)})
        mt_rows.append({"indicator": indicator, "model": "holt-winters",
                        "mae": metrics["mae"], "rmse": metrics["rmse"],
                        "mape": metrics["mape"], "generated_at": pd.Timestamp.utcnow()})

    pd.DataFrame(fc_rows).to_sql("forecast_results", engine, schema="ml",
                                 if_exists="replace", index=False)
    pd.DataFrame(an_rows).to_sql("anomaly_results", engine, schema="ml",
                                 if_exists="replace", index=False)
    pd.DataFrame(mt_rows).to_sql("model_metrics", engine, schema="ml",
                                 if_exists="replace", index=False)
    return {"forecast_results": len(fc_rows),
            "anomaly_results": len(an_rows),
            "model_metrics": len(mt_rows)}

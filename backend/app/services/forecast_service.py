from data_pipeline.forecast_pipeline import (
    monthly_rate_series, _future_months, TARGETS, HORIZON, SEASON)
from data_pipeline.forecasting import (
    forecast_series, backtest_metrics, detect_anomalies)

VALID = set(TARGETS)


def forecast(indicator: str) -> dict:
    series = monthly_rate_series(indicator)
    values = [r["value"] for r in series]
    dates = [r["reference_date"] for r in series]
    if not values:
        return {"indicator": indicator, "history": [], "forecast": [], "metrics": {}}
    fc = forecast_series(values, HORIZON, SEASON)
    months = _future_months(dates[-1], HORIZON)
    forecast_pts = [
        {"month": m.isoformat(), "value": p, "lower": lo, "upper": up}
        for m, p, lo, up in zip(months, fc["point"], fc["lower"], fc["upper"])
    ]
    history = [{"reference_date": r["reference_date"].isoformat(), "value": r["value"]}
               for r in series]
    return {"indicator": indicator, "history": history,
            "forecast": forecast_pts, "metrics": backtest_metrics(values, HORIZON, SEASON)}


def anomalies(indicator: str) -> dict:
    series = monthly_rate_series(indicator)
    flags = detect_anomalies([r["value"] for r in series], window=SEASON, z=3.0)
    points = [{"reference_date": r["reference_date"].isoformat(),
               "value": r["value"], "is_anomaly": bool(f)}
              for r, f in zip(series, flags)]
    return {"indicator": indicator, "points": points}

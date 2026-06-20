from data_pipeline.forecast_pipeline import (
    monthly_rate_series, _future_months, TARGETS, HORIZON, SEASON)
from data_pipeline.forecasting import (
    FORECASTERS, ANOMALY_DETECTORS, backtest_metrics)

VALID = set(TARGETS)
FORECAST_METHODS = set(FORECASTERS)        # {"ets", "rf"}
ANOMALY_METHODS = set(ANOMALY_DETECTORS)   # {"zscore", "iforest"}


def forecast(indicator: str, method: str = "ets") -> dict:
    series = monthly_rate_series(indicator)
    values = [r["value"] for r in series]
    dates = [r["reference_date"] for r in series]
    if not values:
        return {"indicator": indicator, "method": method,
                "history": [], "forecast": [], "metrics": {}}
    fc = FORECASTERS[method](values, HORIZON, SEASON)
    months = _future_months(dates[-1], HORIZON)
    forecast_pts = [
        {"month": m.isoformat(), "value": p, "lower": lo, "upper": up}
        for m, p, lo, up in zip(months, fc["point"], fc["lower"], fc["upper"])
    ]
    history = [{"reference_date": r["reference_date"].isoformat(), "value": r["value"]}
               for r in series]
    return {"indicator": indicator, "method": method, "history": history,
            "forecast": forecast_pts,
            "metrics": backtest_metrics(values, HORIZON, SEASON, method=method)}


def anomalies(indicator: str, method: str = "zscore") -> dict:
    series = monthly_rate_series(indicator)
    detector = ANOMALY_DETECTORS[method]
    flags = detector([r["value"] for r in series])
    points = [{"reference_date": r["reference_date"].isoformat(),
               "value": r["value"], "is_anomaly": bool(f)}
              for r, f in zip(series, flags)]
    return {"indicator": indicator, "method": method, "points": points}

"""Pure forecasting / anomaly helpers (no database access).

Holt-Winters ETS with a seasonal-naive fallback, residual-based confidence
bands, rolling z-score anomaly detection, and a simple backtest for metrics.
"""
from __future__ import annotations
import warnings
import numpy as np

Z = 1.96  # ~95% band


def _clean(values) -> list[float]:
    return [float(v) for v in values if v is not None]


def forecast_series(values, horizon: int = 6, season: int = 12) -> dict:
    s = _clean(values)
    n = len(s)
    if n < 8:
        last = s[-1] if s else 0.0
        point = [last] * horizon
        sd = float(np.std(np.diff(s))) if n > 1 else 0.0
        return _band(point, sd)

    try:
        from statsmodels.tsa.holtwinters import ExponentialSmoothing
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            if n >= 2 * season:
                model = ExponentialSmoothing(
                    s, trend="add", seasonal="add", seasonal_periods=season,
                    initialization_method="estimated")
            else:
                model = ExponentialSmoothing(
                    s, trend="add", initialization_method="estimated")
            fit = model.fit(optimized=True)
            point = [float(x) for x in fit.forecast(horizon)]
            resid = np.asarray(s) - np.asarray(fit.fittedvalues)
            sd = float(np.std(resid)) if resid.size else 0.0
        if not all(np.isfinite(point)):
            raise ValueError("non-finite forecast")
    except Exception:
        # seasonal-naive: repeat the last full season
        if n >= season:
            point = [s[-season + (i % season)] for i in range(horizon)]
        else:
            point = [s[-1]] * horizon
        sd = float(np.std(np.diff(s))) if n > 1 else 0.0
    return _band(point, sd)


def _band(point: list[float], sd: float) -> dict:
    return {
        "point": [round(p, 4) for p in point],
        "lower": [round(p - Z * sd, 4) for p in point],
        "upper": [round(p + Z * sd, 4) for p in point],
    }


def _rf_features(series: list[float], i: int, season: int) -> list[float]:
    return [
        series[i - 1], series[i - 2], series[i - 3],
        series[i - season] if i - season >= 0 else series[i - 1],
        float(np.mean(series[i - 3:i])),
        float(np.mean(series[max(0, i - season):i])),
    ]


def forecast_series_rf(values, horizon: int = 6, season: int = 12) -> dict:
    """Random-forest regression on lag features, recursive multi-step forecast."""
    s = _clean(values)
    if len(s) < season + 6:
        return forecast_series(s, horizon, season)  # not enough history -> ETS/flat
    from sklearn.ensemble import RandomForestRegressor
    start = max(3, season)
    X = [_rf_features(s, i, season) for i in range(start, len(s))]
    y = s[start:]
    model = RandomForestRegressor(n_estimators=200, random_state=0)
    model.fit(X, y)
    sd = float(np.std(np.asarray(y) - model.predict(X)))
    hist = list(s)
    point = []
    for _ in range(horizon):
        i = len(hist)
        p = float(model.predict([_rf_features(hist, i, season)])[0])
        point.append(p)
        hist.append(p)
    return _band(point, sd)


FORECASTERS = {"ets": forecast_series, "rf": forecast_series_rf}


def backtest_metrics(values, horizon: int = 6, season: int = 12, method: str = "ets") -> dict:
    s = _clean(values)
    if len(s) <= horizon + 8:
        return {"mae": None, "rmse": None, "mape": None}
    train, test = s[:-horizon], s[-horizon:]
    forecaster = FORECASTERS.get(method, forecast_series)
    point = np.asarray(forecaster(train, horizon, season)["point"])
    actual = np.asarray(test)
    err = point - actual
    mae = float(np.mean(np.abs(err)))
    rmse = float(np.sqrt(np.mean(err ** 2)))
    nonzero = actual != 0
    mape = (float(np.mean(np.abs(err[nonzero] / actual[nonzero])) * 100)
            if nonzero.any() else None)
    return {"mae": round(mae, 4), "rmse": round(rmse, 4),
            "mape": round(mape, 4) if mape is not None else None}


def detect_anomalies(values, window: int = 12, z: float = 3.0) -> list[bool]:
    s = np.asarray([np.nan if v is None else float(v) for v in values], dtype=float)
    flags = [False] * len(s)
    for i in range(len(s)):
        if i < window or np.isnan(s[i]):
            continue
        win = s[i - window:i]
        win = win[~np.isnan(win)]
        if len(win) < window // 2:
            continue
        mu, sd = win.mean(), win.std()
        if sd > 0:
            if abs(s[i] - mu) / sd > z:
                flags[i] = True
        elif s[i] != mu:
            # perfectly flat baseline: any deviation is anomalous
            flags[i] = True
    return flags


def detect_anomalies_iforest(values, contamination: float = 0.05) -> list[bool]:
    """Isolation-Forest anomaly detection on (value, first-difference) features."""
    raw = [None if v is None else float(v) for v in values]
    idx = [i for i, v in enumerate(raw) if v is not None]
    flags = [False] * len(raw)
    if len(idx) < 12:
        return flags
    from sklearn.ensemble import IsolationForest
    feats = []
    for k, i in enumerate(idx):
        prev = raw[idx[k - 1]] if k > 0 else raw[i]
        feats.append([raw[i], raw[i] - prev])
    preds = IsolationForest(contamination=contamination, random_state=0).fit_predict(feats)
    for i, p in zip(idx, preds):
        if p == -1:
            flags[i] = True
    return flags


ANOMALY_DETECTORS = {"zscore": detect_anomalies, "iforest": detect_anomalies_iforest}

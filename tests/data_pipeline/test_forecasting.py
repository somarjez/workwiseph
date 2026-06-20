import math
from data_pipeline.forecasting import (
    forecast_series, forecast_series_rf, backtest_metrics,
    detect_anomalies, detect_anomalies_iforest)


def _seasonal_trend(n=36):
    # upward trend + 12-period seasonality
    return [10 + 0.5 * i + 3 * math.sin(2 * math.pi * (i % 12) / 12) for i in range(n)]


def test_forecast_shape_and_band():
    out = forecast_series(_seasonal_trend(36), horizon=6, season=12)
    assert len(out["point"]) == 6
    assert all(math.isfinite(p) for p in out["point"])
    for lo, p, up in zip(out["lower"], out["point"], out["upper"]):
        assert lo <= p <= up


def test_forecast_continues_uptrend():
    series = _seasonal_trend(36)
    out = forecast_series(series, horizon=6, season=12)
    # forecast mean should exceed the mean of the last season (series is rising)
    assert sum(out["point"]) / 6 > sum(series[-12:]) / 12


def test_short_series_flat_forecast():
    out = forecast_series([5.0, 5.5, 6.0, 6.2, 6.1], horizon=4)
    assert out["point"] == [6.1, 6.1, 6.1, 6.1]


def test_handles_none_values():
    out = forecast_series([None] + _seasonal_trend(30) + [None], horizon=3, season=12)
    assert len(out["point"]) == 3
    assert all(math.isfinite(p) for p in out["point"])


def test_detect_anomalies_flags_spike():
    series = [10.0] * 24
    series[20] = 99.0  # obvious spike
    flags = detect_anomalies(series, window=12, z=3.0)
    assert flags[20] is True
    assert not any(flags[:12])  # warm-up window never flagged


def test_backtest_metrics_nonnegative():
    m = backtest_metrics(_seasonal_trend(40), horizon=6, season=12)
    assert m["mae"] >= 0 and m["rmse"] >= 0 and m["mape"] >= 0


def test_rf_forecast_shape_and_band():
    out = forecast_series_rf(_seasonal_trend(48), horizon=6, season=12)
    assert len(out["point"]) == 6
    assert all(math.isfinite(p) for p in out["point"])
    for lo, p, up in zip(out["lower"], out["point"], out["upper"]):
        assert lo <= p <= up


def test_rf_backtest_metrics():
    m = backtest_metrics(_seasonal_trend(48), horizon=6, season=12, method="rf")
    assert m["mae"] >= 0 and m["rmse"] >= 0


def test_iforest_flags_spike():
    series = [10.0 + (i % 4) * 0.1 for i in range(40)]
    series[30] = 80.0  # clear outlier
    flags = detect_anomalies_iforest(series, contamination=0.05)
    assert flags[30] is True

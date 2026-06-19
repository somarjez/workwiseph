import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_forecast_default(client):
    r = client.get("/api/forecast")
    assert r.status_code == 200
    body = r.json()
    assert body["indicator"] == "Unemployment Rate"
    assert len(body["history"]) > 0
    assert len(body["forecast"]) == 6
    pt = body["forecast"][0]
    assert {"month", "value", "lower", "upper"} <= set(pt.keys())
    assert pt["lower"] <= pt["value"] <= pt["upper"]
    assert "mae" in body["metrics"]


def test_forecast_unknown_indicator(client):
    r = client.get("/api/forecast", params={"indicator": "Nope Rate"})
    assert r.status_code == 404


def test_anomalies(client):
    r = client.get("/api/anomalies", params={"indicator": "Underemployment Rate"})
    assert r.status_code == 200
    pts = r.json()["points"]
    assert len(pts) > 0
    assert all(isinstance(p["is_anomaly"], bool) for p in pts)

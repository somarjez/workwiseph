import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_worker_class(client):
    r = client.get("/api/worker-class")
    assert r.status_code == 200
    body = r.json()
    assert len(body["latest"]) > 0
    assert {"category", "value", "unit"} <= set(body["latest"][0].keys())


def test_hours_worked(client):
    r = client.get("/api/hours-worked")
    assert r.status_code == 200
    cats = {row["category"] for row in r.json()["latest"]}
    assert any("40" in c for c in cats)


def test_mean_hours(client):
    r = client.get("/api/mean-hours")
    assert r.status_code == 200
    series = r.json()["series"]
    assert len(series) > 0
    vals = [p["value"] for p in series if p["value"] is not None]
    assert vals and all(0 < v <= 80 for v in vals)
    assert series[0]["unit"] == "hours"

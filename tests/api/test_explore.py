import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_options(client):
    r = client.get("/api/explore/options")
    assert r.status_code == 200
    datasets = r.json()["datasets"]
    assert len(datasets) >= 15
    d0 = datasets[0]
    assert {"source", "label", "indicators", "has_sex", "has_age", "categories"} <= set(d0.keys())
    rates = next(d for d in datasets if d["source"] == "raw.lfs_rates")
    assert rates["has_sex"] is True
    assert "Unemployment Rate" in rates["indicators"]


def test_series_time(client):
    r = client.get("/api/explore/series", params={
        "source": "raw.lfs_rates", "indicator": "Unemployment Rate", "sex": "Both Sexes"})
    assert r.status_code == 200
    rows = r.json()["rows"]
    assert len(rows) > 50
    assert {"reference_date", "year", "value", "unit"} <= set(rows[0].keys())


def test_series_category(client):
    r = client.get("/api/explore/series", params={"source": "raw.employed_industry_2009"})
    assert r.status_code == 200
    assert len(r.json()["rows"]) > 0


def test_series_requires_source(client):
    assert client.get("/api/explore/series").status_code == 422

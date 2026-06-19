import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_rates_default(client):
    r = client.get("/api/labor/rates", params={"indicator": "Unemployment Rate"})
    assert r.status_code == 200
    body = r.json()
    assert body["indicator"] == "Unemployment Rate"
    assert body["sex"] == "Both Sexes"
    assert len(body["data"]) > 50
    assert body["data"][0]["unit"] == "percent"


def test_levels_default(client):
    r = client.get("/api/labor/levels", params={"indicator": "Employed Persons"})
    assert r.status_code == 200
    assert r.json()["data"][0]["unit"] == "persons"


def test_age_sex(client):
    r = client.get("/api/labor/age-sex", params={"source": "employed"})
    assert r.status_code == 200
    body = r.json()
    assert body["source"] == "employed"
    age_groups = {d["age_group"] for d in body["data"]}
    assert "Total" in age_groups and len(age_groups) >= 6


def test_age_sex_unknown_source(client):
    r = client.get("/api/labor/age-sex", params={"source": "nope"})
    assert r.status_code == 404

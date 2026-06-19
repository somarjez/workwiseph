import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_industry_employment(client):
    r = client.get("/api/industry/employment")
    assert r.status_code == 200
    body = r.json()
    assert len(body["latest"]) > 0
    assert {"category", "value", "unit"} <= set(body["latest"][0].keys())
    assert len(body["total_series"]) > 0


def test_occupation_employment(client):
    r = client.get("/api/occupation/employment")
    assert r.status_code == 200
    body = r.json()
    assert len(body["latest"]) > 0
    assert len(body["total_series"]) > 0


def test_pay_industry(client):
    r = client.get("/api/pay/industry")
    assert r.status_code == 200
    body = r.json()
    assert len(body["latest"]) > 0
    assert body["latest"][0]["unit"] == "PHP"
    assert all(row["value"] > 0 for row in body["latest"])

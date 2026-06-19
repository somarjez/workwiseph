import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_education_employment(client):
    r = client.get("/api/education/employment")
    assert r.status_code == 200
    body = r.json()
    assert len(body["latest"]) > 0
    assert {"category", "value", "unit"} <= set(body["latest"][0].keys())
    cats = {row["category"] for row in body["latest"]}
    assert any("College" in c for c in cats)


def test_education_underemployment(client):
    r = client.get("/api/education/underemployment")
    assert r.status_code == 200
    assert len(r.json()["latest"]) > 0

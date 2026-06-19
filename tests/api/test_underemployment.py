import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_summary(client):
    r = client.get("/api/underemployment/summary")
    assert r.status_code == 200
    body = r.json()
    assert body["rate"]["indicator"] == "Underemployment Rate"
    assert len(body["rate"]["data"]) > 50
    assert body["by_age"]["source"] == "underemployed"
    assert len(body["by_age"]["data"]) > 0


def test_visible_invisible(client):
    r = client.get("/api/underemployment/visible-invisible")
    assert r.status_code == 200
    body = r.json()
    assert len(body["visible"]) > 0 and len(body["invisible"]) > 0
    assert body["visible"][0]["unit"] == "persons"

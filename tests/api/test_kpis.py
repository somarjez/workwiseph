import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_kpis_endpoint(client):
    r = client.get("/api/kpis")
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list) and len(body) >= 4
    assert {"indicator_name", "value", "unit", "reference_date"} <= set(body[0].keys())

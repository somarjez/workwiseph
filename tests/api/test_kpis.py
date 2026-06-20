import pytest
pytestmark = pytest.mark.usefixtures("require_data")


def test_kpis_endpoint(client):
    r = client.get("/api/kpis")
    assert r.status_code == 200
    body = r.json()
    assert isinstance(body, list) and len(body) >= 4
    assert {"indicator_name", "value", "unit", "reference_date", "previous"} <= set(body[0].keys())
    # at least one KPI has a prior-year value for the YoY delta
    assert any(k["previous"] is not None for k in body)

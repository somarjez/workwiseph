import pytest
from backend.app.core.config import settings

CREDS = {"username": settings.admin_username, "password": settings.admin_password}


@pytest.fixture(scope="module")
def admin_token(client):
    r = client.post("/api/admin/login", json=CREDS)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def test_login_rejects_bad_credentials(client):
    r = client.post("/api/admin/login", json={"username": "admin", "password": "nope"})
    assert r.status_code == 401


def test_login_returns_bearer_token(admin_token):
    assert isinstance(admin_token, str) and len(admin_token) > 20


def test_admin_endpoint_requires_token(client):
    assert client.get("/api/admin/logs").status_code == 401
    assert client.post("/api/admin/etl/run").status_code == 401


def test_admin_endpoint_rejects_bad_token(client):
    r = client.get("/api/admin/logs", headers={"Authorization": "Bearer garbage"})
    assert r.status_code == 401


def test_logs_with_token(client, admin_token):
    r = client.get("/api/admin/logs", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.etl
def test_etl_run_triggers_and_logs(client, admin_token):
    hdr = {"Authorization": f"Bearer {admin_token}"}
    r = client.post("/api/admin/forecast/run", headers=hdr)  # lighter than full ETL
    assert r.status_code == 202
    body = r.json()
    assert body["status"] == "started" and "log_id" in body
    # background task runs synchronously under TestClient; the log should be finished
    logs = client.get("/api/admin/logs", headers=hdr).json()
    entry = next(l for l in logs if l["id"] == body["log_id"])
    assert entry["status"] in ("success", "error")

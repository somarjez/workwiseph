import io
import pytest
from backend.app.core.config import settings

CREDS = {"username": settings.admin_username, "password": settings.admin_password}


@pytest.fixture(scope="module")
def admin_token(client):
    return client.post("/api/admin/login", json=CREDS).json()["access_token"]


def _hdr(tok):
    return {"Authorization": f"Bearer {tok}"}


def test_upload_requires_auth(client):
    r = client.post("/api/admin/upload",
                    files={"file": ("x.csv", b"a,b\n1,2", "text/csv")})
    assert r.status_code == 401


def test_upload_rejects_non_csv(client, admin_token):
    r = client.post("/api/admin/upload", headers=_hdr(admin_token),
                    files={"file": ("data.txt", b"hello", "text/plain")})
    assert r.status_code == 400


def test_upload_rejects_empty(client, admin_token):
    r = client.post("/api/admin/upload", headers=_hdr(admin_token),
                    files={"file": ("empty.csv", b"", "text/csv")})
    assert r.status_code == 400


def test_upload_valid_csv(client, admin_token):
    csv = b"year,indicator,value\n2026,Unemployment Rate,5.0\n2026,Employment Rate,95.0\n"
    r = client.post("/api/admin/upload", headers=_hdr(admin_token),
                    files={"file": ("rates.csv", csv, "text/csv")})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["status"] == "ok"
    assert body["rows"] == 2
    assert "year" in body["columns"]

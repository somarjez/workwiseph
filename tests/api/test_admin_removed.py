def test_admin_login_route_is_removed(client):
    response = client.post("/api/admin/login", json={})
    assert response.status_code == 404


def test_admin_operations_routes_are_removed(client):
    assert client.get("/api/admin/logs").status_code == 404
    assert client.post("/api/admin/etl/run").status_code == 404
    assert client.post("/api/admin/forecast/run").status_code == 404
    assert client.post("/api/admin/upload").status_code == 404

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from tests.integration.conftest import data_is_complete


@pytest.fixture(scope="session")
def client():
    return TestClient(app)


@pytest.fixture(scope="session")
def require_data():
    if not data_is_complete():
        pytest.skip("DB not loaded — run python -m data_pipeline.scripts.run_etl")

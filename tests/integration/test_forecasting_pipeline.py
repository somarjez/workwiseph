import pytest
from sqlalchemy import text
from backend.app.db.session import engine
from data_pipeline.forecast_pipeline import run_forecasts, TARGETS

pytestmark = pytest.mark.etl  # writes ml.* tables; run with -m etl


def test_run_forecasts_populates_ml_tables():
    counts = run_forecasts()
    assert counts["forecast_results"] == len(TARGETS) * 6
    assert counts["model_metrics"] == len(TARGETS)
    assert counts["anomaly_results"] > 0

    with engine.connect() as c:
        n_ind = c.execute(text(
            "SELECT count(DISTINCT indicator) FROM ml.forecast_results")).scalar()
        assert n_ind == len(TARGETS)
        # every forecast row has a numeric band with lower <= value <= upper
        bad = c.execute(text(
            "SELECT count(*) FROM ml.forecast_results "
            "WHERE NOT (lower <= value AND value <= upper)")).scalar()
        assert bad == 0

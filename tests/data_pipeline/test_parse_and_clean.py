from data_pipeline.config import TABLE_REGISTRY
from data_pipeline.loader import parse_and_clean


def _spec(key):
    return next(t for t in TABLE_REGISTRY if t.key == key)


def test_parse_and_clean_rates_nonempty():
    # Reads the real source xlsx (no database access).
    df = parse_and_clean(_spec("rates"))
    assert len(df) > 100
    assert set(df["unit"].unique()) == {"percent"}
    assert "Both Sexes" in df["sex"].unique()
    assert "Both sexes" not in df["sex"].unique()

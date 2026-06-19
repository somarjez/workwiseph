import pandas as pd
from sqlalchemy import text
from backend.app.db.session import engine
from data_pipeline.config import TABLE_REGISTRY
from data_pipeline.loader import parse_and_clean, load_clean, reset_clean


def _spec(key):
    return next(t for t in TABLE_REGISTRY if t.key == key)


def test_parse_and_clean_rates_nonempty():
    df = parse_and_clean(_spec("rates"))
    assert len(df) > 100
    assert set(df["unit"].unique()) == {"percent"}
    assert "Both Sexes" in df["sex"].unique()
    assert "Both sexes" not in df["sex"].unique()


def test_load_clean_roundtrip():
    reset_clean()
    df = parse_and_clean(_spec("rates"))
    n = load_clean(df)
    with engine.connect() as c:
        count = c.execute(text(
            "select count(*) from clean.fact_long where source_table='raw.lfs_rates'"
        )).scalar()
    assert count == n == len(df)

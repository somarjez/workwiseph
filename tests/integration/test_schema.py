import pytest
from sqlalchemy import text, inspect
from backend.app.db.session import engine
from backend.app.db.base import SCHEMAS


@pytest.fixture(scope="module")
def conn():
    with engine.connect() as c:
        yield c


def test_all_schemas_exist(conn):
    rows = conn.execute(text(
        "select schema_name from information_schema.schemata")).scalars().all()
    for s in SCHEMAS:
        assert s in rows, f"missing schema {s}"


def test_fact_long_table_exists(conn):
    insp = inspect(engine)
    assert insp.has_table("fact_long", schema="clean")


def test_fact_long_columns(conn):
    insp = inspect(engine)
    cols = {c["name"] for c in insp.get_columns("fact_long", schema="clean")}
    expected = {"id", "year", "month", "month_number", "period_type",
                "reference_date", "sex", "age_group", "category", "indicator_name",
                "value", "unit", "source_table", "source_updated_at"}
    assert expected.issubset(cols)

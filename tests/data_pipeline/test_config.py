from pathlib import Path
from data_pipeline.config import settings, TABLE_REGISTRY


def test_database_url_loaded():
    assert settings.database_url.startswith("postgresql")


def test_datasets_dir_exists():
    assert settings.datasets_dir.is_dir()


def test_registry_has_core_and_v2_tables():
    keys = {t.key for t in TABLE_REGISTRY}
    core = {
        "rates", "levels", "population", "labor_force", "employed",
        "unemployed", "underemployed", "not_in_labor_force",
        "visible_underemployed", "invisible_underemployed",
    }
    v2 = {"employed_industry", "employed_occupation", "average_pay_industry"}
    assert core <= keys
    assert v2 <= keys
    assert keys == core | v2


def test_every_registry_file_exists():
    for t in TABLE_REGISTRY:
        assert (settings.datasets_dir / t.filename).is_file(), t.filename

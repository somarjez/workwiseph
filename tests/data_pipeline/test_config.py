from pathlib import Path
from data_pipeline.config import settings, TABLE_REGISTRY


def test_database_url_loaded():
    assert settings.database_url.startswith("postgresql")


def test_datasets_dir_exists():
    assert settings.datasets_dir.is_dir()


def test_registry_has_ten_core_tables():
    keys = {t.key for t in TABLE_REGISTRY}
    expected = {
        "rates", "levels", "population", "labor_force", "employed",
        "unemployed", "underemployed", "not_in_labor_force",
        "visible_underemployed", "invisible_underemployed",
    }
    assert keys == expected


def test_every_registry_file_exists():
    for t in TABLE_REGISTRY:
        assert (settings.datasets_dir / t.filename).is_file(), t.filename

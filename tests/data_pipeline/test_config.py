from pathlib import Path
from data_pipeline.config import normalize_database_url, settings, TABLE_REGISTRY


def test_generic_postgres_urls_select_installed_psycopg2_driver():
    assert (
        normalize_database_url("postgresql://user:pass@host/db")
        == "postgresql+psycopg2://user:pass@host/db"
    )
    assert (
        normalize_database_url("postgres://user:pass@host/db")
        == "postgresql+psycopg2://user:pass@host/db"
    )


def test_explicit_database_driver_is_preserved():
    url = "postgresql+psycopg2://user:pass@host/db"

    assert normalize_database_url(url) == url


def test_database_url_loaded():
    assert settings.database_url.startswith("postgresql+psycopg2://")


def test_datasets_dir_exists():
    assert settings.datasets_dir.is_dir()


def test_registry_has_core_and_v2_tables():
    keys = {t.key for t in TABLE_REGISTRY}
    core = {
        "rates", "levels", "population", "labor_force", "employed",
        "unemployed", "underemployed", "not_in_labor_force",
        "visible_underemployed", "invisible_underemployed",
    }
    v2 = {"employed_industry", "employed_occupation", "average_pay_industry",
          "education_employed", "education_underemployed",
          "worker_class", "hours_worked", "mean_hours"}
    assert core <= keys
    assert v2 <= keys
    assert keys == core | v2


def test_every_registry_file_exists():
    for t in TABLE_REGISTRY:
        assert (settings.datasets_dir / t.filename).is_file(), t.filename

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool, text
from alembic import context

# Ensure repo root is importable regardless of invocation directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from data_pipeline.config import settings              # noqa: E402
from backend.app.db.base import Base, SCHEMAS          # noqa: E402
import backend.app.db.models                           # noqa: E402,F401  (register models)

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)
if config.config_file_name:
    fileConfig(config.config_file_name)
target_metadata = Base.metadata


# Schemas whose tables are defined by ORM models (Alembic manages these).
# Pipeline-built schemas (raw/analytics/ml) are created via to_sql/CREATE TABLE AS
# and must be excluded, or autogenerate would try to drop them.
ORM_SCHEMAS = {"clean", "auth", "logs"}


def _include_object(obj, name, type_, reflected, compare_to):
    if type_ == "table" and obj.schema not in ORM_SCHEMAS:
        return False
    return True


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        for s in SCHEMAS:
            connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{s}"'))
        connection.commit()
        context.configure(connection=connection, target_metadata=target_metadata,
                          include_schemas=True, include_object=_include_object)
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()

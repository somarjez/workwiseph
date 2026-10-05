from sqlalchemy.orm import DeclarativeBase

# auth/logs remain here only so a fresh database can replay migration 0003
# before migration 0004 removes its tables.
SCHEMAS = ["raw", "clean", "analytics", "ml", "auth", "logs"]


class Base(DeclarativeBase):
    pass

from sqlalchemy.orm import DeclarativeBase

SCHEMAS = ["raw", "clean", "analytics", "ml", "auth", "logs"]


class Base(DeclarativeBase):
    pass

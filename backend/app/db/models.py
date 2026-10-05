from datetime import date, datetime
from sqlalchemy import String, Integer, Float, Date, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column
from backend.app.db.base import Base


class FactLong(Base):
    __tablename__ = "fact_long"
    __table_args__ = (
        Index("ix_fact_long_lookup", "source_table", "year", "month_number"),
        Index("ix_fact_long_indicator", "indicator_name", "sex", "age_group"),
        Index("ix_fact_long_category", "source_table", "category"),
        {"schema": "clean"},
    )
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[str] = mapped_column(String(16), nullable=False)
    month_number: Mapped[int | None] = mapped_column(Integer)
    period_type: Mapped[str] = mapped_column(String(16), nullable=False)
    reference_date: Mapped[date | None] = mapped_column(Date)
    sex: Mapped[str] = mapped_column(String(16), nullable=False)
    age_group: Mapped[str] = mapped_column(String(32), nullable=False)
    category: Mapped[str | None] = mapped_column(String(96))
    indicator_name: Mapped[str] = mapped_column(String(80), nullable=False)
    value: Mapped[float | None] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(16), nullable=False)
    source_table: Mapped[str] = mapped_column(String(64), nullable=False)
    source_updated_at: Mapped[datetime] = mapped_column(DateTime)

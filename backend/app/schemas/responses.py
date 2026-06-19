from datetime import date
from pydantic import BaseModel


class Point(BaseModel):
    year: int
    month: str | None
    value: float | None
    unit: str


class Series(BaseModel):
    indicator: str
    sex: str
    period: str
    data: list[Point]


class Kpi(BaseModel):
    indicator_name: str
    value: float | None
    unit: str
    reference_date: date | None

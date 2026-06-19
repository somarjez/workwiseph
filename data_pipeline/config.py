from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
from dotenv import load_dotenv
import os

REPO_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(REPO_ROOT / "backend" / ".env")


@dataclass(frozen=True)
class Settings:
    database_url: str
    datasets_dir: Path


settings = Settings(
    database_url=os.environ.get("DATABASE_URL", ""),
    datasets_dir=REPO_ROOT / "datasets",
)


@dataclass(frozen=True)
class TableSpec:
    key: str
    filename: str
    archetype: str            # "key_indicator" | "age_sex"
    unit: str                 # "percent" | "persons"
    source_table: str
    indicators: list[str] = field(default_factory=list)


TABLE_REGISTRY: list[TableSpec] = [
    TableSpec("rates", "2 Rates Key Employment Indicators.xlsx", "key_indicator",
              "percent", "raw.lfs_rates",
              ["Labor Force Participation Rate", "Employment Rate",
               "Unemployment Rate", "Underemployment Rate"]),
    TableSpec("levels", "1 Levels of Key Employment Indicators.xlsx", "key_indicator",
              "persons", "raw.lfs_levels",
              ["Total Population 15 Years Old and Over", "Persons in the Labor Force",
               "Employed Persons", "Unemployed Persons", "Underemployed Persons"]),
    TableSpec("population", "3 Population 15 Years Old and Over by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.population_age_sex"),
    TableSpec("labor_force", "4 Persons in the Labor Force by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.labor_force_age_sex"),
    TableSpec("employed", "5 Employed Persons by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.employed_age_sex"),
    TableSpec("unemployed", "6 Unemployed Persons by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.unemployed_age_sex"),
    TableSpec("underemployed", "7 Underemployed Persons by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.underemployed_age_sex"),
    TableSpec("not_in_labor_force", "8 Persons Not in the Labor Force by Sex and by Age Group.xlsx",
              "age_sex", "persons", "raw.not_in_labor_force_age_sex"),
    TableSpec("visible_underemployed",
              "17 Visibly Underemployed Persons by Sex and by Age Group April 2005 to April 2026.xlsx",
              "age_sex", "persons", "raw.visible_underemployed_age_sex"),
    TableSpec("invisible_underemployed",
              "18 Invisibly Underemployed Persons by Sex and by Age Group April 2005 to April 2026.xlsx",
              "age_sex", "persons", "raw.invisible_underemployed_age_sex"),
]

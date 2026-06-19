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
    # --- V2.1: industry & occupation ---
    TableSpec("employed_industry",
              "10 Number of Employed Persons by Major Industry Group.xlsx",
              "category", "persons", "raw.employed_industry_2009"),
    TableSpec("employed_occupation",
              "12 Number of Employed Persons by Major Occupation Group (2012 PSOC Code) April 2016 to April 2026.xlsx",
              "category", "persons", "raw.employed_occupation_2012"),
    TableSpec("average_pay_industry",
              "16 Average Daily Basic Pay of Wage and Salary Workers by Major Industry Group, Philippines 2016 to April 2026 (in Php).xlsx",
              "pay_matrix", "PHP", "raw.average_pay_industry"),
    # --- V2.2: education ---
    TableSpec("education_employed",
              "14 Number of Employed Persons by Highest Grade Completed (2017 PSCED) January 2023 to April 2026.xlsx",
              "category", "persons", "raw.education_employed"),
    TableSpec("education_underemployed",
              "15 Number of Underemployed Persons by Highest Grade Completed (2017 PSCED) January 2023 to April 2026.xlsx",
              "category", "persons", "raw.education_underemployed"),
    # --- V2.3: workforce composition ---
    TableSpec("worker_class",
              "13 Number of Employed Persons by Class of Worker.xlsx",
              "category", "persons", "raw.class_of_worker"),
    TableSpec("hours_worked",
              "20 Number of Employed Persons by Hours Worked April 2005 to April 2026.xlsx",
              "category", "persons", "raw.hours_worked"),
    TableSpec("mean_hours",
              "19 Mean Hours Worked in One Week April 2005 to April 2026.xlsx",
              "category", "hours", "raw.mean_hours_worked"),
]

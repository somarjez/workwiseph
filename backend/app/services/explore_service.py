from backend.app.repositories import labor_repository as repo

# Friendly labels for the explorable datasets.
DATASET_LABELS = {
    "raw.lfs_rates": "Key rates (LFPR, employment, unemployment, underemployment)",
    "raw.lfs_levels": "Key levels (population, labor force, employed, …)",
    "raw.population_age_sex": "Population 15+ by age & sex",
    "raw.labor_force_age_sex": "Labor force by age & sex",
    "raw.employed_age_sex": "Employed by age & sex",
    "raw.unemployed_age_sex": "Unemployed by age & sex",
    "raw.underemployed_age_sex": "Underemployed by age & sex",
    "raw.not_in_labor_force_age_sex": "Not in labor force by age & sex",
    "raw.visible_underemployed_age_sex": "Visibly underemployed by age & sex",
    "raw.invisible_underemployed_age_sex": "Invisibly underemployed by age & sex",
    "raw.employed_industry_2009": "Employed by industry",
    "raw.employed_occupation_2012": "Employed by occupation",
    "raw.average_pay_industry": "Average daily basic pay by industry",
    "raw.education_employed": "Employed by education",
    "raw.education_underemployed": "Underemployed by education",
    "raw.class_of_worker": "Employed by class of worker",
    "raw.hours_worked": "Employed by hours worked",
    "raw.mean_hours_worked": "Mean hours worked per week",
}


def options() -> dict:
    raw = repo.explore_options()
    datasets = []
    for r in raw:
        cats = r.get("categories") or []
        ages = [a for a in (r.get("age_groups") or []) if a and a != "Total"]
        sexes = [s for s in (r.get("sexes") or []) if s and s != "Both Sexes"]
        datasets.append({
            "source": r["source_table"],
            "label": DATASET_LABELS.get(r["source_table"], r["source_table"]),
            "unit": r["unit"],
            "indicators": sorted(r.get("indicators") or []),
            "has_sex": len(sexes) > 0,
            "has_age": len(ages) > 0,
            "categories": sorted(cats),
        })
    datasets.sort(key=lambda d: d["label"])
    return {"datasets": datasets}


def series(source, indicator=None, sex=None, age_group=None, category=None,
           period_type="monthly") -> dict:
    rows = repo.explore_series(source, indicator, sex, age_group, category, period_type)
    return {"source": source, "rows": rows}

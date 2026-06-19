from backend.app.repositories import labor_repository as repo

INDUSTRY = "raw.employed_industry_2009"
OCCUPATION = "raw.employed_occupation_2012"
PAY = "raw.average_pay_industry"


def industry() -> dict:
    return {
        "latest": repo.fetch_category_latest(INDUSTRY),
        "total_series": repo.fetch_total_series(INDUSTRY),
    }


def occupation() -> dict:
    return {
        "latest": repo.fetch_category_latest(OCCUPATION),
        "total_series": repo.fetch_total_series(OCCUPATION),
    }


def pay() -> dict:
    return {"latest": repo.fetch_category_latest(PAY)}

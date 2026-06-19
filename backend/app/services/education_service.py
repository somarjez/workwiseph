from backend.app.repositories import labor_repository as repo

EMPLOYED = "raw.education_employed"
UNDEREMPLOYED = "raw.education_underemployed"


def employment() -> dict:
    return {
        "latest": repo.fetch_category_latest(EMPLOYED),
        "total_series": repo.fetch_total_series(EMPLOYED),
    }


def underemployment() -> dict:
    return {
        "latest": repo.fetch_category_latest(UNDEREMPLOYED),
        "total_series": repo.fetch_total_series(UNDEREMPLOYED),
    }

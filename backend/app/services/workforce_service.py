from backend.app.repositories import labor_repository as repo

WORKER_CLASS = "raw.class_of_worker"
HOURS = "raw.hours_worked"
MEAN_HOURS = "raw.mean_hours_worked"


def worker_class() -> dict:
    return {
        "latest": repo.fetch_category_latest(WORKER_CLASS),
        "total_series": repo.fetch_total_series(WORKER_CLASS),
    }


def hours_worked() -> dict:
    return {
        "latest": repo.fetch_category_latest(HOURS),
        "total_series": repo.fetch_total_series(HOURS),
    }


def mean_hours() -> dict:
    return {"series": repo.fetch_series_for_category(MEAN_HOURS, "Mean Hours")}

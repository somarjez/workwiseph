from fastapi import APIRouter
from backend.app.services import workforce_service

router = APIRouter(tags=["workforce"])


@router.get("/worker-class")
def worker_class():
    return workforce_service.worker_class()


@router.get("/hours-worked")
def hours_worked():
    return workforce_service.hours_worked()


@router.get("/mean-hours")
def mean_hours():
    return workforce_service.mean_hours()

from fastapi import APIRouter
from backend.app.services import education_service

router = APIRouter(prefix="/education", tags=["education"])


@router.get("/employment")
def education_employment():
    return education_service.employment()


@router.get("/underemployment")
def education_underemployment():
    return education_service.underemployment()

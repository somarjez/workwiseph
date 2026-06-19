from fastapi import APIRouter
from backend.app.services import sector_service

router = APIRouter(tags=["sectors"])


@router.get("/industry/employment")
def industry_employment():
    return sector_service.industry()


@router.get("/occupation/employment")
def occupation_employment():
    return sector_service.occupation()


@router.get("/pay/industry")
def pay_industry():
    return sector_service.pay()

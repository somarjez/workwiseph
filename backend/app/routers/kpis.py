from fastapi import APIRouter
from backend.app.services import labor_service
from backend.app.schemas.responses import Kpi

router = APIRouter(tags=["kpis"])


@router.get("/kpis", response_model=list[Kpi])
def kpis():
    return labor_service.get_kpis()

from fastapi import APIRouter
from app.services.data_service import get_all_districts

router = APIRouter()

@router.get("/districts")
def fetch_districts():
    return get_all_districts()
from fastapi import APIRouter

from app.services.ai_policy_service import get_scheme_recommendation

router = APIRouter()


@router.get("/scheme-recommendation/{district_name}")
def scheme_recommendation(district_name: str):
    return get_scheme_recommendation(district_name)

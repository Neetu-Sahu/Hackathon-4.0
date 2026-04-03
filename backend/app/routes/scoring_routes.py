from fastapi import APIRouter
from app.services.scoring_service import compute_priority_scores

router = APIRouter()

@router.get("/priority-ranking")
def priority_ranking():
    return compute_priority_scores()
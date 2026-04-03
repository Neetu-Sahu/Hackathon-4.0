from fastapi import APIRouter, Query

from app.services.ai_policy_service import PolicySimulator

router = APIRouter()


def _run_simulation(increase: int, category: str):
    simulator = PolicySimulator()
    return simulator.simulate(funding_percentage=increase, category=category)


@router.get("/simulate/education")
def simulate_education(
    increase: int = Query(...),
    category: str = Query("education"),
):
    return _run_simulation(increase=increase, category=category)


@router.get("/simulate/{category}")
def simulate_by_category(
    category: str,
    increase: int = Query(...),
):
    return _run_simulation(increase=increase, category=category)

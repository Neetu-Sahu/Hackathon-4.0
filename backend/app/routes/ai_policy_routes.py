from fastapi import APIRouter
from app.services.ai_policy_service import generate_response
from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str
    
router = APIRouter()

@router.post("/ai-policy-advisor")
def ai_policy_advisor(request: QueryRequest):
    return generate_response(request.query)
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.chatbot_service import get_chatbot_reply

router = APIRouter()


class ChatHistoryItem(BaseModel):
    role: str = Field(default="user")
    content: str = Field(..., min_length=1)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    history: list[ChatHistoryItem] = Field(default_factory=list)
    current_language: Literal["en", "hi"] = "en"


@router.post("/api/chatbot")
def chatbot_endpoint(request: ChatRequest):
    result = get_chatbot_reply(
        message=request.message,
        history=[item.model_dump() for item in request.history],
        current_language=request.current_language,
    )
    return result


@router.post("/chat")
def legacy_chat_endpoint(request: ChatRequest):
    result = get_chatbot_reply(
        message=request.message,
        history=[item.model_dump() for item in request.history],
        current_language=request.current_language,
    )
    return {"response": result["answer"]}

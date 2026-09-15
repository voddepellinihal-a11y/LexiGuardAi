from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.services.main_service import ChatService
from app.schemas.responses import ChatRequest, ChatResponse
from typing import List

router = APIRouter(prefix="/documents", tags=["chat"])


@router.post("/{document_id}/chat", response_model=ChatResponse)
async def chat_about_document(
    document_id: str,
    request: ChatRequest,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = ChatService(supabase)
    try:
        result = await service.ask_question(
            document_id=document_id,
            user_id=user["user_id"],
            question=request.question,
        )
        return ChatResponse(
            answer=result["answer"],
            grounded=result.get("grounded", False),
            citations=result.get("citations", []),
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Chat failed")

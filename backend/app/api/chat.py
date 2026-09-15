from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.services.main_service import ChatService
from app.schemas.responses import ChatRequest, ChatResponse

router = APIRouter(prefix="/documents", tags=["chat"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/{document_id}/chat", response_model=ChatResponse)
@limiter.limit("20/minute")
async def chat_about_document(
    request: Request,
    document_id: UUID,
    body: ChatRequest,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = ChatService(supabase)
    try:
        result = await service.ask_question(
            document_id=str(document_id),
            user_id=user["user_id"],
            question=body.question,
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

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.services.main_service import ConsultationService
from app.schemas.responses import ConsultationSheetResponse

router = APIRouter(prefix="/documents", tags=["consultation"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/{document_id}/consultation-sheet")
@limiter.limit("10/minute")
async def generate_consultation_sheet(
    request: Request,
    document_id: UUID,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = ConsultationService(supabase)
    try:
        sheet = await service.generate_sheet(str(document_id), user["user_id"])
        return ConsultationSheetResponse(
            id=sheet["id"],
            document_id=document_id,
            content=sheet["content"],
            created_at=sheet["created_at"],
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to generate consultation sheet")


@router.get("/{document_id}/consultation-sheet")
async def get_consultation_sheet(
    document_id: UUID,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = ConsultationService(supabase)
    sheet = await service.get_sheet(str(document_id), user["user_id"])
    if not sheet:
        raise HTTPException(status_code=404, detail="No consultation sheet found")
    return sheet

from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.services.main_service import ConsultationService
from app.schemas.responses import ConsultationSheetResponse

router = APIRouter(prefix="/documents", tags=["consultation"])


@router.post("/{document_id}/consultation-sheet")
async def generate_consultation_sheet(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = ConsultationService(supabase)
    try:
        sheet = await service.generate_sheet(document_id, user["user_id"])
        return ConsultationSheetResponse(
            id=sheet["id"],
            document_id=document_id,
            content=sheet["content"],
            created_at=sheet["created_at"],
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to generate consultation sheet")


@router.get("/{document_id}/consultation-sheet")
async def get_consultation_sheet(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = ConsultationService(supabase)
    sheet = await service.get_sheet(document_id, user["user_id"])
    if not sheet:
        raise HTTPException(status_code=404, detail="No consultation sheet found")
    return sheet

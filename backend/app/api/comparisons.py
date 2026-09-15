from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.services.main_service import ComparisonService
from app.schemas.responses import ComparisonRequest, ComparisonResponse

router = APIRouter(prefix="/comparisons", tags=["comparisons"])
limiter = Limiter(key_func=get_remote_address)


@router.post("", response_model=ComparisonResponse)
@limiter.limit("10/minute")
async def create_comparison(
    request: Request,
    body: ComparisonRequest,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = ComparisonService(supabase)
    try:
        result = await service.compare_documents(
            document_a_id=str(body.document_a_id),
            document_b_id=str(body.document_b_id),
            user_id=user["user_id"],
        )
        return ComparisonResponse(
            id=result["comparison_id"],
            document_a_id=body.document_a_id,
            document_b_id=body.document_b_id,
            status=result["status"],
            changes=result.get("changes", []),
            created_at=datetime.now(timezone.utc),
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Comparison failed")


@router.get("/{comparison_id}", response_model=ComparisonResponse)
async def get_comparison(
    comparison_id: UUID,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = ComparisonService(supabase)
    comparison = await service.get_comparison(str(comparison_id), user["user_id"])
    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found")
    return comparison

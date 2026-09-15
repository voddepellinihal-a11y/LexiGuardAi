from fastapi import APIRouter, Depends, HTTPException
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.services.main_service import ComparisonService
from app.schemas.responses import ComparisonRequest, ComparisonResponse, ComparisonChangeResponse

router = APIRouter(prefix="/comparisons", tags=["comparisons"])


@router.post("", response_model=ComparisonResponse)
async def create_comparison(
    request: ComparisonRequest,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = ComparisonService(supabase)
    try:
        result = await service.compare_documents(
            document_a_id=str(request.document_a_id),
            document_b_id=str(request.document_b_id),
            user_id=user["user_id"],
        )
        return ComparisonResponse(
            id=result["comparison_id"],
            document_a_id=request.document_a_id,
            document_b_id=request.document_b_id,
            status=result["status"],
            changes=result.get("changes", []),
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Comparison failed")


@router.get("/{comparison_id}", response_model=ComparisonResponse)
async def get_comparison(
    comparison_id: str,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = ComparisonService(supabase)
    comparison = await service.get_comparison(comparison_id, user["user_id"])
    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found")
    return comparison

from datetime import datetime, timezone
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.services.main_service import AnalysisService
from app.schemas.responses import AnalysisRequest, AnalysisResponse, RiskFindingResponse, ObligationResponse, DeadlineResponse
from typing import List

router = APIRouter(prefix="/documents", tags=["analysis"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/{document_id}/analyze", response_model=AnalysisResponse)
@limiter.limit("10/minute")
async def analyze_document(
    request: Request,
    document_id: UUID,
    body: AnalysisRequest,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = AnalysisService(supabase)
    try:
        result = await service.run_analysis(
            document_id=str(document_id),
            user_id=user["user_id"],
            role=body.role.value,
            stance=body.negotiation_stance.value,
        )
        return AnalysisResponse(
            id=result["analysis_id"],
            document_id=document_id,
            role=body.role.value,
            negotiation_stance=body.negotiation_stance.value,
            overall_score=result["risk_score"].get("overall_score"),
            status=result["status"],
            created_at=datetime.now(timezone.utc),
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Analysis failed")


@router.get("/{document_id}/risks", response_model=List[RiskFindingResponse])
async def get_risks(
    document_id: UUID,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = AnalysisService(supabase)
    try:
        risks = await service.get_risks(str(document_id), user["user_id"])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return risks


@router.get("/{document_id}/obligations", response_model=List[ObligationResponse])
async def get_obligations(
    document_id: UUID,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = AnalysisService(supabase)
    try:
        obligations = await service.get_obligations(str(document_id), user["user_id"])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return obligations


@router.get("/{document_id}/deadlines", response_model=List[DeadlineResponse])
async def get_deadlines(
    document_id: UUID,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = AnalysisService(supabase)
    try:
        deadlines = await service.get_deadlines(str(document_id), user["user_id"])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return deadlines

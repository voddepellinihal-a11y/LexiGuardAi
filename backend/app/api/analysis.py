from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.services.main_service import AnalysisService
from app.schemas.responses import AnalysisRequest, AnalysisResponse, RiskFindingResponse, ObligationResponse, DeadlineResponse
from typing import List

router = APIRouter(prefix="/documents", tags=["analysis"])


@router.post("/{document_id}/analyze", response_model=AnalysisResponse)
async def analyze_document(
    document_id: str,
    request: AnalysisRequest,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = AnalysisService(supabase)
    try:
        result = await service.run_analysis(
            document_id=document_id,
            user_id=user["user_id"],
            role=request.role,
            stance=request.negotiation_stance,
        )
        return AnalysisResponse(
            id=result["analysis_id"],
            document_id=document_id,
            role=request.role,
            negotiation_stance=request.negotiation_stance,
            overall_score=result["risk_score"].get("overall_score"),
            status=result["status"],
            created_at="",
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Analysis failed")


@router.get("/{document_id}/risks", response_model=List[RiskFindingResponse])
async def get_risks(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = AnalysisService(supabase)
    risks = await service.get_risks(document_id)
    return risks


@router.get("/{document_id}/obligations", response_model=List[ObligationResponse])
async def get_obligations(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = AnalysisService(supabase)
    obligations = await service.get_obligations(document_id)
    return obligations


@router.get("/{document_id}/deadlines", response_model=List[DeadlineResponse])
async def get_deadlines(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = AnalysisService(supabase)
    deadlines = await service.get_deadlines(document_id)
    return deadlines

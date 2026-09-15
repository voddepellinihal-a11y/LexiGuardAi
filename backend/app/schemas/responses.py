from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class UserResponse(BaseModel):
    user_id: str
    email: Optional[str] = None
    role: Optional[str] = None


class DocumentUploadResponse(BaseModel):
    id: UUID
    filename: str
    status: str
    created_at: datetime


class DocumentResponse(BaseModel):
    id: UUID
    filename: str
    document_type: Optional[str] = None
    file_size: Optional[int] = None
    page_count: Optional[int] = None
    status: str
    processing_error: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None


from app.schemas.ai import UserRole, NegotiationStance


class AnalysisRequest(BaseModel):
    role: UserRole = Field(..., description="User role in the contract")
    negotiation_stance: NegotiationStance = Field(default=NegotiationStance.BALANCED, description="Aggressive, Balanced, or Flexible")


class AnalysisResponse(BaseModel):
    id: UUID
    document_id: UUID
    role: str
    negotiation_stance: str
    overall_score: Optional[float] = None
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None


class RiskFindingResponse(BaseModel):
    id: UUID
    analysis_id: UUID
    document_id: UUID
    clause_id: Optional[UUID] = None
    category: str
    severity: str
    score: Optional[float] = None
    title: str
    explanation: Optional[str] = None
    potential_impact: Optional[str] = None
    evidence: Optional[str] = None
    source_page: Optional[int] = None
    source_section: Optional[str] = None


class ObligationResponse(BaseModel):
    id: UUID
    document_id: UUID
    clause_id: Optional[UUID] = None
    party: Optional[str] = None
    action: Optional[str] = None
    deadline: Optional[str] = None
    condition: Optional[str] = None
    source: Optional[str] = None


class DeadlineResponse(BaseModel):
    id: UUID
    document_id: UUID
    date_type: str
    date_value: str
    description: Optional[str] = None
    source_section: Optional[str] = None
    source_page: Optional[int] = None


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)


class CitationResponse(BaseModel):
    section: Optional[str] = None
    page: Optional[int] = None
    text: str


class ChatResponse(BaseModel):
    answer: str
    grounded: bool
    citations: List[CitationResponse] = []


class ComparisonRequest(BaseModel):
    document_a_id: UUID
    document_b_id: UUID


class ComparisonChangeResponse(BaseModel):
    id: UUID
    comparison_id: UUID
    change_type: str
    section: Optional[str] = None
    severity: Optional[str] = None
    description: Optional[str] = None
    evidence_a: Optional[str] = None
    evidence_b: Optional[str] = None


class ComparisonResponse(BaseModel):
    id: UUID
    document_a_id: UUID
    document_b_id: UUID
    status: str
    changes: List[ComparisonChangeResponse] = []
    created_at: datetime
    completed_at: Optional[datetime] = None


class ConsultationSheetResponse(BaseModel):
    id: UUID
    document_id: UUID
    content: dict
    created_at: datetime


class HealthResponse(BaseModel):
    status: str
    version: str

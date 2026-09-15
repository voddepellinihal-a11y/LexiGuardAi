from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class UserRole(str, Enum):
    BUYER = "Buyer"
    SUPPLIER = "Supplier"
    CUSTOMER = "Customer"
    SERVICE_PROVIDER = "Service Provider"
    TENANT = "Tenant"
    LANDLORD = "Landlord"
    EMPLOYEE = "Employee"
    EMPLOYER = "Employer"
    CONTRACTOR = "Contractor"
    FREELANCER = "Freelancer"
    GENERAL_PARTY = "General Party"


class NegotiationStance(str, Enum):
    AGGRESSIVE = "Aggressive"
    BALANCED = "Balanced"
    FLEXIBLE = "Flexible"


class DocumentStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class RiskSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class ComparisonChangeType(str, Enum):
    ADDED_OBLIGATION = "added_obligation"
    SHIFTED_LIABILITY = "shifted_liability"
    OMITTED_PROTECTION = "omitted_protection"
    MODIFIED_CLAUSE = "modified_clause"
    UNCHANGED = "unchanged"


class AIRiskFinding(BaseModel):
    title: str
    category: str
    severity: str
    score: float = Field(ge=0, le=100)
    section_number: Optional[str] = None
    page_number: Optional[int] = None
    explanation: str
    potential_impact: str
    evidence: str
    suggested_action: str
    clause_id: Optional[str] = None


class AIObligation(BaseModel):
    party: str
    action: str
    deadline: Optional[str] = None
    condition: Optional[str] = None
    source_section: Optional[str] = None
    source_page: Optional[int] = None


class AIDeadline(BaseModel):
    date_type: str
    date_value: str
    description: Optional[str] = None
    source_section: Optional[str] = None
    source_page: Optional[int] = None


class AIRiskScore(BaseModel):
    overall_score: float = Field(ge=0, le=100)
    classification: str
    factors: dict
    summary: str


class AIAnalysisResult(BaseModel):
    risk_score: AIRiskScore
    risk_findings: List[AIRiskFinding]
    obligations: List[AIObligation]
    deadlines: List[AIDeadline]
    ambiguities: List[str]
    plain_english_summary: str


class AIComparisonChange(BaseModel):
    change_type: str
    section: Optional[str] = None
    severity: str
    description: str
    evidence_a: str
    evidence_b: str


class AIComparisonResult(BaseModel):
    changes: List[AIComparisonChange]
    summary: str


class AIConsultationSheet(BaseModel):
    document_name: str
    contract_type: Optional[str] = None
    user_role: str
    top_risks: List[str]
    important_obligations: List[str]
    important_deadlines: List[str]
    ambiguous_clauses: List[str]
    questions_for_lawyer: List[str]
    clauses_requiring_review: List[str]
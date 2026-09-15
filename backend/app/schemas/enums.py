from pydantic import BaseModel, Field
from typing import Optional
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

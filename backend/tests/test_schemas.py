"""Tests for Pydantic AI schemas (app/schemas/ai.py)."""

import pytest
from pydantic import ValidationError

from app.schemas.ai import (
    AIRiskFinding,
    NegotiationStance,
    UserRole,
)


def _valid_finding(**overrides):
    data = {
        "title": "Uncapped liability",
        "category": "unlimited_liability",
        "severity": "critical",
        "score": 95,
        "explanation": "No cap on damages.",
        "potential_impact": "Unlimited exposure.",
        "evidence": "Section 4.2 states ...",
        "suggested_action": "Negotiate a cap.",
    }
    data.update(overrides)
    return AIRiskFinding(**data)


def test_valid_risk_finding():
    f = _valid_finding()
    assert f.score == 95
    assert f.severity == "critical"


def test_score_above_100_rejected():
    with pytest.raises(ValidationError):
        _valid_finding(score=101)


def test_score_below_0_rejected():
    with pytest.raises(ValidationError):
        _valid_finding(score=-1)


def test_missing_evidence_rejected():
    data = _valid_finding().__dict__.copy()
    del data["evidence"]
    with pytest.raises(ValidationError):
        AIRiskFinding(**data)


def test_user_roles_cover_all_contract_parties():
    values = {r.value for r in UserRole}
    assert {"Buyer", "Tenant", "Employee", "Service Provider"} <= values


def test_negotiation_stances():
    assert {s.value for s in NegotiationStance} == {"Aggressive", "Balanced", "Flexible"}

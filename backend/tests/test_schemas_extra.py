"""Schema validation: enums, requests, AI types, response models."""
import uuid
import pytest
from pydantic import ValidationError

from app.schemas.ai import (
    UserRole, NegotiationStance, AIObligation, AIDeadline, AIRiskScore,
    AIAnalysisResult, AIComparisonChange, AIComparisonResult, AIConsultationSheet,
)
from app.schemas.responses import (
    AnalysisRequest, ChatRequest, ComparisonRequest, ComparisonResponse, ChatResponse,
)


def test_analysis_request_accepts_valid_enums():
    r = AnalysisRequest(role="Buyer", negotiation_stance="Balanced")
    assert r.role == UserRole.BUYER
    assert r.negotiation_stance == NegotiationStance.BALANCED


def test_analysis_request_defaults_balanced():
    r = AnalysisRequest(role="Tenant")
    assert r.negotiation_stance == NegotiationStance.BALANCED


def test_analysis_request_rejects_bad_role():
    with pytest.raises(ValidationError):
        AnalysisRequest(role="Hacker", negotiation_stance="Balanced")


def test_analysis_request_rejects_bad_stance():
    with pytest.raises(ValidationError):
        AnalysisRequest(role="Buyer", negotiation_stance="Evil")


def test_chat_request_length_bounds():
    with pytest.raises(ValidationError):
        ChatRequest(question="")
    with pytest.raises(ValidationError):
        ChatRequest(question="x" * 2001)
    assert ChatRequest(question="What is this?").question.startswith("What")


def test_comparison_request_requires_uuids():
    a, b = uuid.uuid4(), uuid.uuid4()
    r = ComparisonRequest(document_a_id=a, document_b_id=b)
    assert r.document_a_id == a
    with pytest.raises(ValidationError):
        ComparisonRequest(document_a_id="nope", document_b_id=b)


def test_ai_obligation_and_deadline():
    o = AIObligation(party="Supplier", action="Deliver goods")
    assert o.party == "Supplier"
    d = AIDeadline(date_type="payment", date_value="30 days")
    assert d.date_type == "payment"


def test_ai_risk_score_bounds():
    s = AIRiskScore(overall_score=72, classification="High", factors={}, summary="x")
    assert s.overall_score == 72
    with pytest.raises(ValidationError):
        AIRiskScore(overall_score=101, classification="High", factors={}, summary="x")


def test_ai_analysis_result_nesting():
    s = AIRiskScore(overall_score=10, classification="Low", factors={}, summary="ok")
    r = AIAnalysisResult(risk_score=s, risk_findings=[], obligations=[],
                         deadlines=[], ambiguities=[], plain_english_summary="ok")
    assert r.risk_score.overall_score == 10


def test_ai_comparison_result():
    ch = AIComparisonChange(change_type="added_obligation", severity="high",
                            description="d", evidence_a="a", evidence_b="b")
    res = AIComparisonResult(changes=[ch], summary="s")
    assert res.changes[0].change_type == "added_obligation"


def test_ai_consultation_sheet():
    s = AIConsultationSheet(document_name="c.pdf", user_role="Buyer", top_risks=["r"],
                             important_obligations=[], important_deadlines=[],
                             ambiguous_clauses=[], questions_for_lawyer=["q"],
                             clauses_requiring_review=[])
    assert s.top_risks == ["r"]


def test_chat_response_defaults():
    r = ChatResponse(answer="hi", grounded=True)
    assert r.citations == []


def test_comparison_response_requires_created_at():
    with pytest.raises(ValidationError):
        ComparisonResponse(id=uuid.uuid4(), document_a_id=uuid.uuid4(),
                           document_b_id=uuid.uuid4(), status="completed")

import re
import uuid
import asyncio
from datetime import datetime, timezone
from pathlib import Path
from supabase import Client
from typing import Optional, List, Dict, Any
from app.repositories.repositories import (
    DocumentRepository, DocumentSectionRepository, ClauseRepository,
    AnalysisRepository, RiskFindingRepository, ObligationRepository,
    ComparisonRepository, ComparisonChangeRepository, ChatRepository,
    ConsultationSheetRepository,
)
from app.services.document_parser import DocumentParser
from app.services.embedding_service import generate_embeddings, generate_single_embedding
from app.services.llm_service import (
    generate_structured_analysis, generate_comparison,
    generate_consultation_sheet, answer_question,
)
from app.core.config import settings
import structlog

logger = structlog.get_logger()

LEGAL_DISCLAIMER = (
    "This platform provides legal information and document analysis for assistance "
    "and educational purposes. It does not provide formal legal advice, does not "
    "replace a qualified legal professional, and does not create an attorney-client relationship."
)


def sanitize_filename(filename: str) -> str:
    name = Path(filename).name
    name = re.sub(r"[^a-zA-Z0-9._-]", "_", name)[:200]
    return name or "document"


class DocumentService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.doc_repo = DocumentRepository(supabase)
        self.section_repo = DocumentSectionRepository(supabase)
        self.clause_repo = ClauseRepository(supabase)
        self.parser = DocumentParser(supabase)

    async def upload_document(self, user_id: str, file_content: bytes, filename: str) -> Dict[str, Any]:
        doc_id = str(uuid.uuid4())
        safe_name = sanitize_filename(filename)

        storage_path = f"{user_id}/{doc_id}/{safe_name}"
        await asyncio.to_thread(
            self.supabase.storage.from_(settings.STORAGE_BUCKET).upload,
            path=storage_path,
            file=file_content,
            file_options={"content-type": "application/octet-stream"},
        )

        doc_record = await self.doc_repo.create({
            "id": doc_id,
            "user_id": user_id,
            "filename": safe_name,
            "storage_path": storage_path,
            "file_size": len(file_content),
            "status": "uploaded",
        })

        return doc_record

    async def process_document(self, document_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        doc = await self.doc_repo.get_by_id(document_id, user_id)
        if not doc:
            raise ValueError("Document not found")

        try:
            await self.doc_repo.update_status(document_id, "processing")

            file_bytes = await asyncio.to_thread(
                self.supabase.storage.from_(settings.STORAGE_BUCKET).download,
                doc["storage_path"],
            )

            parsed = await self.parser.parse_file(file_bytes, doc["filename"])

            sections_data = []
            for section in parsed["sections"]:
                sections_data.append({
                    "document_id": document_id,
                    "title": section["title"],
                    "content": section["content"],
                    "section_order": section["order"],
                })

            if sections_data:
                await self.section_repo.create_many(sections_data)

            clauses = self.parser.extract_clauses(parsed["sections"])

            clauses_with_embeddings = []
            if clauses:
                texts = [c["content"][:1000] for c in clauses]
                embeddings = await generate_embeddings(texts)
                for i, (clause, embedding) in enumerate(zip(clauses, embeddings)):
                    clauses_with_embeddings.append({
                        "document_id": document_id,
                        "title": clause["title"],
                        "content": clause["content"],
                        "section_number": clause.get("section_number"),
                        "page_number": clause.get("page_number"),
                        "clause_order": clause.get("clause_order", i),
                        "embedding": str(embedding),
                    })

            if clauses_with_embeddings:
                await self.clause_repo.create_many(clauses_with_embeddings)

            await self.doc_repo.update_status(document_id, "ready")

            return {
                "document_id": document_id,
                "status": "ready",
                "sections_count": len(sections_data),
                "clauses_count": len(clauses_with_embeddings),
                "page_count": parsed.get("page_count", 0),
            }

        except Exception as e:
            logger.error("document_processing_failed", document_id=document_id, error=str(e))
            await self.doc_repo.update_status(document_id, "failed", str(e))
            raise

    async def get_documents(self, user_id: str) -> List[dict]:
        return await self.doc_repo.get_by_user(user_id)

    async def get_document(self, document_id: str, user_id: str) -> Optional[dict]:
        return await self.doc_repo.get_by_id(document_id, user_id)

    async def delete_document(self, document_id: str, user_id: str) -> bool:
        doc = await self.doc_repo.get_by_id(document_id, user_id)
        if doc:
            try:
                await asyncio.to_thread(
                    self.supabase.storage.from_(settings.STORAGE_BUCKET).remove,
                    [doc["storage_path"]],
                )
            except Exception:
                pass
        return await self.doc_repo.delete(document_id, user_id)


class AnalysisService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.analysis_repo = AnalysisRepository(supabase)
        self.risk_repo = RiskFindingRepository(supabase)
        self.obligation_repo = ObligationRepository(supabase)
        self.clause_repo = ClauseRepository(supabase)
        self.doc_repo = DocumentRepository(supabase)

    async def run_analysis(self, document_id: str, user_id: str, role: str, stance: str) -> dict:
        doc = await self.doc_repo.get_by_id(document_id, user_id)
        if not doc:
            raise ValueError("Document not found")

        analysis = await self.analysis_repo.create({
            "document_id": document_id,
            "user_id": user_id,
            "role": role,
            "negotiation_stance": stance,
            "status": "processing",
        })

        try:
            clauses = await self.clause_repo.get_by_document(document_id)
            file_bytes = await asyncio.to_thread(
                self.supabase.storage.from_(settings.STORAGE_BUCKET).download,
                doc["storage_path"],
            )
            parsed = await DocumentParser(self.supabase).parse_file(file_bytes, doc["filename"])

            result = await generate_structured_analysis(
                document_text=parsed["full_text"],
                role=role,
                negotiation_stance=stance,
                clauses=[{"content": c["content"][:500], "title": c.get("title", "")} for c in clauses],
            )

            risk_score = result.get("risk_score", {})
            await self.analysis_repo.update(analysis["id"], {
                "overall_score": risk_score.get("overall_score", 50),
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
            })

            risk_findings = []
            for finding in result.get("risk_findings", []):
                risk_findings.append({
                    "analysis_id": analysis["id"],
                    "document_id": document_id,
                    "category": finding.get("category", "other"),
                    "severity": finding.get("severity", "medium"),
                    "score": finding.get("score", 50),
                    "title": finding.get("title", ""),
                    "explanation": finding.get("explanation", ""),
                    "potential_impact": finding.get("potential_impact", ""),
                    "evidence": finding.get("evidence", ""),
                    "source_page": finding.get("page_number"),
                })

            if risk_findings:
                await self.risk_repo.create_many(risk_findings)

            obligations = []
            for obl in result.get("obligations", []):
                obligations.append({
                    "document_id": document_id,
                    "party": obl.get("party", ""),
                    "action": obl.get("action", ""),
                    "deadline": obl.get("deadline"),
                    "condition": obl.get("condition"),
                    "source": obl.get("source_section", ""),
                })

            if obligations:
                await self.obligation_repo.create_many(obligations)

            return {
                "analysis_id": analysis["id"],
                "status": "completed",
                "risk_score": risk_score,
                "risk_findings_count": len(risk_findings),
                "obligations_count": len(obligations),
            }

        except Exception as e:
            logger.error("analysis_failed", analysis_id=analysis["id"], error=str(e))
            await self.analysis_repo.update(analysis["id"], {"status": "failed"})
            raise

    async def _assert_owner(self, document_id: str, user_id: Optional[str]) -> None:
        if user_id:
            doc = await self.doc_repo.get_by_id(document_id, user_id)
            if not doc:
                raise ValueError("Document not found")

    async def get_risks(self, document_id: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        await self._assert_owner(document_id, user_id)
        return await self.risk_repo.get_by_document(document_id)

    async def get_obligations(self, document_id: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        await self._assert_owner(document_id, user_id)
        return await self.obligation_repo.get_by_document(document_id)

    async def get_deadlines(self, document_id: str, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        await self._assert_owner(document_id, user_id)
        obligations = await self.obligation_repo.get_by_document(document_id)
        deadlines = []
        for obl in obligations:
            if obl.get("deadline"):
                deadlines.append({
                    "id": obl["id"],
                    "document_id": document_id,
                    "date_type": "other",
                    "date_value": obl["deadline"],
                    "description": f"{obl.get('action', '')} - {obl.get('party', '')}",
                    "source_section": obl.get("source", ""),
                })
        return deadlines


class ChatService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.chat_repo = ChatRepository(supabase)
        self.clause_repo = ClauseRepository(supabase)
        self.citation_repo = CitationRepository(supabase)
        self.doc_repo = DocumentRepository(supabase)

    async def ask_question(self, document_id: str, user_id: str, question: str) -> dict:
        doc = await self.doc_repo.get_by_id(document_id, user_id)
        if not doc:
            raise ValueError("Document not found")

        session = await self.chat_repo.get_or_create_session(user_id, document_id)

        await self.chat_repo.add_message(session["id"], "user", question)

        query_embedding = await generate_single_embedding(question)

        clauses = await self.clause_repo.search_similar(
            query_embedding, document_id, limit=5
        )

        if not clauses:
            all_clauses = await self.clause_repo.get_by_document(document_id)
            clauses = all_clauses[:5]

        result = await answer_question(
            question=question,
            context_clauses=clauses,
            document_name=doc["filename"],
        )

        await self.chat_repo.add_message(
            session["id"], "assistant", result["answer"], result.get("grounded", False)
        )

        return result

    async def get_sessions(self, user_id: str, document_id: str) -> List[dict]:
        result = await asyncio.to_thread(
            self.supabase.table("chat_sessions")
            .select("*")
            .eq("user_id", user_id)
            .eq("document_id", document_id)
            .execute
        )
        return result.data or []

    async def get_messages(self, session_id: str) -> List[dict]:
        return await self.chat_repo.get_messages(session_id)


class ComparisonService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.comparison_repo = ComparisonRepository(supabase)
        self.change_repo = ComparisonChangeRepository(supabase)
        self.clause_repo = ClauseRepository(supabase)
        self.doc_repo = DocumentRepository(supabase)
        self.parser = DocumentParser(supabase)

    async def compare_documents(
        self, document_a_id: str, document_b_id: str, user_id: str
    ) -> dict:
        doc_a = await self.doc_repo.get_by_id(document_a_id, user_id)
        doc_b = await self.doc_repo.get_by_id(document_b_id, user_id)

        if not doc_a or not doc_b:
            raise ValueError("One or both documents not found")

        comparison = await self.comparison_repo.create({
            "user_id": user_id,
            "document_a_id": document_a_id,
            "document_b_id": document_b_id,
            "status": "processing",
        })

        try:
            file_a = await asyncio.to_thread(
                self.supabase.storage.from_(settings.STORAGE_BUCKET).download,
                doc_a["storage_path"],
            )
            file_b = await asyncio.to_thread(
                self.supabase.storage.from_(settings.STORAGE_BUCKET).download,
                doc_b["storage_path"],
            )

            parsed_a = await self.parser.parse_file(file_a, doc_a["filename"])
            parsed_b = await self.parser.parse_file(file_b, doc_b["filename"])

            clauses_a = await self.clause_repo.get_by_document(document_a_id)
            clauses_b = await self.clause_repo.get_by_document(document_b_id)

            result = await generate_comparison(
                doc_a_text=parsed_a["full_text"],
                doc_b_text=parsed_b["full_text"],
                clauses_a=[{"content": c["content"][:500], "title": c.get("title", "")} for c in clauses_a],
                clauses_b=[{"content": c["content"][:500], "title": c.get("title", "")} for c in clauses_b],
            )

            changes = []
            for change in result.get("changes", []):
                changes.append({
                    "comparison_id": comparison["id"],
                    "change_type": change.get("change_type", "modified_clause"),
                    "section": change.get("section"),
                    "severity": change.get("severity", "medium"),
                    "description": change.get("description", ""),
                    "evidence_a": change.get("evidence_a", ""),
                    "evidence_b": change.get("evidence_b", ""),
                })

            if changes:
                await self.change_repo.create_many(changes)

            await self.comparison_repo.update(comparison["id"], {
                "status": "completed",
            })

            return {
                "comparison_id": comparison["id"],
                "status": "completed",
                "changes_count": len(changes),
                "changes": changes,
            }

        except Exception as e:
            logger.error("comparison_failed", comparison_id=comparison["id"], error=str(e))
            await self.comparison_repo.update(comparison["id"], {"status": "failed"})
            raise

    async def get_comparison(self, comparison_id: str, user_id: str) -> Optional[dict]:
        comparison = await self.comparison_repo.get_by_id(comparison_id, user_id)
        if comparison:
            changes = await self.change_repo.get_by_comparison(comparison_id)
            comparison["changes"] = changes
        return comparison


class ConsultationService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.sheet_repo = ConsultationSheetRepository(supabase)
        self.risk_repo = RiskFindingRepository(supabase)
        self.obligation_repo = ObligationRepository(supabase)
        self.analysis_repo = AnalysisRepository(supabase)
        self.doc_repo = DocumentRepository(supabase)

    async def generate_sheet(self, document_id: str, user_id: str) -> dict:
        doc = await self.doc_repo.get_by_id(document_id, user_id)
        if not doc:
            raise ValueError("Document not found")

        analysis = await self.analysis_repo.get_latest_by_document(document_id)
        risks = await self.risk_repo.get_by_document(document_id)
        obligations = await self.obligation_repo.get_by_document(document_id)

        risk_data = [
            {"title": r["title"], "severity": r["severity"], "explanation": r.get("explanation", "")}
            for r in risks[:10]
        ]
        obligation_data = [
            {"party": o.get("party", ""), "action": o.get("action", ""), "deadline": o.get("deadline", "")}
            for o in obligations[:10]
        ]

        result = await generate_consultation_sheet(
            document_name=doc["filename"],
            role=analysis.get("role", "General Party") if analysis else "General Party",
            risk_findings=risk_data,
            obligations=obligation_data,
            deadlines=[],
            ambiguities=[],
        )
        result["disclaimer"] = LEGAL_DISCLAIMER

        sheet = await self.sheet_repo.create({
            "user_id": user_id,
            "document_id": document_id,
            "content": result,
        })

        return sheet

    async def get_sheet(self, document_id: str, user_id: str) -> Optional[dict]:
        return await self.sheet_repo.get_by_document(document_id, user_id)

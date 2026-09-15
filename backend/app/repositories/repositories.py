from supabase import Client, PostgrestAPIError
from typing import Optional, List, Dict, Any
import asyncio
import structlog

logger = structlog.get_logger()


async def _exec(query):
    return await asyncio.to_thread(query.execute)


class DocumentRepository:
    def __init__(self, client: Client):
        self.client = client

    async def create(self, data: dict) -> dict:
        try:
            result = await _exec(self.client.table("documents").upsert(data))
            return result.data[0] if result.data else {}
        except PostgrestAPIError as e:
            logger.error("doc_create_error", error=str(e))
            return {}

    async def get_by_id(self, document_id: str, user_id: str = None) -> Optional[dict]:
        try:
            q = self.client.table("documents").select("*").eq("id", document_id)
            if user_id:
                q = q.eq("user_id", user_id)
            result = await _exec(q.single())
            return result.data
        except PostgrestAPIError:
            return None

    async def get_by_user(self, user_id: str) -> List[dict]:
        try:
            result = await _exec(
                self.client.table("documents")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
            )
            return result.data or []
        except PostgrestAPIError:
            return []

    async def update_status(self, document_id: str, status: str, error: str = None) -> None:
        try:
            data = {"status": status}
            if error:
                data["error"] = error
            await _exec(self.client.table("documents").update(data).eq("id", document_id))
        except PostgrestAPIError as e:
            logger.error("doc_update_status_error", error=str(e))

    async def delete(self, document_id: str, user_id: str) -> bool:
        try:
            await _exec(self.client.table("documents").delete().eq("id", document_id).eq("user_id", user_id))
            return True
        except PostgrestAPIError:
            return False


class DocumentSectionRepository:
    def __init__(self, client: Client):
        self.client = client

    async def create_many(self, sections: List[dict]) -> List[dict]:
        if not sections:
            return []
        try:
            result = await _exec(self.client.table("document_sections").insert(sections))
            return result.data or []
        except PostgrestAPIError as e:
            logger.error("section_create_many_error", error=str(e))
            return []


class ClauseRepository:
    def __init__(self, client: Client):
        self.client = client

    async def create_many(self, clauses: List[dict]) -> List[dict]:
        if not clauses:
            return []
        try:
            result = await _exec(self.client.table("clauses").insert(clauses))
            return result.data or []
        except PostgrestAPIError as e:
            logger.error("clause_create_many_error", error=str(e))
            return []

    async def get_by_document(self, document_id: str) -> List[dict]:
        try:
            result = await _exec(
                self.client.table("clauses")
                .select("*")
                .eq("document_id", document_id)
                .order("clause_order")
            )
            return result.data or []
        except PostgrestAPIError:
            return []

    async def search_similar(self, embedding: list, document_id: str, limit: int = 5) -> List[dict]:
        try:
            embedding_str = str(embedding)
            result = await _exec(self.client.rpc(
                "match_clauses",
                {
                    "query_embedding": embedding_str,
                    "match_document_id": document_id,
                    "match_count": limit,
                },
            ))
            return result.data or []
        except PostgrestAPIError as e:
            logger.error("clause_search_error", error=str(e))
            return []


class AnalysisRepository:
    def __init__(self, client: Client):
        self.client = client

    async def create(self, data: dict) -> dict:
        try:
            result = await _exec(self.client.table("analyses").insert(data))
            return result.data[0] if result.data else {}
        except PostgrestAPIError as e:
            logger.error("analysis_create_error", error=str(e))
            return {}

    async def update(self, analysis_id: str, data: dict) -> None:
        try:
            await _exec(self.client.table("analyses").update(data).eq("id", analysis_id))
        except PostgrestAPIError as e:
            logger.error("analysis_update_error", error=str(e))

    async def get_latest_by_document(self, document_id: str) -> Optional[dict]:
        try:
            result = await _exec(
                self.client.table("analyses")
                .select("*")
                .eq("document_id", document_id)
                .order("created_at", desc=True)
                .limit(1)
                .single()
            )
            return result.data
        except PostgrestAPIError:
            return None


class RiskFindingRepository:
    def __init__(self, client: Client):
        self.client = client

    async def create_many(self, findings: List[dict]) -> List[dict]:
        if not findings:
            return []
        try:
            result = await _exec(self.client.table("risk_findings").insert(findings))
            return result.data or []
        except PostgrestAPIError as e:
            logger.error("risk_create_many_error", error=str(e))
            return []

    async def get_by_document(self, document_id: str) -> List[dict]:
        try:
            result = await _exec(
                self.client.table("risk_findings")
                .select("*")
                .eq("document_id", document_id)
                .order("score", desc=True)
            )
            return result.data or []
        except PostgrestAPIError:
            return []


class ObligationRepository:
    def __init__(self, client: Client):
        self.client = client

    async def create_many(self, obligations: List[dict]) -> List[dict]:
        if not obligations:
            return []
        try:
            result = await _exec(self.client.table("obligations").insert(obligations))
            return result.data or []
        except PostgrestAPIError as e:
            logger.error("obligation_create_many_error", error=str(e))
            return []

    async def get_by_document(self, document_id: str) -> List[dict]:
        try:
            result = await _exec(
                self.client.table("obligations")
                .select("*")
                .eq("document_id", document_id)
            )
            return result.data or []
        except PostgrestAPIError:
            return []


class ComparisonRepository:
    def __init__(self, client: Client):
        self.client = client

    async def create(self, data: dict) -> dict:
        try:
            result = await _exec(self.client.table("comparisons").insert(data))
            return result.data[0] if result.data else {}
        except PostgrestAPIError as e:
            logger.error("comparison_create_error", error=str(e))
            return {}

    async def update(self, comparison_id: str, data: dict) -> None:
        try:
            await _exec(self.client.table("comparisons").update(data).eq("id", comparison_id))
        except PostgrestAPIError as e:
            logger.error("comparison_update_error", error=str(e))

    async def get_by_id(self, comparison_id: str, user_id: str) -> Optional[dict]:
        try:
            result = await _exec(
                self.client.table("comparisons")
                .select("*")
                .eq("id", comparison_id)
                .eq("user_id", user_id)
                .single()
            )
            return result.data
        except PostgrestAPIError:
            return None


class ComparisonChangeRepository:
    def __init__(self, client: Client):
        self.client = client

    async def create_many(self, changes: List[dict]) -> List[dict]:
        if not changes:
            return []
        try:
            result = await _exec(self.client.table("comparison_changes").insert(changes))
            return result.data or []
        except PostgrestAPIError as e:
            logger.error("change_create_many_error", error=str(e))
            return []

    async def get_by_comparison(self, comparison_id: str) -> List[dict]:
        try:
            result = await _exec(
                self.client.table("comparison_changes")
                .select("*")
                .eq("comparison_id", comparison_id)
            )
            return result.data or []
        except PostgrestAPIError:
            return []


class ChatRepository:
    def __init__(self, client: Client):
        self.client = client

    async def get_or_create_session(self, user_id: str, document_id: str) -> dict:
        try:
            result = await _exec(
                self.client.table("chat_sessions")
                .select("*")
                .eq("user_id", user_id)
                .eq("document_id", document_id)
                .limit(1)
            )
            if result.data:
                return result.data[0]
            result = await _exec(
                self.client.table("chat_sessions")
                .insert({"user_id": user_id, "document_id": document_id})
            )
            return result.data[0] if result.data else {}
        except PostgrestAPIError as e:
            logger.error("chat_session_error", error=str(e))
            return {}

    async def add_message(self, session_id: str, role: str, content: str, grounded: bool = False) -> None:
        try:
            await _exec(self.client.table("chat_messages").insert({
                "session_id": session_id,
                "role": role,
                "content": content,
                "grounded": grounded,
            }))
        except PostgrestAPIError as e:
            logger.error("chat_message_error", error=str(e))

    async def get_messages(self, session_id: str) -> List[dict]:
        try:
            result = await _exec(
                self.client.table("chat_messages")
                .select("*")
                .eq("session_id", session_id)
                .order("created_at")
            )
            return result.data or []
        except PostgrestAPIError:
            return []


class ConsultationSheetRepository:
    def __init__(self, client: Client):
        self.client = client

    async def create(self, data: dict) -> dict:
        try:
            result = await _exec(self.client.table("consultation_sheets").insert(data))
            return result.data[0] if result.data else {}
        except PostgrestAPIError as e:
            logger.error("consultation_create_error", error=str(e))
            return {}

    async def get_by_document(self, document_id: str, user_id: str) -> Optional[dict]:
        try:
            result = await _exec(
                self.client.table("consultation_sheets")
                .select("*")
                .eq("document_id", document_id)
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(1)
                .single()
            )
            return result.data
        except PostgrestAPIError:
            return None


class CitationRepository:
    pass

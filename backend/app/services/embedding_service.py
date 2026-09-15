from openai import AsyncOpenAI
from app.core.config import settings
from typing import List
import structlog

logger = structlog.get_logger()

_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.LLM_API_KEY)
    return _client


async def generate_embeddings(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []
    try:
        response = await _get_client().embeddings.create(
            model=settings.EMBEDDING_MODEL,
            input=texts,
        )
        return [item.embedding for item in response.data]
    except Exception as e:
        logger.error("embedding_generation_failed", error=str(e))
        raise


async def generate_single_embedding(text: str) -> List[float]:
    embeddings = await generate_embeddings([text])
    return embeddings[0] if embeddings else []

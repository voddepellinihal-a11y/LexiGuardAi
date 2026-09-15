from openai import OpenAI
from app.core.config import settings
from typing import List
import structlog

logger = structlog.get_logger()

client = OpenAI(api_key=settings.LLM_API_KEY)


async def generate_embeddings(texts: List[str]) -> List[list]:
    if not texts:
        return []
    try:
        response = client.embeddings.create(
            model=settings.EMBEDDING_MODEL,
            input=texts,
        )
        return [item.embedding for item in response.data]
    except Exception as e:
        logger.error("embedding_generation_failed", error=str(e))
        raise


async def generate_single_embedding(text: str) -> list:
    embeddings = await generate_embeddings([text])
    return embeddings[0] if embeddings else []

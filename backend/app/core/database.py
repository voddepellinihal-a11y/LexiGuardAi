from functools import lru_cache
from supabase import Client, create_client
import structlog
from app.core.config import settings

logger = structlog.get_logger()


@lru_cache(maxsize=1)
def _cached_service_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


@lru_cache(maxsize=1)
def _cached_anon_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


def get_supabase_client() -> Client:
    # ponytail: process-wide singleton, per-request client if RLS-per-user needed
    return _cached_service_client()


def get_supabase_anon_client() -> Client:
    return _cached_anon_client()

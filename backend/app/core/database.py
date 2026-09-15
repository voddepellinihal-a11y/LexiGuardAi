import structlog
from app.core.config import settings

logger = structlog.get_logger()


def get_supabase_client():
    from supabase import create_client
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


def get_supabase_anon_client():
    from supabase import create_client
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

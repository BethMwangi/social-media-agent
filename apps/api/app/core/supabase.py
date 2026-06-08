from apps.api.app.core.supabase import create_client
from apps.api.app.core.settings import settings

supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY,
)
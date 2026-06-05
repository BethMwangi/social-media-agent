from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
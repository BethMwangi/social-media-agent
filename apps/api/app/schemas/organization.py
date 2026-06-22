from typing import Optional

from pydantic import BaseModel


class BrandSettings(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    logo_url: Optional[str] = None
    tone: Optional[str] = None


class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    mission: Optional[str] = None
    purpose: Optional[str] = None
    audience: Optional[str] = None
    email: Optional[str] = None
    brand_settings: Optional[BrandSettings] = None

from pydantic import BaseModel

class BrandSettings(BaseModel):
    primary_color: str | None = None
    secondary_color: str | None = None
    accent_color: str | None = None
    logo_url: str | None = None
    tone: str | None = None


class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    mission: str | None = None
    purpose: str | None = None
    audience: str | None = None
    email: str | None = None
    brand_settings: BrandSettings | None = None
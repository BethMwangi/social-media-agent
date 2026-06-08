from pydantic import BaseModel
from typing import Optional


class BrandSettingsResponse(BaseModel):
    id: str
    organization_id: str

    primary_color: Optional[str]
    secondary_color: Optional[str]
    accent_color: Optional[str]
    background_color: Optional[str]
    text_color: Optional[str]

    font_family: Optional[str]
    logo_url: Optional[str]
    tone: Optional[str]


class UpdateBrandSettingsRequest(BaseModel):
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    background_color: Optional[str] = None
    text_color: Optional[str] = None

    font_family: Optional[str] = None
    logo_url: Optional[str] = None
    tone: Optional[str] = None
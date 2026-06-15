from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class GeneratedPostCreate(BaseModel):
    campaign_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None
    asset_id: Optional[UUID] = None
    template_id: Optional[UUID] = None
    platform: str
    content: str
    status: Optional[str] = "draft"
    generated_by: Optional[str] = None
    ai_model: Optional[str] = None


class GeneratedPostResponse(BaseModel):
    id: UUID
    campaign_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None
    asset_id: Optional[UUID] = None
    template_id: Optional[UUID] = None
    platform: str
    content: str
    status: str
    generated_by: Optional[str] = None
    ai_model: Optional[str] = None
    approved_at: Optional[str] = None
    published_at: Optional[str] = None
    created_at: str

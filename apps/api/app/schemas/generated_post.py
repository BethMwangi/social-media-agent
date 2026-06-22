from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class GeneratedPostCreate(BaseModel):
    campaign_id: Optional[UUID] = None
    organization_id: Optional[UUID] = None
    asset_id: Optional[UUID] = None
    template_id: Optional[UUID] = None
    file_url: Optional[str] = None
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
    file_url: Optional[str] = None
    signed_file_url: Optional[str] = None
    asset_type: Optional[str] = None
    asset_name: Optional[str] = None
    platform: str
    content: str
    status: str
    generated_by: Optional[str] = None
    ai_model: Optional[str] = None
    approved_at: Optional[str] = None
    published_at: Optional[str] = None
    created_at: str


class GeneratedPostUpdate(BaseModel):
    content: Optional[str] = None
    status: Optional[str] = None
    asset_id: Optional[UUID] = None
    file_url: Optional[str] = None


class GeneratedPostRegenerateDesignRequest(BaseModel):
    poster_instructions: Optional[str] = None
    generated_image_prompt: Optional[str] = None
    event_title: Optional[str] = None

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class AssetCreate(BaseModel):
    organization_id: UUID
    name: str
    description: Optional[str] = None
    file_url: str
    asset_type: str
    platform: Optional[str] = None
    dimensions: Optional[str] = None
    uploaded_by: Optional[str] = None
    template_category: Optional[str] = None
    is_template: bool = False
    canva_template_url: Optional[str] = None
    campaign_id: Optional[UUID] = None


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    asset_type: Optional[str] = None
    platform: Optional[str] = None
    dimensions: Optional[str] = None
    uploaded_by: Optional[str] = None
    template_category: Optional[str] = None
    is_template: Optional[bool] = None
    canva_template_url: Optional[str] = None
    campaign_id: Optional[UUID] = None


class AssetResponse(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    description: Optional[str] = None
    file_url: str
    asset_type: str
    platform: Optional[str] = None
    dimensions: Optional[str] = None
    uploaded_by: Optional[str] = None
    template_category: Optional[str] = None
    is_template: bool = False
    canva_template_url: Optional[str] = None
    campaign_id: Optional[UUID] = None

from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class CampaignCreate(BaseModel):
    organization_id: UUID
    title: str
    campaign_type: Optional[str] = None
    objective: Optional[str] = None
    status: Optional[str] = "draft"


class CampaignUpdate(BaseModel):
    title: Optional[str] = None
    campaign_type: Optional[str] = None
    objective: Optional[str] = None
    status: Optional[str] = None


class CampaignResponse(BaseModel):
    id: UUID
    organization_id: UUID
    title: str
    campaign_type: Optional[str]
    objective: Optional[str]
    status: str
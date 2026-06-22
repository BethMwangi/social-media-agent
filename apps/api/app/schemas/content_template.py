from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class ContentTemplateCreate(BaseModel):
    organization_id: UUID
    name: str
    platform: str
    template_type: str
    prompt_template: str


class ContentTemplateUpdate(BaseModel):
    name: Optional[str] = None
    platform: Optional[str] = None
    template_type: Optional[str] = None
    prompt_template: Optional[str] = None
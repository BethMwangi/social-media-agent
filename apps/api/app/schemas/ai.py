from typing import Any, Optional

from pydantic import BaseModel


class CampaignEventInput(BaseModel):
    title: str
    date: str
    location: Optional[str] = None
    registration_url: Optional[str] = None
    description: str


class GenerateCampaignRequest(BaseModel):
    campaign_type: str
    platform: str
    organization_id: str
    selected_asset_id: str
    event: CampaignEventInput
    extra_context: Optional[str] = None


class TemplateRecommendation(BaseModel):
    asset_id: str
    name: str
    reason: str
    file_url: Optional[str] = None


class GeneratedDesignAsset(BaseModel):
    id: str
    organization_id: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    file_url: str
    asset_type: str
    platform: Optional[str] = None
    dimensions: Optional[str] = None
    signed_file_url: Optional[str] = None


class GenerateCampaignResponse(BaseModel):
    caption: str
    short_caption: str
    hashtags: list[str]
    call_to_action: str
    generation_mode: str
    ai_model: Optional[str] = None
    generation_error: Optional[str] = None
    design_generation_mode: str
    design_generation_error: Optional[str] = None
    generated_design_asset: Optional[GeneratedDesignAsset] = None
    template_recommendation: TemplateRecommendation
    generated_image_prompt: str
    instagram_caption: str
    linkedin_post: str
    twitter_post: str
    poster_instructions: str
    ai_reasoning: str
    raw_context: dict[str, Any]

from fastapi import APIRouter

from app.schemas.ai import GenerateCampaignRequest
from app.services.ai_service import AICampaignService

router = APIRouter()

service = AICampaignService()


@router.post("/generate-campaign")
async def generate_campaign(payload: GenerateCampaignRequest):

    return {
        "success": True,
        "data": await service.generate_campaign(payload)
    }


@router.post("/test")
async def test_ai():

    result = await service._generate_with_claude_or_fallback({
        "organization": {
            "name": "BuildHerAI"
        },
        "brand_settings": {},
        "hashtags": [],
        "asset": {
            "name": "Instagram Event Poster V1"
        },
        "campaign_request": {
            "event": {
                "title": "AI Hack Night",
                "date": "2026-07-25",
                "location": "Nairobi",
                "description": "Build AI products together"
            }
        }
    })

    return result
from fastapi import APIRouter

from app.services.campaign_service import (
    CampaignService
)
from app.schemas.campaign import CampaignCreate, CampaignUpdate

router = APIRouter()

service = CampaignService()


@router.get("")
async def get_campaigns():

    campaigns = await service.get_campaigns()

    return {
        "success": True,
        "message": "Campaigns retrieved",
        "data": campaigns
    }


@router.get("/{campaign_id}")
async def get_campaign(campaign_id: str):

    campaign = await service.get_campaign(campaign_id)

    return {
        "success": True,
        "message": "Campaign retrieved",
        "data": campaign
    }


@router.post("")
async def create_campaign(
    payload: CampaignCreate
):

    campaign = await service.create_campaign(
        payload.model_dump()
    )

    return {
        "success": True,
        "message": "Campaign created",
        "data": campaign
    }


@router.put("/{campaign_id}")
async def update_campaign(
    campaign_id: str,
    payload: CampaignUpdate
):

    campaign = await service.update_campaign(
        campaign_id,
        payload.model_dump(exclude_none=True)
    )

    return {
        "success": True,
        "message": "Campaign updated",
        "data": campaign
    }


@router.delete("/{campaign_id}")
async def delete_campaign(
    campaign_id: str
):

    await service.delete_campaign(
        campaign_id
    )

    return {
        "success": True,
        "message": "Campaign deleted"
    }
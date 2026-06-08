from fastapi import HTTPException

from app.repositories.campaign_repository import (
    CampaignRepository
)


class CampaignService:

    def __init__(self):
        self.repository = CampaignRepository()

    async def get_campaigns(self):

        return await self.repository.get_all()

    async def get_campaign(self, campaign_id: str):

        campaign = await self.repository.get_by_id(campaign_id)

        if not campaign:
            raise HTTPException(
                status_code=404,
                detail="Campaign not found"
            )

        return campaign

    async def create_campaign(
        self,
        payload: dict
    ):

        return await self.repository.create(payload)

    async def update_campaign(
        self,
        campaign_id: str,
        payload: dict
    ):

        return await self.repository.update(
            campaign_id,
            payload
        )

    async def delete_campaign(
        self,
        campaign_id: str
    ):

        await self.repository.delete(campaign_id)

        return True

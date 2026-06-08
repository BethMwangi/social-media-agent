from fastapi import HTTPException

from app.repositories.brand_settings_repository import (
    BrandSettingsRepository
)


class BrandSettingsService:

    def __init__(self):
        self.repository = BrandSettingsRepository()

    async def get_brand_settings(
        self,
        organization_id: str
    ):

        settings = await self.repository.get_by_organization_id(
            organization_id
        )

        if not settings:
            raise HTTPException(
                status_code=404,
                detail="Brand settings not found"
            )

        return settings

    async def update_brand_settings(
        self,
        organization_id: str,
        payload: dict
    ):

        return await self.repository.update(
            organization_id,
            payload
        )
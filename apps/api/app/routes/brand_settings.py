from fastapi import APIRouter

from app.schemas.brand_settings import (
    UpdateBrandSettingsRequest
)

from app.services.brand_settings_service import (
    BrandSettingsService
)

router = APIRouter()

service = BrandSettingsService()


@router.get("/{organization_id}")
async def get_brand_settings(
    organization_id: str
):

    data = await service.get_brand_settings(
        organization_id
    )

    return {
        "success": True,
        "data": data
    }


@router.put("/{organization_id}")
async def update_brand_settings(
    organization_id: str,
    payload: UpdateBrandSettingsRequest
):

    data = await service.update_brand_settings(
        organization_id,
        payload.model_dump(exclude_none=True)
    )

    return {
        "success": True,
        "message": "Brand settings updated",
        "data": data
    }
from fastapi import APIRouter

from app.services.org_service import (
    OrganizationService
)

router = APIRouter()

service = OrganizationService()


@router.get("/{slug}")
async def get_organization(slug: str):

    organization = await service.get_organization(slug)

    return {
        "success": True,
        "message": "Organization retrieved",
        "data": organization
    }

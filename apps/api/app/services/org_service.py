from fastapi import HTTPException

from app.repositories.org_repository import (
    OrganizationRepository
)


class OrganizationService:

    def __init__(self):
        self.repository = OrganizationRepository()

    async def get_organization_by_id(self, organization_id: str):

        organization = await self.repository.get_by_id(organization_id)

        if not organization:
            raise HTTPException(
                status_code=404,
                detail="Organization not found"
            )

        return organization

    async def get_organization(self, slug: str):

        organization = await self.repository.get_by_slug(slug)

        if not organization:
            raise HTTPException(
                status_code=404,
                detail="Organization not found"
            )

        return organization

from app.core.supabase import supabase


class BrandSettingsRepository:

    async def get_by_organization_id(
        self,
        organization_id: str
    ):

        result = (
            supabase
            .table("brand_settings")
            .select("*")
            .eq("organization_id", organization_id)
            .single()
            .execute()
        )

        return result.data

    async def update(
        self,
        organization_id: str,
        payload: dict
    ):

        result = (
            supabase
            .table("brand_settings")
            .update(payload)
            .eq("organization_id", organization_id)
            .execute()
        )

        return result.data
from app.core.supabase import supabase


class CampaignRepository:

    async def get_all(self):

        result = (
            supabase
            .table("campaigns")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return result.data

    async def get_by_id(self, campaign_id: str):

        result = (
            supabase
            .table("campaigns")
            .select("*")
            .eq("id", campaign_id)
            .single()
            .execute()
        )

        return result.data

    async def create(self, payload: dict):

        result = (
            supabase
            .table("campaigns")
            .insert(payload)
            .execute()
        )

        return result.data[0]

    async def update(
        self,
        campaign_id: str,
        payload: dict
    ):

        result = (
            supabase
            .table("campaigns")
            .update(payload)
            .eq("id", campaign_id)
            .execute()
        )

        return result.data[0]

    async def delete(self, campaign_id: str):

        result = (
            supabase
            .table("campaigns")
            .delete()
            .eq("id", campaign_id)
            .execute()
        )

        return result.data
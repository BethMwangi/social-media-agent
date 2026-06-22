from app.core.supabase import supabase


class HashtagRepository:

    async def get_by_organization_id(
        self,
        organization_id: str
    ):

        result = (
            supabase
            .table("hashtags")
            .select("*")
            .eq(
                "organization_id",
                organization_id
            )
            .order("tag")
            .execute()
        )

        return result.data

    async def create(
        self,
        payload: dict
    ):

        result = (
            supabase
            .table("hashtags")
            .insert(payload)
            .execute()
        )

        return result.data[0]

    async def update(
        self,
        hashtag_id: str,
        payload: dict
    ):

        result = (
            supabase
            .table("hashtags")
            .update(payload)
            .eq("id", hashtag_id)
            .execute()
        )

        return result.data[0]

    async def delete(
        self,
        hashtag_id: str
    ):

        (
            supabase
            .table("hashtags")
            .delete()
            .eq("id", hashtag_id)
            .execute()
        )

        return True

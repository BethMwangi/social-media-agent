from app.core.supabase import supabase


class GeneratedPostRepository:

    async def get_all(self):

        result = (
            supabase
            .table("generated_posts")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return result.data

    async def create(self, payload: dict):

        result = (
            supabase
            .table("generated_posts")
            .insert(payload)
            .execute()
        )

        return result.data[0]

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

    async def get_by_id(self, post_id: str):

        result = (
            supabase
            .table("generated_posts")
            .select("*")
            .eq("id", post_id)
            .single()
            .execute()
        )

        return result.data

    async def create(self, payload: dict):

        try:
            result = (
                supabase
                .table("generated_posts")
                .insert(payload)
                .execute()
            )
        except Exception:
            if "file_url" not in payload:
                raise

            fallback_payload = {
                key: value
                for key, value in payload.items()
                if key != "file_url"
            }

            result = (
                supabase
                .table("generated_posts")
                .insert(fallback_payload)
                .execute()
            )

        return result.data[0]

    async def update(self, post_id: str, payload: dict):

        result = (
            supabase
            .table("generated_posts")
            .update(payload)
            .eq("id", post_id)
            .execute()
        )

        return result.data[0]

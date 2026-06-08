from app.core.supabase import supabase


class EventRepository:

    async def get_all(self):

        result = (
            supabase.table("events")
            .select("""
                *,
                campaigns(
                    id,
                    title
                )
            """)
            .order("event_date")
            .execute()
        )

        return result.data

    async def get_by_id(self, event_id: str):

        result = (
            supabase.table("events")
            .select("*")
            .eq("id", event_id)
            .single()
            .execute()
        )

        return result.data

    async def create(self, payload: dict):

        result = (
            supabase.table("events")
            .insert(payload)
            .execute()
        )

        return result.data[0]

    async def update(self, event_id: str, payload: dict):

        result = (
            supabase.table("events")
            .update(payload)
            .eq("id", event_id)
            .execute()
        )

        return result.data[0]

    async def delete(self, event_id: str):

        (
            supabase.table("events")
            .delete()
            .eq("id", event_id)
            .execute()
        )

        return True
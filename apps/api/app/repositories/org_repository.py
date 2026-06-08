from apps.api.app.core.supabase import supabase


class OrganizationRepository:

    async def get_by_slug(self, slug: str):

        result = (
            supabase.table("organizations")
            .select(
                """
                *,
                brand_settings(*)
                """
            )
            .eq("slug", slug)
            .single()
            .execute()
        )

        return result.data
from app.core.supabase import supabase


class OrganizationRepository:

    async def get_by_id(self, organization_id: str):

        result = (
            supabase.table("organizations")
            .select(
                """
                *,
                brand_settings(*)
                """
            )
            .eq("id", organization_id)
            .single()
            .execute()
        )

        return result.data

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

from app.core.supabase import supabase


class ContentTemplateRepository:

    async def get_all(self):

        response = (
            supabase
            .table("content_templates")
            .select("*")
            .execute()
        )

        return response.data

    async def get_by_id(self, template_id):

        response = (
            supabase
            .table("content_templates")
            .select("*")
            .eq("id", template_id)
            .single()
            .execute()
        )

        return response.data

    async def create(self, payload):

        response = (
            supabase
            .table("content_templates")
            .insert(payload)
            .execute()
        )

        return response.data[0]

    async def update(
        self,
        template_id,
        payload
    ):

        response = (
            supabase
            .table("content_templates")
            .update(payload)
            .eq("id", template_id)
            .execute()
        )

        return response.data[0]

    async def delete(self, template_id):

        (
            supabase
            .table("content_templates")
            .delete()
            .eq("id", template_id)
            .execute()
        )

        return True
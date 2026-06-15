from app.core.supabase import supabase


class AssetRepository:

    async def get_all(self):
        response = (
            supabase
            .table("assets")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return response.data

    async def get_by_id(self, asset_id: str):

        response = (
            supabase
            .table("assets")
            .select("*")
            .eq("id", asset_id)
            .single()
            .execute()
        )

        return response.data

    async def create(self, payload: dict):

        response = (
            supabase
            .table("assets")
            .insert(payload)
            .execute()
        )

        return response.data[0]

    async def upload_file(
        self,
        bucket_name: str,
        storage_path: str,
        file_bytes: bytes,
        content_type: str = None
    ):

        supabase.storage.from_(bucket_name).upload(
            storage_path,
            file_bytes,
            {
                "content-type": (
                    content_type or "application/octet-stream"
                )
            }
        )

        return supabase.storage.from_(bucket_name).get_public_url(
            storage_path
        )

    async def create_signed_url(
        self,
        bucket_name: str,
        storage_path: str,
        expires_in: int
    ):

        response = supabase.storage.from_(bucket_name).create_signed_url(
            storage_path,
            expires_in
        )

        if isinstance(response, str):
            return response

        if isinstance(response, dict):
            return (
                response.get("signedURL")
                or response.get("signedUrl")
                or response.get("signed_url")
            )

        return None

    async def update(self, asset_id: str, payload: dict):

        response = (
            supabase
            .table("assets")
            .update(payload)
            .eq("id", asset_id)
            .execute()
        )

        return response.data[0]

    async def delete(self, asset_id: str):

        (
            supabase
            .table("assets")
            .delete()
            .eq("id", asset_id)
            .execute()
        )

        return True

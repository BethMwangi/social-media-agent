from datetime import datetime, timezone
from typing import Optional

from app.repositories.generated_post_repository import (
    GeneratedPostRepository,
)
from app.services.ai_service import AICampaignService
from app.services.asset_service import AssetService


class GeneratedPostService:

    def __init__(self):
        self.repository = GeneratedPostRepository()
        self.asset_service = AssetService()
        self.ai_service = AICampaignService()

    async def get_generated_posts(self):
        posts = await self.repository.get_all()

        return [
            await self._attach_asset_fields(post)
            for post in posts
        ]

    async def create_generated_post(self, payload):
        post = await self.repository.create(
            payload.model_dump(mode="json", exclude_none=True)
        )

        return await self._attach_asset_fields(post)

    async def update_generated_post(self, post_id: str, payload):
        data = payload.model_dump(mode="json", exclude_none=True)
        post = await self.repository.update(post_id, data)

        return await self._attach_asset_fields(post)

    async def approve_generated_post(self, post_id: str):
        post = await self.repository.update(
            post_id,
            {
                "status": "approved",
                "approved_at": datetime.now(timezone.utc).isoformat(),
            },
        )

        return await self._attach_asset_fields(post)

    async def regenerate_generated_post_design(
        self,
        post_id: str,
        poster_instructions: Optional[str] = None,
        generated_image_prompt: Optional[str] = None,
        event_title: Optional[str] = None,
    ):
        post = await self.repository.get_by_id(post_id)

        if not post:
            raise RuntimeError("Generated post not found")

        asset_id = post.get("asset_id")

        if not asset_id:
            raise RuntimeError(
                "Generated post is missing an asset_id for design regeneration"
            )

        asset = await self.asset_service.get_asset(asset_id)
        design_output = await (
            self.ai_service.regenerate_design_for_generated_post(
                post,
                asset,
                poster_instructions=poster_instructions,
                generated_image_prompt=generated_image_prompt,
                event_title=event_title,
            )
        )
        generated_asset = design_output.get("generated_design_asset")

        if not generated_asset:
            raise RuntimeError(
                design_output.get("design_generation_error")
                or "Design regeneration did not return a new asset"
            )

        updated_post = await self.repository.update(
            post_id,
            {
                "asset_id": generated_asset.get("id"),
                "file_url": generated_asset.get("file_url"),
                "status": "draft",
            },
        )

        return {
            **(await self._attach_asset_fields(updated_post)),
            "design_generation_mode": design_output.get(
                "design_generation_mode"
            ),
            "design_generation_error": design_output.get(
                "design_generation_error"
            ),
        }

    async def _attach_asset_fields(self, post: dict):
        if not post or not post.get("asset_id"):
            return post

        try:
            asset = await self.asset_service.get_asset(post["asset_id"])
        except Exception:
            return post

        return {
            **post,
            "file_url": post.get("file_url") or asset.get("file_url"),
            "signed_file_url": asset.get("signed_file_url"),
            "asset_type": asset.get("asset_type"),
            "asset_name": asset.get("name"),
        }

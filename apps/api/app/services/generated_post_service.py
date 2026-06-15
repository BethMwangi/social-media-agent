from app.repositories.generated_post_repository import (
    GeneratedPostRepository,
)


class GeneratedPostService:

    def __init__(self):
        self.repository = GeneratedPostRepository()

    async def get_generated_posts(self):
        return await self.repository.get_all()

    async def create_generated_post(self, payload):
        return await self.repository.create(
            payload.model_dump(mode="json", exclude_none=True)
        )

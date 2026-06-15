from app.repositories.hashtag_repository import (
    HashtagRepository
)


class HashtagService:

    def __init__(self):
        self.repository = HashtagRepository()

    async def get_hashtags(
        self,
        organization_id: str
    ):
        return await self.repository.get_by_organization_id(
            organization_id
        )

    async def create_hashtag(
        self,
        payload
    ):
        return await self.repository.create(
            payload.model_dump()
        )

    async def update_hashtag(
        self,
        hashtag_id,
        payload
    ):
        return await self.repository.update(
            hashtag_id,
            payload.model_dump()
        )

    async def delete_hashtag(
        self,
        hashtag_id
    ):
        return await self.repository.delete(
            hashtag_id
        )
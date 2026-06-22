from app.repositories.content_template_repository import (
    ContentTemplateRepository
)


class ContentTemplateService:

    def __init__(self):
        self.repository = ContentTemplateRepository()

    async def get_templates(self):
        return await self.repository.get_all()

    async def get_template(self, template_id):
        return await self.repository.get_by_id(template_id)

    async def create_template(self, payload):
        return await self.repository.create(
            payload.model_dump()
        )

    async def update_template(
        self,
        template_id,
        payload
    ):

        return await self.repository.update(
            template_id,
            payload.model_dump(exclude_none=True)
        )

    async def delete_template(
        self,
        template_id
    ):

        return await self.repository.delete(template_id)
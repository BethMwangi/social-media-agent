from fastapi import HTTPException

from app.repositories.event_repository import EventRepository


class EventService:

    def __init__(self):
        self.repository = EventRepository()

    async def get_events(self):
        return await self.repository.get_all()

    async def get_event(self, event_id: str):
        return await self.repository.get_by_id(event_id)

    async def create_event(self, payload):
        return await self.repository.create(
            payload.model_dump()
        )

    async def update_event(
        self,
        event_id,
        payload
    ):
        return await self.repository.update(
            event_id,
            payload.model_dump(exclude_unset=True)
        )

    async def delete_event(self, event_id):
        return await self.repository.delete(event_id)
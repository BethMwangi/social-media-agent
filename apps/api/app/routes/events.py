from fastapi import APIRouter

from app.services.event_service import EventService
from app.schemas.event_schema import (
    EventCreate,
    EventUpdate
)

router = APIRouter()

service = EventService()


@router.get("")
async def get_events():

    return {
        "success": True,
        "data": await service.get_events()
    }


@router.get("/{event_id}")
async def get_event(event_id: str):

    return {
        "success": True,
        "data": await service.get_event(event_id)
    }


@router.post("")
async def create_event(
    payload: EventCreate
):

    return {
        "success": True,
        "data": await service.create_event(payload)
    }


@router.put("/{event_id}")
async def update_event(
    event_id: str,
    payload: EventUpdate
):

    return {
        "success": True,
        "data": await service.update_event(
            event_id,
            payload
        )
    }


@router.delete("/{event_id}")
async def delete_event(event_id: str):

    await service.delete_event(event_id)

    return {
        "success": True,
        "message": "Event deleted"
    }
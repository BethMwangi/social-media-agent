from typing import Optional

from fastapi import APIRouter

from app.schemas.hashtag_schema import (
    HashtagCreate,
    HashtagUpdate
)

from app.services.hashtag_service import (
    HashtagService
)

router = APIRouter()

service = HashtagService()


@router.get("")
async def get_hashtags_by_query(
    organization_id: Optional[str] = None
):

    if not organization_id:
        return {
            "success": True,
            "data": []
        }

    return {
        "success": True,
        "data": await service.get_hashtags(
            organization_id
        )
    }


@router.get("/{organization_id}")
async def get_hashtags(
    organization_id: str
):

    return {
        "success": True,
        "data": await service.get_hashtags(
            organization_id
        )
    }


@router.post("")
async def create_hashtag(
    payload: HashtagCreate
):

    return {
        "success": True,
        "data": await service.create_hashtag(
            payload
        )
    }


@router.put("/{hashtag_id}")
async def update_hashtag(
    hashtag_id: str,
    payload: HashtagUpdate
):

    return {
        "success": True,
        "data": await service.update_hashtag(
            hashtag_id,
            payload
        )
    }


@router.delete("/{hashtag_id}")
async def delete_hashtag(
    hashtag_id: str
):

    await service.delete_hashtag(
        hashtag_id
    )

    return {
        "success": True,
        "message": "Hashtag deleted"
    }

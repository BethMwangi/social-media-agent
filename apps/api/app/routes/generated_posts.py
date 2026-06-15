from fastapi import APIRouter, HTTPException

from app.schemas.generated_post import GeneratedPostCreate
from app.services.generated_post_service import GeneratedPostService

router = APIRouter()

service = GeneratedPostService()


@router.get("")
async def get_generated_posts():

    return {
        "success": True,
        "data": await service.get_generated_posts()
    }


@router.post("")
async def create_generated_post(payload: GeneratedPostCreate):
    try:
        data = await service.create_generated_post(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to create generated post: {exc}"
        ) from exc

    return {
        "success": True,
        "data": data
    }

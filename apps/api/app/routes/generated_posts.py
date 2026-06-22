from fastapi import APIRouter, HTTPException

from app.schemas.generated_post import (
    GeneratedPostCreate,
    GeneratedPostRegenerateDesignRequest,
    GeneratedPostUpdate,
)
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


@router.put("/{post_id}")
async def update_generated_post(
    post_id: str,
    payload: GeneratedPostUpdate,
):
    try:
        data = await service.update_generated_post(post_id, payload)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to update generated post: {exc}"
        ) from exc

    return {
        "success": True,
        "data": data,
    }


@router.post("/{post_id}/approve")
async def approve_generated_post(post_id: str):
    try:
        data = await service.approve_generated_post(post_id)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to approve generated post: {exc}"
        ) from exc

    return {
        "success": True,
        "data": data,
    }


@router.post("/{post_id}/regenerate-design")
async def regenerate_generated_post_design(
    post_id: str,
    payload: GeneratedPostRegenerateDesignRequest,
):
    try:
        data = await service.regenerate_generated_post_design(
            post_id,
            poster_instructions=payload.poster_instructions,
            generated_image_prompt=payload.generated_image_prompt,
            event_title=payload.event_title,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to regenerate generated post design: {exc}"
        ) from exc

    return {
        "success": True,
        "data": data,
    }

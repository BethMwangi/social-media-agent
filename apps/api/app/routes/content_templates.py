from fastapi import APIRouter

from app.schemas.content_template import (
    ContentTemplateCreate,
    ContentTemplateUpdate
)

from app.services.content_template_service import (
    ContentTemplateService
)

router = APIRouter()

service = ContentTemplateService()


@router.get("/")
async def get_templates():

    return {
        "success": True,
        "data": await service.get_templates()
    }


@router.get("/{template_id}")
async def get_template(template_id: str):

    return {
        "success": True,
        "data": await service.get_template(template_id)
    }


@router.post("/")
async def create_template(
    payload: ContentTemplateCreate
):

    return {
        "success": True,
        "data": await service.create_template(payload)
    }


@router.put("/{template_id}")
async def update_template(
    template_id: str,
    payload: ContentTemplateUpdate
):

    return {
        "success": True,
        "data": await service.update_template(
            template_id,
            payload
        )
    }


@router.delete("/{template_id}")
async def delete_template(
    template_id: str
):

    await service.delete_template(template_id)

    return {
        "success": True,
        "message": "Template deleted"
    }
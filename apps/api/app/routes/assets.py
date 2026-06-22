from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import Response

from app.schemas.assets import (
    AssetCreate,
    AssetUpdate
)

from app.services.asset_service import AssetService

router = APIRouter()

service = AssetService()


@router.get("/")
async def get_assets():

    return {
        "success": True,
        "data": await service.get_assets()
    }


@router.get("/{asset_id}")
async def get_asset(asset_id: str):

    return {
        "success": True,
        "data": await service.get_asset(asset_id)
    }


@router.get("/{asset_id}/content")
async def get_asset_content(asset_id: str):

    payload = await service.get_asset_content(asset_id)

    return Response(
        content=payload["content"],
        media_type=payload["content_type"],
        headers={
            "Content-Disposition": (
                f'inline; filename="{payload["filename"]}"'
            )
        },
    )


@router.post("/")
async def create_asset(payload: AssetCreate):

    return {
        "success": True,
        "data": await service.create_asset(payload)
    }


@router.post("/upload")
async def upload_asset(
    file: UploadFile = File(...),
    organization_id: str = Form(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    platform: Optional[str] = Form(None),
    asset_type: Optional[str] = Form(None),
    dimensions: Optional[str] = Form(None),
    uploaded_by: Optional[str] = Form(None),
    template_category: Optional[str] = Form(None),
    is_template: bool = Form(False),
    canva_template_url: Optional[str] = Form(None),
    campaign_id: Optional[str] = Form(None)
):

    return {
        "success": True,
        "data": await service.upload_asset(
            organization_id,
            file,
            name=name,
            description=description,
            platform=platform,
            asset_type=asset_type,
            dimensions=dimensions,
            uploaded_by=uploaded_by,
            template_category=template_category,
            is_template=is_template,
            canva_template_url=canva_template_url,
            campaign_id=campaign_id
        )
    }


@router.put("/{asset_id}")
async def update_asset(
    asset_id: str,
    payload: AssetUpdate
):

    return {
        "success": True,
        "data": await service.update_asset(
            asset_id,
            payload
        )
    }


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):

    await service.delete_asset(asset_id)

    return {
        "success": True,
        "message": "Asset deleted"
    }

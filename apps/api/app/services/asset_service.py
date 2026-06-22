import mimetypes
import re
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse
from uuid import uuid4
from xml.etree import ElementTree

from fastapi import HTTPException
from fastapi import UploadFile

from app.repositories.asset_repository import AssetRepository


class AssetService:

    BUCKET_NAME = "marketing-assets"
    SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7

    def __init__(self):
        self.repository = AssetRepository()

    async def get_assets(self):
        assets = await self.repository.get_all()

        return [
            await self._attach_signed_url(asset)
            for asset in assets
        ]

    async def get_asset(self, asset_id: str):

        try:
            asset = await self.repository.get_by_id(asset_id)

            return await self._attach_signed_url(asset)

        except Exception:
            raise HTTPException(
                status_code=404,
                detail="Asset not found"
            )

    async def create_asset(self, payload):
        asset = await self.repository.create(
            payload.model_dump(exclude_none=True)
        )

        return await self._attach_signed_url(asset)

    async def create_generated_asset(
        self,
        organization_id: str,
        name: str,
        file_bytes: bytes,
        description: Optional[str] = None,
        platform: Optional[str] = None,
        dimensions: Optional[str] = None,
        uploaded_by: Optional[str] = "ai",
        template_category: Optional[str] = None,
        campaign_id: Optional[str] = None,
        file_extension: str = ".png",
        content_type: str = "image/png",
    ):

        storage_path = self._build_storage_path(
            organization_id=organization_id,
            name=name,
            file_extension=file_extension,
            is_template=False,
            template_category=template_category,
        )

        file_url = await self.repository.upload_file(
            self.BUCKET_NAME,
            storage_path,
            file_bytes,
            content_type
        )

        asset = await self.repository.create(
            self._build_asset_payload(
                organization_id=organization_id,
                name=name,
                description=description,
                platform=platform,
                asset_type="image",
                dimensions=dimensions,
                uploaded_by=uploaded_by,
                template_category=template_category,
                is_template=False,
                canva_template_url=None,
                campaign_id=campaign_id,
                file_url=file_url,
            )
        )

        return await self._attach_signed_url(asset)

    async def upload_asset(
        self,
        organization_id: str,
        file: UploadFile,
        name: str,
        description: Optional[str] = None,
        platform: Optional[str] = None,
        asset_type: Optional[str] = None,
        dimensions: Optional[str] = None,
        uploaded_by: Optional[str] = None,
        template_category: Optional[str] = None,
        is_template: bool = False,
        canva_template_url: Optional[str] = None,
        campaign_id: Optional[str] = None
    ):

        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty"
            )

        file_extension = Path(file.filename or "").suffix.lower()

        if not file_extension:
            file_extension = self._guess_extension(file.content_type)

        storage_path = self._build_storage_path(
            organization_id=organization_id,
            name=name,
            file_extension=file_extension,
            is_template=is_template,
            template_category=template_category,
        )

        file_url = await self.repository.upload_file(
            self.BUCKET_NAME,
            storage_path,
            file_bytes,
            file.content_type
        )

        resolved_asset_type = self._normalize_value(asset_type)

        if not resolved_asset_type:
            resolved_asset_type = self._to_asset_type(
                file.content_type,
                file.filename
            )

        asset = await self.repository.create(
            self._build_asset_payload(
                organization_id=organization_id,
                name=name,
                description=description,
                platform=platform,
                asset_type=resolved_asset_type,
                dimensions=dimensions,
                uploaded_by=uploaded_by,
                template_category=template_category,
                is_template=is_template,
                canva_template_url=canva_template_url,
                campaign_id=campaign_id,
                file_url=file_url,
            )
        )

        return await self._attach_signed_url(asset)

    async def update_asset(self, asset_id, payload):

        asset = await self.repository.update(
            asset_id,
            payload.model_dump(exclude_none=True)
        )

        return await self._attach_signed_url(asset)

    async def delete_asset(self, asset_id):

        return await self.repository.delete(asset_id)

    async def get_asset_content(self, asset_id: str):

        asset = await self.get_asset(asset_id)
        storage_path = self._storage_path_from_url(asset["file_url"])

        if not storage_path:
            raise HTTPException(
                status_code=404,
                detail="Asset file is not available"
            )

        content = await self.repository.download_file(
            self.BUCKET_NAME,
            storage_path,
        )

        content_type = (
            mimetypes.guess_type(asset["file_url"])[0]
            or "application/octet-stream"
        )

        if content_type == "image/svg+xml":
            content = self._sanitize_svg_bytes(content)

        return {
            "content": content,
            "content_type": content_type,
            "filename": Path(storage_path).name,
        }

    def _sanitize_svg_bytes(self, content: bytes) -> bytes:
        text = content.decode("utf-8", errors="ignore")
        sanitized = re.sub(
            r"&(?!#\d+;|#x[0-9a-fA-F]+;|amp;|lt;|gt;|quot;|apos;)",
            "&amp;",
            text,
        )

        try:
            ElementTree.fromstring(sanitized)
        except ElementTree.ParseError:
            return content

        return sanitized.encode("utf-8")

    def _guess_extension(
        self,
        content_type: Optional[str]
    ) -> str:

        if not content_type or "/" not in content_type:
            return ""

        subtype = content_type.split("/", 1)[1].split(";", 1)[0]

        if not subtype:
            return ""

        if subtype == "jpeg":
            subtype = "jpg"

        return f".{subtype}"

    def _to_asset_type(
        self,
        content_type: Optional[str],
        filename: Optional[str]
    ) -> str:

        if content_type:
            if content_type.startswith("image/"):
                return "image"

            if content_type.startswith("video/"):
                return "video"

        suffix = Path(filename or "").suffix.lower()

        if suffix in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}:
            return "image"

        if suffix in {".mp4", ".mov", ".avi", ".webm", ".mkv"}:
            return "video"

        return "document"

    def _build_storage_path(
        self,
        organization_id: str,
        name: str,
        file_extension: str,
        is_template: bool,
        template_category: Optional[str],
    ) -> str:

        slug = self._slugify(name) or uuid4().hex
        suffix = uuid4().hex[:8]

        if is_template:
            folder = "templates"

            if template_category:
                folder = (
                    f"{folder}/{self._slugify(template_category)}"
                )
        else:
            folder = f"organizations/{organization_id}"

        return f"{folder}/{slug}-{suffix}{file_extension}"

    def _build_asset_payload(
        self,
        organization_id: str,
        name: str,
        description: Optional[str],
        platform: Optional[str],
        asset_type: str,
        dimensions: Optional[str],
        uploaded_by: Optional[str],
        template_category: Optional[str],
        is_template: bool,
        canva_template_url: Optional[str],
        campaign_id: Optional[str],
        file_url: str,
    ) -> dict:

        payload = {
            "organization_id": organization_id,
            "name": name.strip(),
            "description": self._normalize_value(description),
            "platform": self._normalize_value(platform),
            "asset_type": asset_type,
            "dimensions": self._normalize_value(dimensions),
            "file_url": file_url,
            "uploaded_by": self._normalize_value(uploaded_by),
            "template_category": self._normalize_value(template_category),
            "is_template": is_template,
            "canva_template_url": self._normalize_value(canva_template_url),
            "campaign_id": self._normalize_value(campaign_id),
        }

        return {
            key: value
            for key, value in payload.items()
            if value is not None
        }

    def _normalize_value(
        self,
        value: Optional[str]
    ) -> Optional[str]:

        if value is None:
            return None

        normalized = value.strip()

        return normalized or None

    def _slugify(self, value: str) -> str:

        slug = re.sub(
            r"[^a-z0-9]+",
            "-",
            value.lower(),
        ).strip("-")

        return slug

    async def _attach_signed_url(self, asset: dict) -> dict:

        if not asset or not asset.get("file_url"):
            return asset

        storage_path = self._storage_path_from_url(asset["file_url"])

        if not storage_path:
            return asset

        signed_file_url = await self.repository.create_signed_url(
            self.BUCKET_NAME,
            storage_path,
            self.SIGNED_URL_TTL_SECONDS
        )

        return {
            **asset,
            "signed_file_url": signed_file_url,
        }

    def _storage_path_from_url(self, file_url: str) -> Optional[str]:

        path = urlparse(file_url).path
        bucket_marker = f"/{self.BUCKET_NAME}/"

        if bucket_marker not in path:
            return None

        return path.split(bucket_marker, 1)[1]

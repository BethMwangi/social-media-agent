import asyncio
import base64
import json
import urllib.error
import urllib.request
from textwrap import dedent

from app.core.settings import settings
from app.repositories.asset_repository import AssetRepository
from app.repositories.brand_settings_repository import (
    BrandSettingsRepository,
)
from app.repositories.hashtag_repository import HashtagRepository
from app.repositories.org_repository import OrganizationRepository
from app.services.asset_service import AssetService


class AICampaignService:

    ANTHROPIC_MODEL = "claude-3-5-sonnet-latest"
    OPENAI_IMAGE_MODEL = "gpt-image-1"

    def __init__(self):
        self.organization_repository = OrganizationRepository()
        self.brand_settings_repository = BrandSettingsRepository()
        self.hashtag_repository = HashtagRepository()
        self.asset_repository = AssetRepository()
        self.asset_service = AssetService()

    async def generate_campaign(self, payload):
        organization = await self.organization_repository.get_by_id(
            payload.organization_id
        )
        brand_settings = await (
            self.brand_settings_repository.get_by_organization_id(
                payload.organization_id
            )
        )
        hashtags = await self.hashtag_repository.get_by_organization_id(
            payload.organization_id
        )
        asset = await self.asset_repository.get_by_id(
            payload.selected_asset_id
        )

        context = {
            "organization": organization,
            "brand_settings": brand_settings,
            "hashtags": hashtags,
            "asset": asset,
            "campaign_request": payload.model_dump(),
        }

        generated = await self._generate_with_claude_or_fallback(context)
        design_output = await self._generate_design_asset(context, generated)

        return {
            **generated,
            **design_output,
            "raw_context": {
                "organization": {
                    "id": organization.get("id"),
                    "name": organization.get("name"),
                    "mission": organization.get("mission"),
                    "purpose": organization.get("purpose"),
                    "audience": organization.get("audience"),
                },
                "brand_settings": brand_settings,
                "hashtags": hashtags,
                "selected_asset": asset,
            },
        }

    async def _generate_with_claude_or_fallback(self, context: dict):
        if settings.ANTHROPIC_API_KEY:
            try:
                generated = await asyncio.to_thread(
                    self._call_anthropic,
                    context,
                )
                return {
                    **generated,
                    "generation_mode": "anthropic",
                    "ai_model": self.ANTHROPIC_MODEL,
                    "generation_error": None,
                }
            except Exception as exc:
                return self._fallback_response(
                    context,
                    generation_error=str(exc),
                )

        return self._fallback_response(context)

    async def _generate_design_asset(
        self,
        context: dict,
        generated: dict,
    ):
        if not settings.OPENAI_API_KEY:
            return {
                "design_generation_mode": "not_configured",
                "design_generation_error": (
                    "OPENAI_API_KEY is not configured for poster generation."
                ),
                "generated_design_asset": None,
            }

        try:
            prompt = self._build_design_prompt(context, generated)
            image_bytes = await asyncio.to_thread(
                self._call_openai_image_generation,
                prompt,
                context,
            )
            request = context["campaign_request"]
            event = request["event"]
            asset = await self.asset_service.create_generated_asset(
                organization_id=request["organization_id"],
                name=(
                    f"{event['title']} {request['platform']} generated poster"
                ),
                file_bytes=image_bytes,
                description=(
                    generated.get("poster_instructions")
                    or generated.get("generated_image_prompt")
                ),
                platform=request.get("platform"),
                dimensions=self._resolve_design_dimensions(
                    context["asset"].get("dimensions"),
                    request.get("platform"),
                ),
                uploaded_by="ai",
                template_category=request.get("campaign_type"),
            )

            return {
                "design_generation_mode": "openai-image",
                "design_generation_error": None,
                "generated_design_asset": asset,
            }
        except Exception as exc:
            return {
                "design_generation_mode": "failed",
                "design_generation_error": str(exc),
                "generated_design_asset": None,
            }

    def _call_anthropic(self, context: dict):
        prompt = self._build_prompt(context)
        request_body = {
            "model": self.ANTHROPIC_MODEL,
            "max_tokens": 1400,
            "temperature": 0.7,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        }

        request = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps(request_body).encode("utf-8"),
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(
                f"Anthropic generation failed: {detail or exc.reason}"
            ) from exc

        text = "".join(
            block.get("text", "")
            for block in payload.get("content", [])
            if isinstance(block, dict)
        )

        return self._parse_model_json(text)

    def _parse_model_json(self, text: str):
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            cleaned = text.strip()

            if cleaned.startswith("```"):
                cleaned = cleaned.strip("`")

                if cleaned.startswith("json"):
                    cleaned = cleaned[4:].strip()

            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                start = cleaned.find("{")
                end = cleaned.rfind("}")

                if start != -1 and end != -1 and end > start:
                    return json.loads(cleaned[start:end + 1])

                raise

    def _call_openai_image_generation(
        self,
        prompt: str,
        context: dict,
    ) -> bytes:
        request_body = {
            "model": self.OPENAI_IMAGE_MODEL,
            "prompt": prompt,
            "size": self._resolve_openai_image_size(
                context["asset"].get("dimensions"),
                context["campaign_request"].get("platform"),
            ),
        }

        request = urllib.request.Request(
            "https://api.openai.com/v1/images/generations",
            data=json.dumps(request_body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "content-type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(
                f"OpenAI image generation failed: {detail or exc.reason}"
            ) from exc

        data = payload.get("data") or []
        b64_json = data[0].get("b64_json") if data else None

        if not b64_json:
            raise RuntimeError(
                "OpenAI image generation returned no image data"
            )

        return base64.b64decode(b64_json)

    def _build_prompt(self, context: dict) -> str:
        return dedent(
            f"""
            You are BuildHerAI's campaign creator agent.
            Return JSON only with these keys: caption, short_caption,
            hashtags, call_to_action, template_recommendation,
            generated_image_prompt, instagram_caption, linkedin_post,
            twitter_post, poster_instructions, ai_reasoning.

            Organization context:
            {json.dumps(context['organization'], default=str)}

            Brand settings:
            {json.dumps(context['brand_settings'], default=str)}

            Hashtags:
            {json.dumps(context['hashtags'], default=str)}

            Selected template:
            {json.dumps(context['asset'], default=str)}

            Campaign request:
            {json.dumps(context['campaign_request'], default=str)}
            """
        ).strip()

    def _build_design_prompt(
        self,
        context: dict,
        generated: dict,
    ) -> str:
        organization = context["organization"]
        brand_settings = context["brand_settings"] or {}
        asset = context["asset"] or {}
        request = context["campaign_request"]
        event = request["event"]
        mission_message = (
            organization.get("mission")
            or organization.get("purpose")
        )
        registration_message = (
            event.get("registration_url")
            or "Include a call to register"
        )

        return dedent(
            f"""
            Create a brand-new social media poster image.
            Do not return text or JSON. Generate the poster artwork itself.

            Organization: {organization.get('name')}
                        Mission:
            {mission_message}
            Audience: {organization.get('audience')}

            Platform: {request.get('platform')}
            Campaign type: {request.get('campaign_type')}
            Event title: {event.get('title')}
            Event date: {event.get('date')}
            Event location: {event.get('location') or 'TBD'}
                        Registration URL:
            {registration_message}
            Event description: {event.get('description')}

                        Use the selected template only as visual inspiration,
                        not as a final output:
            Template name: {asset.get('name')}
            Template description: {asset.get('description')}
            Template category: {asset.get('template_category')}
            Template dimensions: {asset.get('dimensions')}

                        Brand colors:
                        primary {brand_settings.get('primary_color')},
                        secondary {brand_settings.get('secondary_color')},
                        accent {brand_settings.get('accent_color')}
            Brand font: {brand_settings.get('font_family')}
            Brand tone: {brand_settings.get('tone')}

            Required poster goals:
                        - Create a fresh poster design
                            with new event-specific text content.
                        - Keep the layout polished, modern,
                            readable, and social-media ready.
            - Emphasize the event title, date, location, and registration CTA.
                        - Use the following design brief:
                            {generated.get('poster_instructions')}
                        - Follow this image prompt guidance:
                            {generated.get('generated_image_prompt')}
            """
        ).strip()

    def _resolve_openai_image_size(
        self,
        dimensions: str,
        platform: str,
    ) -> str:
        if dimensions:
            normalized = dimensions.lower().replace(" ", "")

            if "x" in normalized:
                width_raw, height_raw = normalized.split("x", 1)

                try:
                    width = int(width_raw)
                    height = int(height_raw)
                except ValueError:
                    width = 0
                    height = 0

                if width and height:
                    if height > width:
                        return "1024x1536"

                    if width > height:
                        return "1536x1024"

        if platform == "instagram":
            return "1024x1536"

        return "1024x1024"

    def _resolve_design_dimensions(
        self,
        dimensions: str,
        platform: str,
    ) -> str:
        if dimensions:
            return dimensions

        if platform == "instagram":
            return "1024x1536"

        return "1024x1024"

    def _fallback_response(
        self,
        context: dict,
        generation_error: str = None,
    ):
        organization = context["organization"]
        brand_settings = context["brand_settings"] or {}
        asset = context["asset"]
        request = context["campaign_request"]
        event = request["event"]
        stored_tags = [
            item.get("tag", "")
            for item in context["hashtags"]
            if item.get("tag")
        ]
        normalized_tags = [
            tag if tag.startswith("#") else f"#{tag}"
            for tag in stored_tags
        ]
        call_to_action = (
            f"Register now: {event.get('registration_url')}"
            if event.get("registration_url")
            else "Join the BuildHerAI community and save your spot."
        )
        event_location = event.get("location") or "our community"
        organization_message = (
            organization.get("mission")
            or organization.get("purpose")
            or "Build with confidence alongside the community."
        )
        audience_summary = (
            organization.get("audience")
            or "our growing builder community"
        )
        tone_summary = (
            brand_settings.get("tone")
            or "clear and empowering"
        )
        font_summary = (
            brand_settings.get("font_family")
            or "the brand font"
        )
        primary_color = (
            brand_settings.get("primary_color")
            or "the brand palette"
        )
        template_name = asset.get("name") or "selected asset"
        template_platform = (
            asset.get("platform")
            or request.get("platform")
        )
        template_category = (
            asset.get("template_category")
            or request.get("campaign_type")
        )
        instagram_caption = dedent(
            f"""
            {event['title']} is coming to {event_location} on {event['date']}.

            {event['description']}

            {organization_message}

            {call_to_action}

            {' '.join(normalized_tags[:5])}
            """
        ).strip()
        linkedin_post = dedent(
            f"""
            BuildHerAI Labs is announcing {event['title']} for {event['date']}.

            This campaign speaks to {audience_summary} and carries a
            {tone_summary} tone.

            {event['description']}

            {call_to_action}
            """
        ).strip()
        twitter_post = dedent(
            f"""
            {event['title']} lands on {event['date']} in {event_location}.

            {event['description']}

            {call_to_action}
            {' '.join(normalized_tags[:3])}
            """
        ).strip()

        return {
            "caption": instagram_caption,
            "short_caption": (
                f"{event['title']} · {event['date']} · {call_to_action}"
            ),
            "hashtags": normalized_tags,
            "call_to_action": call_to_action,
            "generation_mode": "fallback",
            "ai_model": None,
            "generation_error": generation_error,
            "design_generation_mode": "not_attempted",
            "design_generation_error": None,
            "generated_design_asset": None,
            "template_recommendation": {
                "asset_id": asset.get("id"),
                "name": asset.get("name") or "Selected template",
                "reason": (
                    "Chosen because it is a "
                    f"{template_platform} template tagged for "
                    f"{template_category} and it visually matches "
                    "the campaign format."
                ),
                "file_url": (
                    asset.get("signed_file_url")
                    or asset.get("file_url")
                ),
            },
            "generated_image_prompt": (
                "Create an "
                f"{request.get('platform')} promotional visual for "
                f"{event['title']} using {font_summary}, primary colors "
                f"{primary_color}, and a confident "
                f"{brand_settings.get('tone') or 'on-brand'} tone."
            ),
            "instagram_caption": instagram_caption,
            "linkedin_post": linkedin_post,
            "twitter_post": twitter_post,
            "poster_instructions": (
                f"Use the template {template_name} with strong hierarchy "
                f"for the title, date {event['date']}, location "
                f"{event.get('location') or 'TBD'}, and a clear "
                "registration CTA."
            ),
            "ai_reasoning": (
                "The selected template aligns with the "
                f"{request.get('campaign_type')} workflow, supports "
                f"{request.get('platform')} formatting, and reinforces "
                f"BuildHerAI's mission: {organization_message}."
            ),
        }

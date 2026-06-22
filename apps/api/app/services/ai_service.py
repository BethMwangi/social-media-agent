import asyncio
import html
import json
import re
from typing import Optional
import urllib.error
import urllib.request
from textwrap import dedent
from xml.etree import ElementTree

from app.core.settings import settings
from app.repositories.asset_repository import AssetRepository
from app.repositories.brand_settings_repository import (
    BrandSettingsRepository,
)
from app.repositories.hashtag_repository import HashtagRepository
from app.repositories.org_repository import OrganizationRepository
from app.services.asset_service import AssetService


class AICampaignService:

    DEFAULT_TEXT_MODELS = [
        "claude-sonnet-4-6",
        "claude-sonnet-4-5-20250929",
        "claude-opus-4-8",
    ]
    DEFAULT_DESIGN_MODELS = [
        "claude-haiku-4-5-20251001",
        "claude-sonnet-4-5-20250929",
        "claude-sonnet-4-6",
    ]
    MODEL_ALIASES = {
        "haiku": [
            "claude-haiku-4-5-20251001",
        ],
        "sonnet": [
            "claude-sonnet-4-6",
            "claude-sonnet-4-5-20250929",
        ],
        "opus": [
            "claude-opus-4-8",
            "claude-opus-4-7",
            "claude-opus-4-6",
        ],
    }

    def __init__(self):
        self.organization_repository = OrganizationRepository()
        self.brand_settings_repository = BrandSettingsRepository()
        self.hashtag_repository = HashtagRepository()
        self.asset_repository = AssetRepository()
        self.asset_service = AssetService()

    async def list_available_models(self):
        if not self._anthropic_api_key():
            raise RuntimeError(
                "ANTHROPIC_API_KEY or CLAUDE_API_KEY is not configured."
            )

        payload = await asyncio.to_thread(self._fetch_anthropic_models)
        models = payload.get("data", []) if isinstance(payload, dict) else []

        return {
            "configured_text_models": self._text_models(),
            "configured_design_models": self._design_models(),
            "available_models": models,
        }

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

    async def regenerate_design_for_generated_post(
        self,
        post: dict,
        asset: dict,
        poster_instructions: Optional[str] = None,
        generated_image_prompt: Optional[str] = None,
        event_title: Optional[str] = None,
    ) -> dict:
        organization_id = post.get("organization_id") or asset.get(
            "organization_id"
        )

        if not organization_id:
            raise RuntimeError(
                "Generated post is missing organization_id "
                "for design regeneration."
            )

        organization = await self.organization_repository.get_by_id(
            organization_id
        )
        brand_settings = await (
            self.brand_settings_repository.get_by_organization_id(
                organization_id
            )
        )
        hashtags = await self.hashtag_repository.get_by_organization_id(
            organization_id
        )

        resolved_title = (
            event_title
            or asset.get("name")
            or f"{post.get('platform', 'social')} design"
        )
        post_content = (post.get("content") or "").strip()
        description = post_content or (
            asset.get("description")
            or "Refresh this design for approval."
        )
        resolved_instructions = (
            poster_instructions
            or asset.get("description")
            or (
                "Create a fresh "
                f"{post.get('platform') or 'social'} poster variation."
            )
        )
        resolved_prompt = (
            generated_image_prompt
            or description
        )

        context = {
            "organization": organization,
            "brand_settings": brand_settings,
            "hashtags": hashtags,
            "asset": asset,
            "campaign_request": {
                "organization_id": organization_id,
                "platform": (
                    post.get("platform")
                    or asset.get("platform")
                    or "instagram"
                ),
                "campaign_type": (
                    asset.get("template_category")
                    or "generated_post"
                ),
                "event": {
                    "title": resolved_title,
                    "date": "TBD",
                    "location": None,
                    "registration_url": None,
                    "description": description,
                },
            },
        }

        generated = {
            "poster_instructions": resolved_instructions,
            "generated_image_prompt": resolved_prompt,
        }

        return await self._generate_design_asset(context, generated)

    async def _generate_with_claude_or_fallback(self, context: dict):
        if self._anthropic_api_key():
            try:
                generated = await asyncio.to_thread(
                    self._call_anthropic,
                    context,
                )
                return {
                    **generated,
                    "generation_mode": "anthropic",
                    "ai_model": generated.get("_ai_model"),
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
        if not self._anthropic_api_key():
            return {
                "design_generation_mode": "not_configured",
                "design_generation_error": (
                    "ANTHROPIC_API_KEY or CLAUDE_API_KEY is not "
                    "configured for poster generation."
                ),
                "generated_design_asset": None,
            }

        try:
            svg_markup = await asyncio.to_thread(
                self._call_anthropic_svg,
                context,
                generated,
            )
            request = context["campaign_request"]
            event = request["event"]
            asset = await self.asset_service.create_generated_asset(
                organization_id=request["organization_id"],
                name=(
                    f"{event['title']} {request['platform']} generated poster"
                ),
                file_bytes=svg_markup.encode("utf-8"),
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
                file_extension=".svg",
                content_type="image/svg+xml",
            )

            return {
                "design_generation_mode": "anthropic-svg",
                "design_ai_model": self._design_model_name(),
                "design_generation_error": None,
                "generated_design_asset": asset,
            }
        except Exception as exc:
            return {
                "design_generation_mode": "failed",
                "design_ai_model": self._design_model_name(),
                "design_generation_error": str(exc),
                "generated_design_asset": None,
            }

    def _call_anthropic(self, context: dict):
        prompt = self._build_prompt(context)
        payload, model = self._request_anthropic_message(
            prompt=prompt,
            max_tokens=1400,
            temperature=0.7,
            error_prefix="Anthropic generation failed",
            models=self._text_models(),
        )

        text = "".join(
            block.get("text", "")
            for block in payload.get("content", [])
            if isinstance(block, dict)
        )

        generated = self._parse_campaign_response(text, context)
        generated["_ai_model"] = model

        return generated

    def _call_anthropic_svg(
        self,
        context: dict,
        generated: dict,
    ) -> str:
        prompt = self._build_design_prompt(context, generated)
        payload, _ = self._request_anthropic_message(
            prompt=prompt,
            max_tokens=2400,
            temperature=0.4,
            error_prefix="Anthropic poster generation failed",
            models=self._design_models(),
        )

        text = "".join(
            block.get("text", "")
            for block in payload.get("content", [])
            if isinstance(block, dict)
        )

        return self._extract_svg_markup(text)

    def _request_anthropic_message(
        self,
        prompt: str,
        max_tokens: int,
        temperature: float,
        error_prefix: str,
        models: list[str],
    ):
        attempted_errors = []

        for model in models:
            request_body = {
                "model": model,
                "max_tokens": max_tokens,
                "temperature": temperature,
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
                    "x-api-key": self._anthropic_api_key(),
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                method="POST",
            )

            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    payload = json.loads(response.read().decode("utf-8"))

                return payload, model
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="ignore")
                attempted_errors.append(f"{model}: {detail or exc.reason}")

                if exc.code != 404 and "not_found_error" not in detail:
                    raise RuntimeError(
                        f"{error_prefix}: {detail or exc.reason}"
                    ) from exc

        raise RuntimeError(
            f"{error_prefix}: no configured Anthropic model was available. "
            f"Tried: {' | '.join(attempted_errors)}"
        )

    def _fetch_anthropic_models(self):
        request = urllib.request.Request(
            "https://api.anthropic.com/v1/models",
            headers={
                "x-api-key": self._anthropic_api_key(),
                "anthropic-version": "2023-06-01",
            },
            method="GET",
        )

        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(
                f"Anthropic model listing failed: {detail or exc.reason}"
            ) from exc

    def _extract_svg_markup(self, text: str) -> str:
        cleaned = text.strip()

        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")

            if cleaned.startswith("svg"):
                cleaned = cleaned[3:].strip()

        start = cleaned.find("<svg")
        end = cleaned.rfind("</svg>")

        if start == -1 or end == -1:
            raise RuntimeError("Anthropic poster generation returned no SVG")

        svg = cleaned[start:end + len("</svg>")]

        if "xmlns=\"http://www.w3.org/2000/svg\"" not in svg:
            svg = svg.replace(
                "<svg",
                '<svg xmlns="http://www.w3.org/2000/svg"',
                1,
            )

        return self._sanitize_svg_markup(svg)

    def _sanitize_svg_markup(self, svg: str) -> str:
        sanitized = re.sub(
            r"&(?!#\d+;|#x[0-9a-fA-F]+;|amp;|lt;|gt;|quot;|apos;)",
            "&amp;",
            svg,
        )

        try:
            ElementTree.fromstring(sanitized)
        except ElementTree.ParseError as exc:
            raise RuntimeError(
                f"Anthropic poster generation returned invalid SVG: {exc}"
            ) from exc

        return sanitized

    def _anthropic_api_key(self) -> str:
        return settings.ANTHROPIC_API_KEY or settings.CLAUDE_API_KEY

    def _text_models(self) -> list[str]:
        configured = [
            settings.ANTHROPIC_TEXT_MODEL,
            settings.CLAUDE_TEXT_MODEL,
            settings.ANTHROPIC_MODEL,
            settings.CLAUDE_MODEL,
        ]
        return self._expand_model_candidates(
            [model for model in configured if model],
            self.DEFAULT_TEXT_MODELS,
        )

    def _design_models(self) -> list[str]:
        configured = [
            settings.ANTHROPIC_DESIGN_MODEL,
            settings.CLAUDE_DESIGN_MODEL,
            settings.ANTHROPIC_TEXT_MODEL,
            settings.CLAUDE_TEXT_MODEL,
            settings.ANTHROPIC_MODEL,
            settings.CLAUDE_MODEL,
        ]
        return self._expand_model_candidates(
            [model for model in configured if model],
            self.DEFAULT_DESIGN_MODELS,
        )

    def _design_model_name(self) -> str:
        configured = (
            settings.ANTHROPIC_DESIGN_MODEL
            or settings.CLAUDE_DESIGN_MODEL
            or settings.ANTHROPIC_TEXT_MODEL
            or settings.CLAUDE_TEXT_MODEL
            or settings.ANTHROPIC_MODEL
            or settings.CLAUDE_MODEL
            or "haiku"
        )

        return configured

    def _expand_model_candidates(
        self,
        configured: list[str],
        defaults: list[str],
    ) -> list[str]:
        models = []

        for model in configured:
            for candidate in self._resolve_model_alias(model):
                if candidate not in models:
                    models.append(candidate)

        for model in defaults:
            if model not in models:
                models.append(model)

        return models

    def _resolve_model_alias(self, model: str) -> list[str]:
        normalized = model.strip().lower()

        if normalized in self.MODEL_ALIASES:
            return self.MODEL_ALIASES[normalized]

        return [model]

    def _parse_campaign_response(
        self,
        text: str,
        context: dict,
    ) -> dict:
        parse_errors = []
        tried_tagged = False

        if "<campaign>" in text or "<caption>" in text:
            tried_tagged = True
            try:
                return self._parse_tagged_campaign_response(text, context)
            except Exception as exc:
                parse_errors.append(str(exc))

        try:
            payload = self._parse_model_json(text)
            return self._coerce_generated_payload(payload, context)
        except Exception as exc:
            parse_errors.append(str(exc))

        if not tried_tagged:
            try:
                return self._parse_tagged_campaign_response(text, context)
            except Exception as exc:
                parse_errors.append(str(exc))

        raise RuntimeError(
            "Unable to parse Claude campaign response. "
            + " | ".join(parse_errors)
        )

    def _coerce_generated_payload(
        self,
        payload: dict,
        context: dict,
    ) -> dict:
        if not isinstance(payload, dict):
            raise RuntimeError("Claude response was not a JSON object")

        template = payload.get("template_recommendation") or {}
        hashtags = self._coerce_hashtags(payload.get("hashtags"))

        return {
            "caption": self._required_text(
                payload,
                "caption",
            ),
            "short_caption": self._required_text(
                payload,
                "short_caption",
            ),
            "hashtags": hashtags,
            "call_to_action": self._required_text(
                payload,
                "call_to_action",
            ),
            "template_recommendation": self._build_template_recommendation(
                context,
                template.get("reason")
                or payload.get("template_reason"),
            ),
            "generated_image_prompt": self._required_text(
                payload,
                "generated_image_prompt",
            ),
            "instagram_caption": self._required_text(
                payload,
                "instagram_caption",
                "caption",
            ),
            "linkedin_post": self._required_text(
                payload,
                "linkedin_post",
            ),
            "twitter_post": self._required_text(
                payload,
                "twitter_post",
            ),
            "poster_instructions": self._required_text(
                payload,
                "poster_instructions",
            ),
            "ai_reasoning": self._required_text(
                payload,
                "ai_reasoning",
            ),
        }

    def _parse_tagged_campaign_response(
        self,
        text: str,
        context: dict,
    ) -> dict:
        return {
            "caption": self._extract_tag_value(text, "caption"),
            "short_caption": self._extract_tag_value(text, "short_caption"),
            "hashtags": self._coerce_hashtags(
                self._extract_tag_value(text, "hashtags")
            ),
            "call_to_action": self._extract_tag_value(
                text,
                "call_to_action",
            ),
            "template_recommendation": self._build_template_recommendation(
                context,
                self._extract_tag_value(text, "template_reason"),
            ),
            "generated_image_prompt": self._extract_tag_value(
                text,
                "generated_image_prompt",
            ),
            "instagram_caption": self._extract_tag_value(
                text,
                "instagram_caption",
            ),
            "linkedin_post": self._extract_tag_value(text, "linkedin_post"),
            "twitter_post": self._extract_tag_value(text, "twitter_post"),
            "poster_instructions": self._extract_tag_value(
                text,
                "poster_instructions",
            ),
            "ai_reasoning": self._extract_tag_value(text, "ai_reasoning"),
        }

    def _extract_tag_value(self, text: str, tag: str) -> str:
        match = re.search(
            rf"<{tag}>\s*(.*?)\s*</{tag}>",
            text,
            re.DOTALL | re.IGNORECASE,
        )

        if not match:
            raise RuntimeError(f"Missing <{tag}> in Claude response")

        value = html.unescape(match.group(1).strip())

        if not value:
            raise RuntimeError(f"Empty <{tag}> in Claude response")

        return value

    def _required_text(self, payload: dict, *keys: str) -> str:
        for key in keys:
            value = payload.get(key)

            if isinstance(value, str) and value.strip():
                return html.unescape(value.strip())

        raise RuntimeError(
            "Missing required field in Claude response: "
            + ", ".join(keys)
        )

    def _coerce_hashtags(self, value) -> list[str]:
        if isinstance(value, list):
            return self._normalize_hashtags(value)

        if isinstance(value, str):
            raw_tags = [
                item.strip()
                for item in re.split(r"[\n,]", value)
                if item.strip()
            ]
            return self._normalize_hashtags(raw_tags)

        return []

    def _normalize_hashtags(self, tags: list[str]) -> list[str]:
        normalized = []
        seen = set()

        for tag in tags:
            cleaned = html.unescape(str(tag)).strip().strip(",")
            cleaned = cleaned.lstrip("#")
            cleaned = re.sub(r"\s+", "", cleaned)

            if not cleaned:
                continue

            normalized_tag = f"#{cleaned}"
            normalized_key = normalized_tag.lower()

            if normalized_key in seen:
                continue

            normalized.append(normalized_tag)
            seen.add(normalized_key)

        return normalized

    def _build_template_recommendation(
        self,
        context: dict,
        reason: str = None,
    ) -> dict:
        asset = context["asset"]
        request = context["campaign_request"]
        template_platform = asset.get("platform") or request.get("platform")
        template_category = (
            asset.get("template_category")
            or request.get("campaign_type")
        )

        return {
            "asset_id": asset.get("id"),
            "name": asset.get("name") or "Selected template",
            "reason": reason
            or (
                "Chosen because it is a "
                f"{template_platform} template tagged for "
                f"{template_category} and it visually matches "
                "the campaign format."
            ),
            "file_url": asset.get("signed_file_url") or asset.get("file_url"),
        }

    def _parse_model_json(self, text: str):
        candidates = [
            text,
            self._normalize_json_candidate(text),
        ]

        last_error = None

        for candidate in candidates:
            if not candidate:
                continue

            try:
                return json.loads(candidate)
            except json.JSONDecodeError as exc:
                last_error = exc

        raise last_error or ValueError("Unable to parse model JSON response")

    def _normalize_json_candidate(self, text: str) -> str:
        cleaned = text.strip()

        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")

            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()

        start = cleaned.find("{")
        end = cleaned.rfind("}")

        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start:end + 1]

        cleaned = self._escape_multiline_json_strings(cleaned)
        cleaned = re.sub(r",(\s*[}\]])", r"\1", cleaned)

        return cleaned

    def _escape_multiline_json_strings(self, text: str) -> str:
        escaped_chars = []
        in_string = False
        is_escaped = False

        for char in text:
            if in_string:
                if is_escaped:
                    escaped_chars.append(char)
                    is_escaped = False
                    continue

                if char == "\\":
                    escaped_chars.append(char)
                    is_escaped = True
                    continue

                if char == '"':
                    escaped_chars.append(char)
                    in_string = False
                    continue

                if char == "\n":
                    escaped_chars.append("\\n")
                    continue

                if char == "\r":
                    continue

                escaped_chars.append(char)
                continue

            escaped_chars.append(char)

            if char == '"':
                in_string = True

        return "".join(escaped_chars)

    def _build_prompt(self, context: dict) -> str:
        organization = context["organization"]
        brand_settings = context["brand_settings"] or {}
        asset = context["asset"]
        campaign_request = context["campaign_request"]
        hashtags = self._normalize_hashtags(
            [
                item.get("tag", "")
                for item in context["hashtags"]
                if item.get("tag")
            ]
        )

        return dedent(
            f"""
            You are BuildHerAI's campaign creator agent.
            Return only the XML block below and nothing else.
            Do not return JSON, markdown, or code fences.

            <campaign>
            <caption>...</caption>
            <short_caption>...</short_caption>
            <hashtags>
            #tag-one
            #tag-two
            </hashtags>
            <call_to_action>...</call_to_action>
            <template_reason>...</template_reason>
            <generated_image_prompt>...</generated_image_prompt>
            <instagram_caption>...</instagram_caption>
            <linkedin_post>...</linkedin_post>
            <twitter_post>...</twitter_post>
            <poster_instructions>...</poster_instructions>
            <ai_reasoning>...</ai_reasoning>
            </campaign>

            Rules:
            - Keep every tag present exactly once.
            - Keep hashtags unique and place one hashtag per line.
            - Keep the output concise, on-brand, and ready to publish.
            - Escape ampersands as &amp; when needed in text.

            Organization context:
            {json.dumps({
                'name': organization.get('name'),
                'mission': organization.get('mission'),
                'purpose': organization.get('purpose'),
                'audience': organization.get('audience'),
            }, default=str)}

            Brand settings:
            {json.dumps({
                'primary_color': brand_settings.get('primary_color'),
                'secondary_color': brand_settings.get('secondary_color'),
                'accent_color': brand_settings.get('accent_color'),
                'font_family': brand_settings.get('font_family'),
                'tone': brand_settings.get('tone'),
            }, default=str)}

            Hashtags:
            {json.dumps(hashtags, default=str)}

            Selected template:
            {json.dumps({
                'id': asset.get('id'),
                'name': asset.get('name'),
                'description': asset.get('description'),
                'platform': asset.get('platform'),
                'dimensions': asset.get('dimensions'),
                'template_category': asset.get('template_category'),
            }, default=str)}

            Campaign request:
            {json.dumps(campaign_request, default=str)}
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
            Create a brand-new social media poster as SVG markup.
            Return SVG only. Do not return markdown, JSON, or explanations.
            The result must be a complete standalone <svg>...</svg> document.
            Do not use external URLs, @import rules, remote images,
            or web font links.
            Use only inline SVG elements, gradients, shapes, and text.
            If you need a font, set font-family directly on text elements.
            Escape ampersands as &amp; in any text or CSS content.

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
            - Make it visually polished and social-media ready.
            - Use vector shapes, text, gradients, and layout only.
            - Keep all text inside the canvas and readable.
                        - Use a portrait Instagram-friendly layout
                            if dimensions are unknown.
            """
        ).strip()

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
        normalized_tags = self._normalize_hashtags(stored_tags)
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
            "template_recommendation": self._build_template_recommendation(
                context,
            ),
            "generated_image_prompt": (
                "Create an "
                f"{template_platform or request.get('platform')} "
                "promotional visual for "
                f"{event['title']} using {font_summary}, primary colors "
                f"{primary_color}, inspired by a "
                f"{template_category or request.get('campaign_type')} "
                "layout, and a confident "
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
                f"{template_category or request.get('campaign_type')} "
                "workflow, supports "
                f"{template_platform or request.get('platform')} "
                "formatting, and reinforces "
                f"BuildHerAI's mission: {organization_message}."
            ),
        }

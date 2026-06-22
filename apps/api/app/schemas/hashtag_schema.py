from pydantic import BaseModel, field_validator


def normalize_tag(value: str) -> str:
    normalized = value.strip().lstrip("#").strip()

    if not normalized:
        raise ValueError("tag must not be empty")

    return normalized


class HashtagCreate(BaseModel):
    organization_id: str
    tag: str

    @field_validator("tag")
    @classmethod
    def validate_tag(cls, value: str) -> str:
        return normalize_tag(value)


class HashtagUpdate(BaseModel):
    tag: str

    @field_validator("tag")
    @classmethod
    def validate_tag(cls, value: str) -> str:
        return normalize_tag(value)
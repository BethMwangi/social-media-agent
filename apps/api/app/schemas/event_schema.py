from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EventCreate(BaseModel):
    campaign_id: str
    title: str
    description: Optional[str] = None
    event_type: Optional[str] = None
    status: Optional[str] = "draft"
    event_date: datetime
    location: Optional[str] = None
    registration_url: Optional[str] = None
    image_url: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    status: Optional[str] = None
    event_date: Optional[datetime] = None
    location: Optional[str] = None
    registration_url: Optional[str] = None
    image_url: Optional[str] = None


class EventResponse(BaseModel):
    id: str
    title: str
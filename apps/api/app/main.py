from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.organizations import router as organization_router
from app.routes.brand_settings import (
    router as brand_settings_router
)
from app.routes.campaigns import (
    router as campaign_router
)
from app.routes.events import router as events_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    organization_router,
    prefix="/api/v1/organizations",
    tags=["Organizations"]
)

app.include_router(
    brand_settings_router,
    prefix="/api/v1/brand-settings",
    tags=["Brand Settings"]
)

app.include_router(
    campaign_router,
    prefix="/api/v1/campaigns",
    tags=["Campaigns"]
)

app.include_router(
    events_router,
    prefix="/api/v1/events",
    tags=["Events"]
)
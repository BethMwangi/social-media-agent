from fastapi import FastAPI

from apps.api.app.routes.organizations import router as organization_router

app = FastAPI()

app.include_router(
    organization_router,
    prefix="/api/v1/organizations",
    tags=["Organizations"]
)
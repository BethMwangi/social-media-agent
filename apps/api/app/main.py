from fastapi import FastAPI
from app.routes.organization import router as organization_router

app = FastAPI(
    title="BuildHerAI Agent"
)

app.include_router(organization_router)


@app.get("/")
def root():
    return {"status": "running"}
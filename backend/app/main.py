from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path

from fastapi import APIRouter, FastAPI
from fastapi.staticfiles import StaticFiles

from app.models import HealthResponse
from app.routers.today import router as today_router

app = FastAPI(title="On This Day")

api_router = APIRouter(prefix="/api")
api_router.include_router(today_router)


@api_router.get("/health", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    return HealthResponse(status="ok", timestamp=datetime.now(UTC))


app.include_router(api_router)

_frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if _frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=_frontend_dist, html=True), name="frontend")

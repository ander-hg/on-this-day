from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class TodayEvent(BaseModel):
    year: int
    text: str
    page_title: str | None = None
    extract: str | None = None
    thumbnail_url: str | None = None
    wiki_url: str | None = None


class TodayResponse(BaseModel):
    date: str
    featured: TodayEvent
    events: list[TodayEvent]
    generated_at: datetime


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime

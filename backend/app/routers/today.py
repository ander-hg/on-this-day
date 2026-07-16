from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.models import TodayEvent, TodayResponse

router = APIRouter()

WIKIPEDIA_BASE_URL = "https://en.wikipedia.org/api/rest_v1/feed/onthisday/events"
REQUEST_TIMEOUT_SECONDS = 5.0
USER_AGENT = "on-this-day/0.1 (https://github.com/ander-hg/on-this-day)"

_cache: dict[str, tuple[TodayResponse, datetime]] = {}


def _validate_date(date_str: str) -> tuple[int, int]:
    try:
        parsed = datetime.strptime(f"2024-{date_str}", "%Y-%m-%d")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="date must be in MM-DD format") from exc
    return parsed.month, parsed.day


def _next_utc_midnight(moment: datetime) -> datetime:
    start_of_day = moment.replace(hour=0, minute=0, second=0, microsecond=0)
    return start_of_day + timedelta(days=1)


def _event_from_payload(event: dict[str, Any]) -> TodayEvent:
    pages = event.get("pages") or []
    page = pages[0] if pages else {}
    thumbnail = page.get("thumbnail") or {}
    content_urls = page.get("content_urls") or {}
    desktop = content_urls.get("desktop") or {}

    return TodayEvent(
        year=event["year"],
        text=event["text"],
        page_title=page.get("title"),
        extract=page.get("extract"),
        thumbnail_url=thumbnail.get("source"),
        wiki_url=desktop.get("page"),
    )


async def _fetch_wikipedia_events(month: int, day: int) -> list[dict[str, Any]]:
    url = f"{WIKIPEDIA_BASE_URL}/{month:02d}/{day:02d}"
    headers = {"User-Agent": USER_AGENT}

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="Wikipedia request timed out") from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502, detail="Wikipedia returned an unexpected response"
        ) from exc
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail="Failed to reach Wikipedia") from exc

    payload: dict[str, Any] = response.json()
    events: list[dict[str, Any]] = payload.get("events", [])
    return events


def _build_response(date_key: str, events_raw: list[dict[str, Any]]) -> TodayResponse:
    if not events_raw:
        raise HTTPException(status_code=502, detail="No events returned for this date")

    parsed = [_event_from_payload(event) for event in events_raw]
    featured = next((event for event in parsed if event.thumbnail_url), parsed[0])
    remaining = [event for event in parsed if event is not featured]

    return TodayResponse(
        date=date_key,
        featured=featured,
        events=remaining,
        generated_at=datetime.now(UTC),
    )


@router.get("/today", response_model=TodayResponse)
async def get_today(date: str | None = Query(default=None)) -> TodayResponse:
    now = datetime.now(UTC)

    if date is None:
        month, day = now.month, now.day
        date_key = f"{month:02d}-{day:02d}"
    else:
        month, day = _validate_date(date)
        date_key = date

    cached = _cache.get(date_key)
    if cached is not None:
        response, expires_at = cached
        if now < expires_at:
            return response

    events_raw = await _fetch_wikipedia_events(month, day)
    response = _build_response(date_key, events_raw)
    _cache[date_key] = (response, _next_utc_midnight(now))
    return response

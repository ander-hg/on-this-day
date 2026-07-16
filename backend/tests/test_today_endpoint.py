from __future__ import annotations

from collections.abc import Iterator
from typing import Any

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.main import app
from app.routers import today as today_router

SAMPLE_EVENTS: list[dict[str, Any]] = [
    {
        "year": 1969,
        "text": "Apollo 11 astronauts walk on the Moon.",
        "pages": [
            {
                "title": "Apollo 11",
                "extract": "Apollo 11 was the spaceflight that first landed humans on the Moon.",
                "thumbnail": {"source": "https://example.com/apollo11.jpg"},
                "content_urls": {
                    "desktop": {"page": "https://en.wikipedia.org/wiki/Apollo_11"}
                },
            }
        ],
    },
    {
        "year": 1815,
        "text": "The Battle of Waterloo is fought.",
        "pages": [
            {
                "title": "Battle of Waterloo",
                "extract": "A battle fought near Waterloo.",
                "content_urls": {
                    "desktop": {"page": "https://en.wikipedia.org/wiki/Battle_of_Waterloo"}
                },
            }
        ],
    },
]


@pytest.fixture(autouse=True)
def _clear_cache() -> Iterator[None]:
    today_router._cache.clear()
    yield
    today_router._cache.clear()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_get_today_success(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_fetch(month: int, day: int) -> list[dict[str, Any]]:
        return SAMPLE_EVENTS

    monkeypatch.setattr(today_router, "_fetch_wikipedia_events", fake_fetch)

    response = client.get("/api/today", params={"date": "07-20"})

    assert response.status_code == 200
    body = response.json()
    assert body["date"] == "07-20"
    assert body["featured"]["year"] == 1969
    assert body["featured"]["thumbnail_url"] == "https://example.com/apollo11.jpg"
    assert len(body["events"]) == 1
    assert body["events"][0]["year"] == 1815


def test_get_today_invalid_date(client: TestClient) -> None:
    response = client.get("/api/today", params={"date": "13-40"})

    assert response.status_code == 400


def test_get_today_upstream_timeout(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    async def fake_fetch(month: int, day: int) -> list[dict[str, Any]]:
        raise HTTPException(status_code=504, detail="Wikipedia request timed out")

    monkeypatch.setattr(today_router, "_fetch_wikipedia_events", fake_fetch)

    response = client.get("/api/today", params={"date": "07-20"})

    assert response.status_code == 504


def test_get_today_empty_events_is_bad_gateway(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    async def fake_fetch(month: int, day: int) -> list[dict[str, Any]]:
        return []

    monkeypatch.setattr(today_router, "_fetch_wikipedia_events", fake_fetch)

    response = client.get("/api/today", params={"date": "07-20"})

    assert response.status_code == 502


def test_get_today_uses_cache(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    call_count = 0

    async def fake_fetch(month: int, day: int) -> list[dict[str, Any]]:
        nonlocal call_count
        call_count += 1
        return SAMPLE_EVENTS

    monkeypatch.setattr(today_router, "_fetch_wikipedia_events", fake_fetch)

    first = client.get("/api/today", params={"date": "07-20"})
    second = client.get("/api/today", params={"date": "07-20"})

    assert first.status_code == 200
    assert second.status_code == 200
    assert call_count == 1


def test_health(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "timestamp" in body

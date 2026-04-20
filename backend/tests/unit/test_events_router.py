from __future__ import annotations

from datetime import datetime
from unittest.mock import AsyncMock

import pytest

from api.routers import events
from domain.event import Event, Message


@pytest.fixture
def mock_event() -> Event:
    return Event(
        event_id="evt-1",
        memory_id="mem-1",
        actor_id="3242:166",
        session_id="sess:1",
        messages=[Message(role="USER", content="hello")],
        timestamp=datetime(2026, 4, 13, 10, 0, 0),
    )


@pytest.mark.asyncio
async def test_list_events_decodes_identifiers(monkeypatch, mock_event):
    mock_service = AsyncMock()
    mock_service.list_events.return_value = [mock_event]

    monkeypatch.setattr(events, "get_service", lambda: mock_service)

    result = await events.list_events(
        "mem-1",
        actor_id="3242%3A166",
        session_id="sess%3A1",
    )

    assert len(result) == 1
    assert result[0].actor_id == "3242:166"
    assert result[0].session_id == "sess:1"
    mock_service.list_events.assert_called_once_with("mem-1", "3242:166", "sess:1")


@pytest.mark.asyncio
async def test_get_event_decodes_identifiers(monkeypatch, mock_event):
    mock_service = AsyncMock()
    mock_service.get_event.return_value = mock_event

    monkeypatch.setattr(events, "get_service", lambda: mock_service)

    result = await events.get_event(
        "mem-1",
        "evt-1",
        actor_id="3242%3A166",
        session_id="sess%3A1",
    )

    assert result.actor_id == "3242:166"
    assert result.session_id == "sess:1"
    mock_service.get_event.assert_called_once_with("mem-1", "3242:166", "sess:1", "evt-1")


@pytest.mark.asyncio
async def test_delete_event_decodes_identifiers(monkeypatch):
    mock_service = AsyncMock()
    mock_service.delete_event.return_value = None

    monkeypatch.setattr(events, "get_service", lambda: mock_service)

    response = await events.delete_event(
        "mem-1",
        "evt-1",
        actor_id="3242%3A166",
        session_id="sess%3A1",
    )

    assert response.status_code == 204
    mock_service.delete_event.assert_called_once_with("mem-1", "3242:166", "sess:1", "evt-1")

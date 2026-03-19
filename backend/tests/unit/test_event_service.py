from __future__ import annotations

import pytest
from unittest.mock import AsyncMock
from datetime import datetime
from application.event_service import EventService
from domain.event import Event, Message


@pytest.fixture
def mock_event():
    return Event(
        event_id="evt-1",
        memory_id="mem-1",
        actor_id="user-abc",
        session_id="sess-1",
        messages=[
            Message(role="USER", content="Hello"),
            Message(role="ASSISTANT", content="Hi there"),
        ],
        timestamp=datetime(2026, 3, 18),
    )


@pytest.mark.asyncio
async def test_list_events_delegates_to_repo(mock_event):
    repo = AsyncMock()
    repo.list_events.return_value = [mock_event]

    service = EventService(repo)
    result = await service.list_events("mem-1", "user-abc", "sess-1")

    assert len(result) == 1
    assert result[0].event_id == "evt-1"
    repo.list_events.assert_called_once_with("mem-1", "user-abc", "sess-1")


@pytest.mark.asyncio
async def test_list_events_returns_messages(mock_event):
    repo = AsyncMock()
    repo.list_events.return_value = [mock_event]

    service = EventService(repo)
    result = await service.list_events("mem-1", "user-abc", "sess-1")

    assert len(result[0].messages) == 2
    assert result[0].messages[0].role == "USER"
    assert result[0].messages[1].role == "ASSISTANT"


@pytest.mark.asyncio
async def test_get_event_delegates_to_repo(mock_event):
    repo = AsyncMock()
    repo.get_event.return_value = mock_event

    service = EventService(repo)
    result = await service.get_event("mem-1", "user-abc", "sess-1", "evt-1")

    assert result.event_id == "evt-1"
    repo.get_event.assert_called_once_with("mem-1", "user-abc", "sess-1", "evt-1")


@pytest.mark.asyncio
async def test_delete_event_delegates_to_repo():
    repo = AsyncMock()
    repo.delete_event.return_value = None

    service = EventService(repo)
    await service.delete_event("mem-1", "user-abc", "sess-1", "evt-1")

    repo.delete_event.assert_called_once_with("mem-1", "user-abc", "sess-1", "evt-1")


@pytest.mark.asyncio
async def test_list_events_empty():
    repo = AsyncMock()
    repo.list_events.return_value = []

    service = EventService(repo)
    result = await service.list_events("mem-1", "user-abc", "sess-1")

    assert result == []

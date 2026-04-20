from __future__ import annotations

from datetime import datetime
from unittest.mock import AsyncMock

import pytest

from api.routers import sessions
from domain.event import Event, Message
from domain.session import MemorySession


@pytest.mark.asyncio
async def test_list_sessions_decodes_actor_id(monkeypatch):
    mock_service = AsyncMock()
    mock_service.list_sessions.return_value = [
        MemorySession(
            session_id="sess-1",
            actor_id="3242:166",
            memory_id="mem-1",
            created_at=datetime(2026, 4, 13, 10, 0, 0),
        )
    ]

    monkeypatch.setattr(sessions, "get_service", lambda: mock_service)

    result = await sessions.list_sessions("mem-1", actor_id="3242%3A166")

    assert len(result) == 1
    assert result[0].actor_id == "3242:166"
    mock_service.list_sessions.assert_called_once_with("mem-1", "3242:166")


@pytest.mark.asyncio
async def test_delete_session_decodes_actor_id(monkeypatch):
    mock_service = AsyncMock()
    mock_service.delete_session.return_value = [
        Event(
            event_id="evt-1",
            memory_id="mem-1",
            actor_id="3242:166",
            session_id="sess-1",
            messages=[Message(role="USER", content="hello")],
            timestamp=datetime(2026, 4, 13, 10, 0, 0),
        )
    ]

    monkeypatch.setattr(sessions, "get_service", lambda: mock_service)

    result = await sessions.delete_session(
        "mem-1",
        "sess-1",
        actor_id="3242%3A166",
    )

    assert len(result) == 1
    assert result[0].actor_id == "3242:166"
    mock_service.delete_session.assert_called_once_with("mem-1", "3242:166", "sess-1")

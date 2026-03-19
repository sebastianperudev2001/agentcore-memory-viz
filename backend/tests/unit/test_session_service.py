from __future__ import annotations

import pytest
from unittest.mock import AsyncMock
from datetime import datetime
from application.session_service import SessionService
from domain.session import MemorySession


@pytest.fixture
def mock_session():
    return MemorySession(
        session_id="sess-1",
        actor_id="user-abc",
        memory_id="mem-1",
        created_at=datetime(2026, 3, 18),
    )


@pytest.mark.asyncio
async def test_list_sessions_delegates_to_repo(mock_session):
    repo = AsyncMock()
    repo.list_sessions.return_value = [mock_session]

    service = SessionService(repo)
    result = await service.list_sessions("mem-1", "user-abc")

    assert len(result) == 1
    assert result[0].session_id == "sess-1"
    repo.list_sessions.assert_called_once_with("mem-1", "user-abc")


@pytest.mark.asyncio
async def test_list_sessions_returns_empty_when_no_sessions():
    repo = AsyncMock()
    repo.list_sessions.return_value = []

    service = SessionService(repo)
    result = await service.list_sessions("mem-1", "unknown-actor")

    assert result == []


@pytest.mark.asyncio
async def test_list_sessions_passes_correct_ids(mock_session):
    repo = AsyncMock()
    repo.list_sessions.return_value = [mock_session]

    service = SessionService(repo)
    await service.list_sessions("mem-42", "actor-99")

    repo.list_sessions.assert_called_once_with("mem-42", "actor-99")

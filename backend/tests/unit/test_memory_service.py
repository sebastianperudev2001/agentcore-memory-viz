from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime
from application.memory_service import MemoryService
from domain.memory import Memory


@pytest.fixture
def mock_memory():
    return Memory(
        id="mem-1",
        agent_id="agent-123",
        content="User prefers concise answers",
        memory_type="SEMANTIC",
        created_at=datetime(2026, 3, 17),
    )


@pytest.mark.asyncio
async def test_list_memories_returns_cached(mock_memory):
    repo = AsyncMock()
    cache = MagicMock()
    cache.get.return_value = [mock_memory]

    service = MemoryService(repo, cache)
    result = await service.list_memories("agent-123")

    assert len(result) == 1
    assert result[0].id == "mem-1"
    repo.list_memories.assert_not_called()


@pytest.mark.asyncio
async def test_list_memories_calls_repo_on_cache_miss(mock_memory):
    repo = AsyncMock()
    repo.list_memories.return_value = [mock_memory]
    cache = MagicMock()
    cache.get.return_value = None

    service = MemoryService(repo, cache)
    result = await service.list_memories("agent-123")

    assert len(result) == 1
    repo.list_memories.assert_called_once_with("agent-123")
    cache.set.assert_called_once()

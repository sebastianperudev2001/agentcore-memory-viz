from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock
from application.memory_service import MemoryService
from domain.memory_resource import MemoryResource


@pytest.fixture
def mock_resource():
    return MemoryResource(
        id="mem-1",
        name="My Memory",
        status="ACTIVE",
        event_expiry_days=30,
        strategies=["SEMANTIC"],
    )


@pytest.mark.asyncio
async def test_list_memories_returns_cached(mock_resource):
    repo = AsyncMock()
    cache = MagicMock()
    cache.get.return_value = [mock_resource]

    service = MemoryService(repo, cache)
    result = await service.list_memories()

    assert len(result) == 1
    assert result[0].id == "mem-1"
    repo.list_memories.assert_not_called()


@pytest.mark.asyncio
async def test_list_memories_calls_repo_on_cache_miss(mock_resource):
    repo = AsyncMock()
    repo.list_memories.return_value = [mock_resource]
    cache = MagicMock()
    cache.get.return_value = None

    service = MemoryService(repo, cache)
    result = await service.list_memories()

    assert len(result) == 1
    assert result[0].name == "My Memory"
    repo.list_memories.assert_called_once()
    cache.set.assert_called_once()


@pytest.mark.asyncio
async def test_list_memories_stores_result_in_cache(mock_resource):
    repo = AsyncMock()
    repo.list_memories.return_value = [mock_resource]
    cache = MagicMock()
    cache.get.return_value = None

    service = MemoryService(repo, cache)
    await service.list_memories()

    cache.set.assert_called_once_with("memories:all", [mock_resource], ttl=300)


@pytest.mark.asyncio
async def test_list_memories_returns_empty_list_when_no_resources():
    repo = AsyncMock()
    repo.list_memories.return_value = []
    cache = MagicMock()
    cache.get.return_value = None

    service = MemoryService(repo, cache)
    result = await service.list_memories()

    assert result == []

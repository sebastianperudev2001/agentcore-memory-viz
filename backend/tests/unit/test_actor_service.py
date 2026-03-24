from __future__ import annotations

import pytest
from unittest.mock import AsyncMock

from application.actor_service import ActorService


@pytest.mark.asyncio
async def test_list_actors_delegates_to_repo():
    repo = AsyncMock()
    repo.list_actors.return_value = {
        "actorSummaries": [{"actorId": "actor-1", "memoryId": "mem-1"}],
        "nextToken": "token-123",
    }

    service = ActorService(repo)
    result = await service.list_actors("mem-1", 25, "token-0")

    assert result["actorIds"] == ["actor-1"]
    assert result["nextToken"] == "token-123"
    assert result["count"] == 1
    repo.list_actors.assert_called_once_with("mem-1", 25, "token-0")


@pytest.mark.asyncio
async def test_list_actors_without_pagination():
    repo = AsyncMock()
    repo.list_actors.return_value = {"actorSummaries": []}

    service = ActorService(repo)
    result = await service.list_actors("mem-1")

    assert result == {"actorIds": [], "nextToken": None, "count": 0}
    repo.list_actors.assert_called_once_with("mem-1", None, None)

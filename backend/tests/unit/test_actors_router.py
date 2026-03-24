from __future__ import annotations

import pytest
from unittest.mock import AsyncMock

from api.routers import actors


@pytest.mark.asyncio
async def test_list_actors_router_returns_parsed_response(monkeypatch):
    mock_service = AsyncMock()
    mock_service.list_actors.return_value = {
        "actorIds": ["actor-1"],
        "nextToken": "token-123",
        "count": 1,
    }

    monkeypatch.setattr(actors, "get_service", lambda: mock_service)

    result = await actors.list_actors("mem-1", max_results=50, next_token="token-0")

    assert result.actorIds == ["actor-1"]
    assert result.nextToken == "token-123"
    assert result.count == 1
    mock_service.list_actors.assert_called_once_with("mem-1", 50, "token-0")


@pytest.mark.asyncio
async def test_list_actors_router_without_pagination(monkeypatch):
    mock_service = AsyncMock()
    mock_service.list_actors.return_value = {"actorIds": [], "nextToken": None, "count": 0}

    monkeypatch.setattr(actors, "get_service", lambda: mock_service)

    result = await actors.list_actors("mem-1", max_results=None, next_token=None)

    assert result.actorIds == []
    assert result.nextToken is None
    assert result.count == 0
    mock_service.list_actors.assert_called_once_with("mem-1", None, None)

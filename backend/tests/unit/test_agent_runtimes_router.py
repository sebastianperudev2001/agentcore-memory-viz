from __future__ import annotations

from datetime import datetime
from unittest.mock import AsyncMock

import pytest

from api.routers import agent_runtimes
from domain.agent_runtime import AgentRuntime


@pytest.fixture
def mock_agent_runtime() -> AgentRuntime:
    return AgentRuntime(
        agentRuntimeArn="arn:aws:bedrock:us-west-2:123456789012:agent-runtime/runtime-1",
        agentRuntimeId="runtime-1",
        agentRuntimeVersion="1",
        agentRuntimeName="Runtime One",
        description="Primary runtime",
        lastUpdatedAt=datetime(2026, 4, 6, 12, 0, 0),
        status="READY",
    )


@pytest.mark.asyncio
async def test_list_agent_runtimes_router_returns_parsed_response(monkeypatch, mock_agent_runtime):
    mock_service = AsyncMock()
    mock_service.list_agent_runtimes.return_value = [mock_agent_runtime]

    monkeypatch.setattr(agent_runtimes, "get_service", lambda: mock_service)

    result = await agent_runtimes.list_agent_runtimes()

    assert len(result) == 1
    assert result[0].agentRuntimeArn == mock_agent_runtime.agentRuntimeArn
    assert result[0].agentRuntimeId == "runtime-1"
    assert result[0].agentRuntimeName == "Runtime One"
    assert result[0].status == "READY"
    mock_service.list_agent_runtimes.assert_called_once_with()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "exception_type",
    [
        type("AccessDeniedException", (Exception,), {}),
        type("ValidationException", (Exception,), {}),
        type("ThrottlingException", (Exception,), {}),
        type("InternalServerException", (Exception,), {}),
    ],
)
async def test_list_agent_runtimes_router_propagates_service_exceptions(monkeypatch, exception_type):
    mock_service = AsyncMock()
    mock_service.list_agent_runtimes.side_effect = exception_type("boom")

    monkeypatch.setattr(agent_runtimes, "get_service", lambda: mock_service)

    with pytest.raises(exception_type):
        await agent_runtimes.list_agent_runtimes()

    mock_service.list_agent_runtimes.assert_called_once_with()

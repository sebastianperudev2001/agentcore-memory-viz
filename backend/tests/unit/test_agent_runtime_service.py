from __future__ import annotations

from datetime import datetime
from unittest.mock import AsyncMock

import pytest

from application.agent_runtime_service import AgentRuntimeService
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
async def test_list_agent_runtimes_delegates_to_repo(mock_agent_runtime):
    repo = AsyncMock()
    repo.list_agent_runtimes.return_value = [mock_agent_runtime]

    service = AgentRuntimeService(repo)

    result = await service.list_agent_runtimes()

    assert result == [mock_agent_runtime]
    repo.list_agent_runtimes.assert_called_once_with()


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
async def test_list_agent_runtimes_propagates_sdk_exceptions(exception_type):
    repo = AsyncMock()
    repo.list_agent_runtimes.side_effect = exception_type("boom")

    service = AgentRuntimeService(repo)

    with pytest.raises(exception_type):
        await service.list_agent_runtimes()

    repo.list_agent_runtimes.assert_called_once_with()

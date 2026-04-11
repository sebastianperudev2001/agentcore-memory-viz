from __future__ import annotations

from datetime import datetime
from unittest.mock import MagicMock

import pytest

from infrastructure.agentcore_client import AgentCoreRepository


@pytest.mark.asyncio
async def test_list_agent_runtimes_aggregates_all_pages():
    repo = AgentCoreRepository.__new__(AgentCoreRepository)
    repo.agentcore_control_client = MagicMock()
    repo.agentcore_control_client.list_agent_runtimes.side_effect = [
        {
            "agentRuntimes": [
                {
                    "agentRuntimeArn": "arn:1",
                    "agentRuntimeId": "runtime-1",
                    "agentRuntimeVersion": "1",
                    "agentRuntimeName": "Runtime One",
                    "description": "First page runtime",
                    "lastUpdatedAt": datetime(2026, 4, 6, 12, 0, 0),
                    "status": "READY",
                }
            ],
            "nextToken": "token-1",
        },
        {
            "agentRuntimes": [
                {
                    "agentRuntimeArn": "arn:2",
                    "agentRuntimeId": "runtime-2",
                    "agentRuntimeVersion": "2",
                    "agentRuntimeName": "Runtime Two",
                    "description": "Second page runtime",
                    "lastUpdatedAt": datetime(2026, 4, 6, 13, 0, 0),
                    "status": "UPDATING",
                }
            ]
        },
    ]

    result = await repo.list_agent_runtimes()

    assert len(result) == 2
    assert result[0].agentRuntimeId == "runtime-1"
    assert result[1].agentRuntimeId == "runtime-2"
    assert repo.agentcore_control_client.list_agent_runtimes.call_count == 2
    first_call = repo.agentcore_control_client.list_agent_runtimes.call_args_list[0]
    second_call = repo.agentcore_control_client.list_agent_runtimes.call_args_list[1]
    assert first_call.kwargs == {}
    assert second_call.kwargs == {"nextToken": "token-1"}


@pytest.mark.asyncio
async def test_list_agent_runtimes_maps_raw_shape_to_domain():
    repo = AgentCoreRepository.__new__(AgentCoreRepository)
    repo.agentcore_control_client = MagicMock()
    repo.agentcore_control_client.list_agent_runtimes.return_value = {
        "agentRuntimes": [
            {
                "agentRuntimeArn": "arn:1",
                "agentRuntimeId": "runtime-1",
                "agentRuntimeVersion": "7",
                "agentRuntimeName": "Runtime One",
                "description": "Mapped runtime",
                "lastUpdatedAt": datetime(2026, 4, 6, 12, 0, 0),
                "status": "CREATE_FAILED",
            }
        ]
    }

    result = await repo.list_agent_runtimes()

    assert len(result) == 1
    assert result[0].agentRuntimeArn == "arn:1"
    assert result[0].agentRuntimeVersion == "7"
    assert result[0].description == "Mapped runtime"
    assert result[0].status == "CREATE_FAILED"


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
    repo = AgentCoreRepository.__new__(AgentCoreRepository)
    repo.agentcore_control_client = MagicMock()
    repo.agentcore_control_client.list_agent_runtimes.side_effect = exception_type("boom")

    with pytest.raises(exception_type):
        await repo.list_agent_runtimes()

    repo.agentcore_control_client.list_agent_runtimes.assert_called_once_with()

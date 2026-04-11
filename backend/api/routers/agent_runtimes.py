from __future__ import annotations

from typing import List

from fastapi import APIRouter

from api.schemas import AgentRuntimeResponse
from application.agent_runtime_service import AgentRuntimeService
from infrastructure.agentcore_client import AgentCoreRepository

router = APIRouter(prefix="/agent-runtimes", tags=["agent-runtimes"])


def get_service() -> AgentRuntimeService:
    return AgentRuntimeService(AgentCoreRepository())


@router.get("", response_model=List[AgentRuntimeResponse])
async def list_agent_runtimes() -> List[AgentRuntimeResponse]:
    service = get_service()
    agent_runtimes = await service.list_agent_runtimes()
    return [AgentRuntimeResponse(**runtime.__dict__) for runtime in agent_runtimes]

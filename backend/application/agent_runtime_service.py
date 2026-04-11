from __future__ import annotations

from typing import List

from domain.agent_runtime import AgentRuntime
from infrastructure.agentcore_client import AgentCoreRepository


class AgentRuntimeService:
    def __init__(self, repo: AgentCoreRepository):
        self.repo = repo

    async def list_agent_runtimes(self) -> List[AgentRuntime]:
        return await self.repo.list_agent_runtimes()

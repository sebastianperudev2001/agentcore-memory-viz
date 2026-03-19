from __future__ import annotations

from typing import List

from domain.session import MemorySession
from infrastructure.agentcore_client import AgentCoreRepository


class SessionService:
    def __init__(self, repo: AgentCoreRepository):
        self.repo = repo

    async def list_sessions(
        self, memory_id: str, actor_id: str
    ) -> List[MemorySession]:
        return await self.repo.list_sessions(memory_id, actor_id)

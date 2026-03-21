from __future__ import annotations

from typing import List

from domain.session import MemorySession
from domain.event import Event
from infrastructure.agentcore_client import AgentCoreRepository


class SessionService:
    def __init__(self, repo: AgentCoreRepository):
        self.repo = repo

    async def list_sessions(
        self, memory_id: str, actor_id: str
    ) -> List[MemorySession]:
        return await self.repo.list_sessions(memory_id, actor_id)

    async def delete_session(self, memory_id: str, actor_id: str, session_id: str) -> List[Event]:
        return await self.repo.delete_session(memory_id, actor_id, session_id)

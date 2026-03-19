from __future__ import annotations

from typing import List

from domain.event import Event
from infrastructure.agentcore_client import AgentCoreRepository


class EventService:
    def __init__(self, repo: AgentCoreRepository):
        self.repo = repo

    async def list_events(
        self, memory_id: str, actor_id: str, session_id: str
    ) -> List[Event]:
        return await self.repo.list_events(memory_id, actor_id, session_id)

    async def get_event(
        self, memory_id: str, actor_id: str, session_id: str, event_id: str
    ) -> Event:
        return await self.repo.get_event(memory_id, actor_id, session_id, event_id)

    async def delete_event(
        self, memory_id: str, actor_id: str, session_id: str, event_id: str
    ) -> None:
        await self.repo.delete_event(memory_id, actor_id, session_id, event_id)

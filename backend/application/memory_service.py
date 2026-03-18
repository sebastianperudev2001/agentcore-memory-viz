from __future__ import annotations

from typing import List
from domain.memory import Memory
from infrastructure.agentcore_client import AgentCoreRepository
from infrastructure.cache import DiskCache


class MemoryService:
    def __init__(self, repo: AgentCoreRepository, cache: DiskCache):
        self.repo = repo
        self.cache = cache

    async def list_memories(self, agent_id: str) -> List[Memory]:
        cache_key = f"memories:{agent_id}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        memories = await self.repo.list_memories(agent_id)
        self.cache.set(cache_key, memories)
        return memories

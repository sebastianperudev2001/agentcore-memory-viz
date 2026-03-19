from __future__ import annotations

from typing import List

from domain.memory_resource import MemoryResource
from infrastructure.agentcore_client import AgentCoreRepository
from infrastructure.cache import DiskCache


class MemoryService:
    def __init__(self, repo: AgentCoreRepository, cache: DiskCache):
        self.repo = repo
        self.cache = cache

    async def list_memories(self) -> List[MemoryResource]:
        cache_key = "memories:all"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        memories = await self.repo.list_memories()
        self.cache.set(cache_key, memories, ttl=300)
        return memories

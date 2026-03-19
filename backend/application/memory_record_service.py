from __future__ import annotations

from typing import List

from domain.memory_record import MemoryRecord
from infrastructure.agentcore_client import AgentCoreRepository


class MemoryRecordService:
    def __init__(self, repo: AgentCoreRepository):
        self.repo = repo

    async def list_memory_records(
        self, memory_id: str, namespace: str
    ) -> List[MemoryRecord]:
        return await self.repo.list_memory_records(memory_id, namespace)

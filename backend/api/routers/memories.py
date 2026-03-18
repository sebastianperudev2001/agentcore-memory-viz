from __future__ import annotations

from typing import List
from fastapi import APIRouter, Query
from api.schemas import MemoryResponse
from application.memory_service import MemoryService
from infrastructure.agentcore_client import AgentCoreRepository
from infrastructure.cache import DiskCache


router = APIRouter(prefix="/memories", tags=["memories"])


def get_service() -> MemoryService:
    return MemoryService(AgentCoreRepository(), DiskCache())


@router.get("/", response_model=List[MemoryResponse])
async def list_memories(agent_id: str = Query(..., description="Agent ID to list memories for")):
    service = get_service()
    memories = await service.list_memories(agent_id)
    return [MemoryResponse(**m.__dict__) for m in memories]

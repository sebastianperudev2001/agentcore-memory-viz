from __future__ import annotations

from typing import List

from fastapi import APIRouter

from api.schemas import MemoryResourceResponse
from application.memory_service import MemoryService
from infrastructure.agentcore_client import AgentCoreRepository
from infrastructure.cache import DiskCache

router = APIRouter(prefix="/memories", tags=["memories"])


def get_service() -> MemoryService:
    return MemoryService(AgentCoreRepository(), DiskCache())


@router.get("/", response_model=List[MemoryResourceResponse])
async def list_memories():
    service = get_service()
    memories = await service.list_memories()
    return [MemoryResourceResponse(**m.__dict__) for m in memories]

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Query

from api.schemas import MemoryRecordResponse
from application.memory_record_service import MemoryRecordService
from infrastructure.agentcore_client import AgentCoreRepository

router = APIRouter(prefix="/memories", tags=["memory_records"])


def get_service() -> MemoryRecordService:
    return MemoryRecordService(AgentCoreRepository())


@router.get("/{memory_id}/records", response_model=List[MemoryRecordResponse])
async def list_memory_records(
    memory_id: str,
    namespace: str = Query("/", description="Namespace to list records from"),
):
    service = get_service()
    records = await service.list_memory_records(memory_id, namespace)
    return [MemoryRecordResponse(**r.__dict__) for r in records]

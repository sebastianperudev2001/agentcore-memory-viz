from __future__ import annotations

from typing import List

from fastapi import APIRouter, Query

from api.schemas import MemorySessionResponse
from application.session_service import SessionService
from infrastructure.agentcore_client import AgentCoreRepository

router = APIRouter(prefix="/memories", tags=["sessions"])


def get_service() -> SessionService:
    return SessionService(AgentCoreRepository())


@router.get("/{memory_id}/sessions", response_model=List[MemorySessionResponse])
async def list_sessions(
    memory_id: str,
    actor_id: str = Query(..., description="Actor ID to list sessions for"),
):
    service = get_service()
    sessions = await service.list_sessions(memory_id, actor_id)
    return [MemorySessionResponse(**s.__dict__) for s in sessions]

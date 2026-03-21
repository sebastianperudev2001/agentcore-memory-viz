from __future__ import annotations

from typing import List

from fastapi import APIRouter, Query

from api.schemas import BranchResponse, MemorySessionResponse, EventResponse, MessageResponse
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


@router.delete("/{memory_id}/sessions/{session_id}", response_model=List[EventResponse])
async def delete_session(
    memory_id: str,
    session_id: str,
    actor_id: str = Query(..., description="Actor ID to delete session for"),
):
    service = get_service()
    deleted_events = await service.delete_session(memory_id, actor_id, session_id)
    return [
        EventResponse(
            event_id=e.event_id,
            memory_id=e.memory_id,
            actor_id=e.actor_id,
            session_id=e.session_id,
            messages=[MessageResponse(role=m.role, content=m.content) for m in e.messages],
            timestamp=e.timestamp,
            branch=BranchResponse(
                name=e.branch.name,
                root_event_id=e.branch.root_event_id,
            ) if e.branch else None,
            metadata=e.metadata,
        )
        for e in deleted_events
    ]

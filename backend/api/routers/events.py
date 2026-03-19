from __future__ import annotations

from typing import List

from fastapi import APIRouter, Query, Response

from api.schemas import EventResponse, MessageResponse
from application.event_service import EventService
from infrastructure.agentcore_client import AgentCoreRepository

router = APIRouter(prefix="/memories", tags=["events"])


def get_service() -> EventService:
    return EventService(AgentCoreRepository())


def _map_event(event) -> EventResponse:
    return EventResponse(
        event_id=event.event_id,
        memory_id=event.memory_id,
        actor_id=event.actor_id,
        session_id=event.session_id,
        messages=[MessageResponse(role=m.role, content=m.content) for m in event.messages],
        timestamp=event.timestamp,
    )


@router.get("/{memory_id}/events", response_model=List[EventResponse])
async def list_events(
    memory_id: str,
    actor_id: str = Query(...),
    session_id: str = Query(...),
):
    service = get_service()
    events = await service.list_events(memory_id, actor_id, session_id)
    return [_map_event(e) for e in events]


@router.get("/{memory_id}/events/{event_id}", response_model=EventResponse)
async def get_event(
    memory_id: str,
    event_id: str,
    actor_id: str = Query(...),
    session_id: str = Query(...),
):
    service = get_service()
    event = await service.get_event(memory_id, actor_id, session_id, event_id)
    return _map_event(event)


@router.delete("/{memory_id}/events/{event_id}", status_code=204)
async def delete_event(
    memory_id: str,
    event_id: str,
    actor_id: str = Query(...),
    session_id: str = Query(...),
):
    service = get_service()
    await service.delete_event(memory_id, actor_id, session_id, event_id)
    return Response(status_code=204)

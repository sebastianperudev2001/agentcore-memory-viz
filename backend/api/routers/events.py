from __future__ import annotations

from typing import List

from fastapi import APIRouter, Query, Response

from api.schemas import (
    BranchResponse,
    BulkSeedEventsRequest,
    BulkSeedEventsResponse,
    EventResponse,
    MessageResponse,
)
from api.routers._identifiers import normalize_identifier
from application.event_service import BulkEventInput, EventService
from infrastructure.agentcore_client import AgentCoreRepository

router = APIRouter(prefix="/memories", tags=["events"])


def get_service() -> EventService:
    return EventService(AgentCoreRepository())


def _map_event(event) -> EventResponse:
    branch = None
    if event.branch:
        branch = BranchResponse(
            name=event.branch.name,
            root_event_id=event.branch.root_event_id,
        )
    return EventResponse(
        event_id=event.event_id,
        memory_id=event.memory_id,
        actor_id=event.actor_id,
        session_id=event.session_id,
        messages=[MessageResponse(role=m.role, content=m.content) for m in event.messages],
        timestamp=event.timestamp,
        branch=branch,
        metadata=event.metadata,
    )


@router.post(
    "/{memory_id}/events/bulk",
    response_model=BulkSeedEventsResponse,
    status_code=201,
)
async def bulk_seed_events(
    memory_id: str,
    body: BulkSeedEventsRequest,
):
    """Seed test data: insert N events under a single (actor_id, session_id).

    If `session_id` is omitted, one is generated (uuid4 hex) and returned.
    Sessions are created implicitly in AgentCore Memory on first event write.
    """
    service = get_service()
    result = await service.bulk_seed_events(
        memory_id=memory_id,
        actor_id=normalize_identifier(body.actor_id),
        session_id=normalize_identifier(body.session_id),
        events=[
            BulkEventInput(
                messages=[(m.role, m.content) for m in item.messages],
                event_timestamp=item.event_timestamp,
            )
            for item in body.events
        ],
    )
    return BulkSeedEventsResponse(
        session_id=result.session_id,
        events=[_map_event(e) for e in result.events],
    )


@router.get("/{memory_id}/events", response_model=List[EventResponse])
async def list_events(
    memory_id: str,
    actor_id: str = Query(...),
    session_id: str = Query(...),
):
    service = get_service()
    events = await service.list_events(
        memory_id,
        normalize_identifier(actor_id),
        normalize_identifier(session_id),
    )
    return [_map_event(e) for e in events]


@router.get("/{memory_id}/events/{event_id}", response_model=EventResponse)
async def get_event(
    memory_id: str,
    event_id: str,
    actor_id: str = Query(...),
    session_id: str = Query(...),
):
    service = get_service()
    event = await service.get_event(
        memory_id,
        normalize_identifier(actor_id),
        normalize_identifier(session_id),
        event_id,
    )
    return _map_event(event)


@router.delete("/{memory_id}/events/{event_id}", status_code=204)
async def delete_event(
    memory_id: str,
    event_id: str,
    actor_id: str = Query(...),
    session_id: str = Query(...),
):
    service = get_service()
    await service.delete_event(
        memory_id,
        normalize_identifier(actor_id),
        normalize_identifier(session_id),
        event_id,
    )
    return Response(status_code=204)

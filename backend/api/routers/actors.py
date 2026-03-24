from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Query

from api.schemas import ActorListResponse
from application.actor_service import ActorService
from infrastructure.agentcore_client import AgentCoreRepository

router = APIRouter(prefix="/actors", tags=["actors"])


def get_service() -> ActorService:
    return ActorService(AgentCoreRepository())


@router.get("/{memory_id}", response_model=ActorListResponse)
async def list_actors(
    memory_id: str,
    max_results: Optional[int] = Query(None, ge=1, le=100),
    next_token: Optional[str] = Query(None),
) -> ActorListResponse:
    service = get_service()
    response = await service.list_actors(memory_id, max_results, next_token)
    return ActorListResponse(**response)

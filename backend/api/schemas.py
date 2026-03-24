from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class MemoryResourceResponse(BaseModel):
    id: str
    name: str
    status: str
    event_expiry_days: int
    strategies: List[str]


class MemorySessionResponse(BaseModel):
    session_id: str
    actor_id: str
    memory_id: str
    created_at: Optional[datetime] = None


class MessageResponse(BaseModel):
    role: str
    content: str


class BranchResponse(BaseModel):
    name: Optional[str] = None
    root_event_id: Optional[str] = None


class EventResponse(BaseModel):
    event_id: str
    memory_id: str
    actor_id: str
    session_id: str
    messages: List[MessageResponse]
    timestamp: Optional[datetime] = None
    branch: Optional[BranchResponse] = None
    metadata: Optional[Dict[str, Any]] = None


class MemoryRecordResponse(BaseModel):
    record_id: str
    content: str
    namespace: str
    created_at: Optional[datetime] = None


class ActorListResponse(BaseModel):
    actorIds: List[str]
    nextToken: Optional[str] = None
    count: int

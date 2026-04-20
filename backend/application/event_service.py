from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple
from uuid import uuid4

from domain.event import Event
from infrastructure.agentcore_client import AgentCoreRepository


@dataclass
class BulkEventInput:
    messages: List[Tuple[str, str]]  # (role, content)
    event_timestamp: Optional[datetime] = None


@dataclass
class BulkSeedResult:
    session_id: str
    events: List[Event] = field(default_factory=list)


class EventService:
    def __init__(self, repo: AgentCoreRepository):
        self.repo = repo

    async def list_events(
        self, memory_id: str, actor_id: str, session_id: str
    ) -> List[Event]:
        return await self.repo.list_events(memory_id, actor_id, session_id)

    async def bulk_seed_events(
        self,
        memory_id: str,
        actor_id: str,
        session_id: Optional[str],
        events: List[BulkEventInput],
    ) -> BulkSeedResult:
        """Insert N test events under a single (actor_id, session_id).

        If session_id is None, generates one uuid4 hex and reuses it for all events.
        Events without an explicit timestamp get a monotonically increasing now()+i*1ms
        to preserve stable ordering.
        """
        sid = session_id or uuid4().hex
        base = datetime.now(timezone.utc)
        created: List[Event] = []
        for i, item in enumerate(events):
            ts = item.event_timestamp or (base + timedelta(milliseconds=i))
            event = await self.repo.create_event(
                memory_id=memory_id,
                actor_id=actor_id,
                session_id=sid,
                messages=item.messages,
                event_timestamp=ts,
            )
            created.append(event)
        return BulkSeedResult(session_id=sid, events=created)

    async def get_event(
        self, memory_id: str, actor_id: str, session_id: str, event_id: str
    ) -> Event:
        return await self.repo.get_event(memory_id, actor_id, session_id, event_id)

    async def delete_event(
        self, memory_id: str, actor_id: str, session_id: str, event_id: str
    ) -> None:
        await self.repo.delete_event(memory_id, actor_id, session_id, event_id)

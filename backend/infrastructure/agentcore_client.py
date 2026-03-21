from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import boto3
from bedrock_agentcore.memory import MemoryClient

from domain.event import Branch, Event, Message
from domain.memory_record import MemoryRecord
from domain.memory_resource import MemoryResource
from domain.session import MemorySession


def _parse_dt(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value))
    except (ValueError, TypeError):
        return None


class AgentCoreRepository:
    def __init__(self, region: Optional[str] = None):
        region = region or os.environ.get("AWS_REGION", "us-west-2")
        session = boto3.Session(
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
            aws_session_token=os.environ.get("AWS_SESSION_TOKEN"),
            region_name=region,
        )
        self.client = MemoryClient(region_name=region, boto3_session=session)

    async def list_memories(self) -> List[MemoryResource]:
        items = self.client.list_memories()
        resources = []
        for m in items:
            raw_strategies = m.get("memoryStrategies") or m.get("strategies", [])
            strategies = [
                s.get("type") or s.get("memoryStrategyType") or s.get("name", "")
                for s in raw_strategies
            ]
            resources.append(
                MemoryResource(
                    id=m.get("memoryId") or m.get("id", ""),
                    name=m.get("name", ""),
                    status=m.get("status", ""),
                    event_expiry_days=m.get("eventExpiryDuration")
                    or m.get("eventExpiryDays", 0),
                    strategies=strategies,
                )
            )
        return resources

    async def list_sessions(
        self, memory_id: str, actor_id: str
    ) -> List[MemorySession]:
        result = []
        kwargs: dict = {"memoryId": memory_id, "actorId": actor_id}
        while True:
            response = self.client.list_sessions(**kwargs)
            # the new API returns sessionSummaries instead of sessions
            items = response.get("sessionSummaries") or response.get("sessions", [])
            for s in items:
                # AWS API returns createdAt as datetime object
                dt = s.get("createdAt")
                result.append(
                    MemorySession(
                        session_id=s.get("sessionId", ""),
                        actor_id=actor_id,
                        memory_id=memory_id,
                        created_at=dt if isinstance(dt, datetime) else _parse_dt(dt),
                    )
                )
            next_token = response.get("nextToken")
            if not next_token:
                break
            kwargs["nextToken"] = next_token
        return result

    async def list_events(
        self, memory_id: str, actor_id: str, session_id: str
    ) -> List[Event]:
        """List all events, returning full event data including branch and metadata."""
        raw_events = self.client.list_events(
            memory_id=memory_id,
            actor_id=actor_id,
            session_id=session_id,
            include_payload=True,
        )
        return [self._map_event(e) for e in raw_events]

    async def get_event(
        self, memory_id: str, actor_id: str, session_id: str, event_id: str
    ) -> Event:
        response = self.client.get_event(
            memoryId=memory_id,
            actorId=actor_id,
            sessionId=session_id,
            eventId=event_id,
        )
        raw = response.get("event", response) if isinstance(response, dict) else response
        return self._map_event(raw)

    async def delete_event(
        self, memory_id: str, actor_id: str, session_id: str, event_id: str
    ) -> dict:
        return self.client.delete_event(
            memoryId=memory_id,
            actorId=actor_id,
            sessionId=session_id,
            eventId=event_id,
        )

    async def delete_session(
        self, memory_id: str, actor_id: str, session_id: str
    ) -> List[Event]:
        events = await self.list_events(memory_id, actor_id, session_id)
        deleted_events = []
        for event in events:
            response = await self.delete_event(memory_id, actor_id, session_id, event.event_id)
            if response and response.get("ResponseMetadata", {}).get("HTTPStatusCode", 200) in (200, 204, 202):
                deleted_events.append(event)
        return deleted_events

    async def list_memory_records(
        self, memory_id: str, namespace: str
    ) -> List[MemoryRecord]:
        records = []
        kwargs: dict = {"memoryId": memory_id, "namespace": namespace}
        while True:
            response = self.client.list_memory_records(**kwargs)
            for r in response.get("memoryRecordSummaries", []):
                # content is a dict with a "text" key
                content_obj = r.get("content", {})
                content_text = content_obj.get("text", "") if isinstance(content_obj, dict) else str(content_obj)
                # namespaces is a list; use first entry or fall back to the requested namespace
                namespaces = r.get("namespaces", [])
                primary_namespace = namespaces[0] if namespaces else namespace
                # createdAt is already a datetime object returned by the SDK
                dt = r.get("createdAt")
                created_at = dt if isinstance(dt, datetime) else _parse_dt(dt)
                records.append(
                    MemoryRecord(
                        record_id=r.get("memoryRecordId", ""),
                        content=content_text,
                        namespace=primary_namespace,
                        created_at=created_at,
                    )
                )
            next_token = response.get("nextToken")
            if not next_token:
                break
            kwargs["nextToken"] = next_token
        return records

    @staticmethod
    def _map_event(raw: dict) -> Event:
        messages = []
        # Extract payload (conversational messages)
        if "payload" in raw:
            for item in raw["payload"]:
                if "conversational" in item:
                    conv = item["conversational"]
                    content = conv.get("content", {})
                    text = content.get("text", "")
                    messages.append(Message(role=conv.get("role", ""), content=text))
        else:
            for msg in raw.get("messages", []):
                content = msg.get("content", "")
                if isinstance(content, list):
                    content = " ".join(
                        c.get("text", "") for c in content if isinstance(c, dict)
                    )
                messages.append(Message(role=msg.get("role", ""), content=content))

        # Parse branch
        branch = None
        raw_branch = raw.get("branch")
        if raw_branch and isinstance(raw_branch, dict):
            branch = Branch(
                name=raw_branch.get("name"),
                root_event_id=raw_branch.get("rootEventId"),
            )

        # Parse metadata
        metadata: Optional[Dict[str, Any]] = raw.get("metadata")

        dt = raw.get("eventTimestamp") or raw.get("createdAt") or raw.get("timestamp")
        return Event(
            event_id=raw.get("eventId", ""),
            memory_id=raw.get("memoryId", ""),
            actor_id=raw.get("actorId", ""),
            session_id=raw.get("sessionId", ""),
            messages=messages,
            timestamp=dt if isinstance(dt, datetime) else _parse_dt(dt),
            branch=branch,
            metadata=metadata,
        )

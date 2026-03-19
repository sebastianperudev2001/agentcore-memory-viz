from __future__ import annotations

import asyncio
import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from unittest.mock import AsyncMock
from datetime import datetime
from application.event_service import EventService
from domain.event import Event, Message

scenarios("../list_events.feature")


def make_event(memory_id: str, actor_id: str, session_id: str, n: int) -> Event:
    return Event(
        event_id=f"evt-{n}",
        memory_id=memory_id,
        actor_id=actor_id,
        session_id=session_id,
        messages=[Message(role="USER", content=f"Message {n}")],
        timestamp=datetime(2026, 3, 18),
    )


@pytest.fixture
def context():
    return {}


@given(parsers.parse('AgentCore has {count:d} events for memory "{memory_id}", actor "{actor_id}", session "{session_id}"'))
def agentcore_has_events(context, count, memory_id, actor_id, session_id):
    repo = AsyncMock()
    events = [make_event(memory_id, actor_id, session_id, i) for i in range(count)]
    repo.list_events.return_value = events
    context["service"] = EventService(repo)
    context["repo"] = repo


@given(parsers.parse('an event "{event_id}" exists for memory "{memory_id}", actor "{actor_id}", session "{session_id}"'))
def event_exists(context, event_id, memory_id, actor_id, session_id):
    repo = AsyncMock()
    repo.delete_event.return_value = None
    context["service"] = EventService(repo)
    context["repo"] = repo
    context["event_id"] = event_id
    context["memory_id"] = memory_id
    context["actor_id"] = actor_id
    context["session_id"] = session_id


@when(parsers.parse('I request events for memory "{memory_id}", actor "{actor_id}", session "{session_id}"'))
def request_events(context, memory_id, actor_id, session_id):
    context["result"] = asyncio.get_event_loop().run_until_complete(
        context["service"].list_events(memory_id, actor_id, session_id)
    )


@when(parsers.parse('I delete event "{event_id}" for memory "{memory_id}", actor "{actor_id}", session "{session_id}"'))
def delete_event(context, event_id, memory_id, actor_id, session_id):
    asyncio.get_event_loop().run_until_complete(
        context["service"].delete_event(memory_id, actor_id, session_id, event_id)
    )
    context["deleted_event_id"] = event_id
    context["memory_id"] = memory_id
    context["actor_id"] = actor_id
    context["session_id"] = session_id


@then(parsers.parse("I receive {count:d} events"))
def check_events(context, count):
    assert len(context["result"]) == count


@then("the event is deleted from AgentCore")
def check_deleted(context):
    context["repo"].delete_event.assert_called_once_with(
        context["memory_id"],
        context["actor_id"],
        context["session_id"],
        context["deleted_event_id"],
    )

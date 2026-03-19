from __future__ import annotations

import asyncio
import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from unittest.mock import AsyncMock
from datetime import datetime
from application.session_service import SessionService
from domain.session import MemorySession

scenarios("../list_sessions.feature")


def make_session(memory_id: str, actor_id: str, n: int) -> MemorySession:
    return MemorySession(
        session_id=f"sess-{n}",
        actor_id=actor_id,
        memory_id=memory_id,
        created_at=datetime(2026, 3, 18),
    )


@pytest.fixture
def context():
    return {}


@given(parsers.parse('AgentCore has {count:d} sessions for memory "{memory_id}" and actor "{actor_id}"'))
def agentcore_has_sessions(context, count, memory_id, actor_id):
    repo = AsyncMock()
    sessions = [make_session(memory_id, actor_id, i) for i in range(count)]
    repo.list_sessions.return_value = sessions
    context["service"] = SessionService(repo)
    context["memory_id"] = memory_id
    context["actor_id"] = actor_id


@when(parsers.parse('I request sessions for memory "{memory_id}" and actor "{actor_id}"'))
def request_sessions(context, memory_id, actor_id):
    context["result"] = asyncio.get_event_loop().run_until_complete(
        context["service"].list_sessions(memory_id, actor_id)
    )


@then(parsers.parse("I receive {count:d} sessions"))
def check_sessions(context, count):
    assert len(context["result"]) == count

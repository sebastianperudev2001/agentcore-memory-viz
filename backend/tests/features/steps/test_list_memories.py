from __future__ import annotations

import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime
from application.memory_service import MemoryService
from domain.memory import Memory

scenarios("../list_memories.feature")


def make_memory(agent_id: str) -> Memory:
    return Memory(
        id="mem-1",
        agent_id=agent_id,
        content="Test memory",
        memory_type="SEMANTIC",
        created_at=datetime(2026, 3, 17),
    )


@pytest.fixture
def context():
    return {}


@given(parsers.parse('a cached list of memories for agent "{agent_id}"'))
def cached_memories(context, agent_id):
    memory = make_memory(agent_id)
    repo = AsyncMock()
    cache = MagicMock()
    cache.get.return_value = [memory]
    context["service"] = MemoryService(repo, cache)
    context["agent_id"] = agent_id
    context["repo"] = repo


@given(parsers.parse('no cached memories for agent "{agent_id}"'))
def no_cached_memories(context, agent_id):
    repo = AsyncMock()
    cache = MagicMock()
    cache.get.return_value = None
    context["service"] = MemoryService(repo, cache)
    context["agent_id"] = agent_id
    context["repo"] = repo


@given(parsers.parse('AgentCore has {count:d} memory for agent "{agent_id}"'))
def agentcore_has_memories(context, count, agent_id):
    memories = [make_memory(agent_id) for _ in range(count)]
    context["repo"].list_memories.return_value = memories


@when(parsers.parse('I request memories for agent "{agent_id}"'))
def request_memories(context, agent_id):
    import asyncio
    context["result"] = asyncio.get_event_loop().run_until_complete(
        context["service"].list_memories(agent_id)
    )


@then(parsers.parse("I receive {count:d} memory without calling AgentCore"))
def check_cached_result(context, count):
    assert len(context["result"]) == count
    context["repo"].list_memories.assert_not_called()


@then(parsers.parse("I receive {count:d} memory from AgentCore"))
def check_agentcore_result(context, count):
    assert len(context["result"]) == count
    context["repo"].list_memories.assert_called_once()

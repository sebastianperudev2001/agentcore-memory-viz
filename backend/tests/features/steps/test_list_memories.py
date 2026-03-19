from __future__ import annotations

import asyncio
import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from unittest.mock import AsyncMock, MagicMock
from application.memory_service import MemoryService
from domain.memory_resource import MemoryResource

scenarios("../list_memories.feature")


def make_resource() -> MemoryResource:
    return MemoryResource(
        id="mem-1",
        name="My Memory",
        status="ACTIVE",
        event_expiry_days=30,
        strategies=["SEMANTIC"],
    )


@pytest.fixture
def context():
    return {}


@given("a cached list of memory resources")
def cached_memories(context):
    resource = make_resource()
    repo = AsyncMock()
    cache = MagicMock()
    cache.get.return_value = [resource]
    context["service"] = MemoryService(repo, cache)
    context["repo"] = repo
    context["cache"] = cache


@given("no cached memory resources")
def no_cached_memories(context):
    repo = AsyncMock()
    cache = MagicMock()
    cache.get.return_value = None
    context["service"] = MemoryService(repo, cache)
    context["repo"] = repo
    context["cache"] = cache


@given(parsers.parse("AgentCore has {count:d} memory resource"))
def agentcore_has_resources(context, count):
    resources = [make_resource() for _ in range(count)]
    context["repo"].list_memories.return_value = resources


@when("I request the list of memory resources")
def request_memories(context):
    context["result"] = asyncio.get_event_loop().run_until_complete(
        context["service"].list_memories()
    )


@then(parsers.parse("I receive {count:d} memory resource without calling AgentCore"))
def check_cached_result(context, count):
    assert len(context["result"]) == count
    context["repo"].list_memories.assert_not_called()


@then(parsers.parse("I receive {count:d} memory resource from AgentCore"))
def check_agentcore_result(context, count):
    assert len(context["result"]) == count
    context["repo"].list_memories.assert_called_once()


@then("the result is stored in cache")
def check_cache_stored(context):
    context["cache"].set.assert_called_once()

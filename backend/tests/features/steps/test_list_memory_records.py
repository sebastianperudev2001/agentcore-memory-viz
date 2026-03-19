from __future__ import annotations

import asyncio
import pytest
from pytest_bdd import scenarios, given, when, then, parsers
from unittest.mock import AsyncMock
from datetime import datetime
from application.memory_record_service import MemoryRecordService
from domain.memory_record import MemoryRecord

scenarios("../list_memory_records.feature")


def make_record(namespace: str, n: int) -> MemoryRecord:
    return MemoryRecord(
        record_id=f"rec-{n}",
        content=f"Record content {n}",
        namespace=namespace,
        created_at=datetime(2026, 3, 18),
    )


@pytest.fixture
def context():
    return {}


@given(parsers.parse('AgentCore has {count:d} memory records for memory "{memory_id}" in namespace "{namespace}"'))
def agentcore_has_records(context, count, memory_id, namespace):
    repo = AsyncMock()
    records = [make_record(namespace, i) for i in range(count)]
    repo.list_memory_records.return_value = records
    context["service"] = MemoryRecordService(repo)


@when(parsers.parse('I request memory records for memory "{memory_id}" in namespace "{namespace}"'))
def request_records(context, memory_id, namespace):
    context["result"] = asyncio.get_event_loop().run_until_complete(
        context["service"].list_memory_records(memory_id, namespace)
    )


@then(parsers.parse("I receive {count:d} memory records"))
def check_records(context, count):
    assert len(context["result"]) == count

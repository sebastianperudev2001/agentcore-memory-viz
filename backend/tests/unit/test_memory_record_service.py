from __future__ import annotations

import pytest
from unittest.mock import AsyncMock
from datetime import datetime
from application.memory_record_service import MemoryRecordService
from domain.memory_record import MemoryRecord


@pytest.fixture
def mock_record():
    return MemoryRecord(
        record_id="rec-1",
        content="User prefers concise answers",
        namespace="/preferences",
        created_at=datetime(2026, 3, 18),
    )


@pytest.mark.asyncio
async def test_list_memory_records_delegates_to_repo(mock_record):
    repo = AsyncMock()
    repo.list_memory_records.return_value = [mock_record]

    service = MemoryRecordService(repo)
    result = await service.list_memory_records("mem-1", "/preferences")

    assert len(result) == 1
    assert result[0].record_id == "rec-1"
    repo.list_memory_records.assert_called_once_with("mem-1", "/preferences")


@pytest.mark.asyncio
async def test_list_memory_records_returns_content(mock_record):
    repo = AsyncMock()
    repo.list_memory_records.return_value = [mock_record]

    service = MemoryRecordService(repo)
    result = await service.list_memory_records("mem-1", "/preferences")

    assert result[0].content == "User prefers concise answers"
    assert result[0].namespace == "/preferences"


@pytest.mark.asyncio
async def test_list_memory_records_empty():
    repo = AsyncMock()
    repo.list_memory_records.return_value = []

    service = MemoryRecordService(repo)
    result = await service.list_memory_records("mem-1", "/")

    assert result == []


@pytest.mark.asyncio
async def test_list_memory_records_passes_namespace():
    repo = AsyncMock()
    repo.list_memory_records.return_value = []

    service = MemoryRecordService(repo)
    await service.list_memory_records("mem-42", "/custom/ns")

    repo.list_memory_records.assert_called_once_with("mem-42", "/custom/ns")

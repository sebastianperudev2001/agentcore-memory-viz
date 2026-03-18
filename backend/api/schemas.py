from __future__ import annotations

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MemoryResponse(BaseModel):
    id: str
    agent_id: str
    content: str
    memory_type: str
    created_at: datetime
    session_id: Optional[str] = None

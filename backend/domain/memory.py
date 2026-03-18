from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Memory:
    id: str
    agent_id: str
    content: str
    memory_type: str
    created_at: datetime
    session_id: Optional[str] = None

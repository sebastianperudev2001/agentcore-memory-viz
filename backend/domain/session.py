from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class MemorySession:
    session_id: str
    actor_id: str
    memory_id: str
    created_at: Optional[datetime]

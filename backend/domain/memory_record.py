from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class MemoryRecord:
    record_id: str
    content: str
    namespace: str
    created_at: Optional[datetime]

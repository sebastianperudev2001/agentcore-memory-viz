from __future__ import annotations

from dataclasses import dataclass, field
from typing import List


@dataclass
class MemoryResource:
    id: str
    name: str
    status: str  # CREATING | ACTIVE | UPDATING | DELETING | FAILED
    event_expiry_days: int
    strategies: List[str] = field(default_factory=list)

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional


@dataclass
class Message:
    role: str  # USER | ASSISTANT | TOOL
    content: str


@dataclass
class Event:
    event_id: str
    memory_id: str
    actor_id: str
    session_id: str
    messages: List[Message] = field(default_factory=list)
    timestamp: Optional[datetime] = None

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class Message:
    role: str  # USER | ASSISTANT | TOOL
    content: str


@dataclass
class Branch:
    name: Optional[str] = None
    root_event_id: Optional[str] = None


@dataclass
class Event:
    event_id: str
    memory_id: str
    actor_id: str
    session_id: str
    messages: List[Message] = field(default_factory=list)
    timestamp: Optional[datetime] = None
    branch: Optional[Branch] = None
    metadata: Optional[Dict[str, Any]] = None

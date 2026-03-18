from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import List
from .memory import Memory


@dataclass
class SessionTurn:
    index: int
    user_input: str
    agent_output: str
    memories_read: List[Memory]
    memories_written: List[Memory]


@dataclass
class Session:
    id: str
    agent_id: str
    started_at: datetime
    turns: List[SessionTurn]

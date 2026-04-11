from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class AgentRuntime:
    agentRuntimeArn: str
    agentRuntimeId: str
    agentRuntimeVersion: str
    agentRuntimeName: str
    description: str
    lastUpdatedAt: Optional[datetime] = None
    status: str = ""

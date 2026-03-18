from __future__ import annotations

import boto3
from typing import List
from domain.memory import Memory
from datetime import datetime


class AgentCoreRepository:
    def __init__(self, region: str = "us-east-1"):
        self.client = boto3.client("bedrock-agent-runtime", region_name=region)

    async def list_memories(self, agent_id: str) -> List[Memory]:
        # Placeholder until AgentCore Memory SDK is finalized
        # Will call the actual AWS SDK when API is stable
        return []

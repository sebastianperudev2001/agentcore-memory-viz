from __future__ import annotations

from typing import Any, Dict, Optional

from infrastructure.agentcore_client import AgentCoreRepository


class ActorService:
    def __init__(self, repo: AgentCoreRepository):
        self.repo = repo

    async def list_actors(
        self,
        memory_id: str,
        max_results: Optional[int] = None,
        next_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        response = await self.repo.list_actors(memory_id, max_results, next_token)
        actor_summaries = response.get("actorSummaries", [])
        actor_ids = [
            actor.get("actorId")
            for actor in actor_summaries
            if isinstance(actor, dict) and actor.get("actorId")
        ]
        return {
            "actorIds": actor_ids,
            "nextToken": response.get("nextToken"),
            "count": len(actor_ids),
        }

import { Memory } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface MemoryApiResponse {
  id: string;
  agent_id: string;
  content: string;
  memory_type: string;
  created_at: string;
  session_id?: string;
}

export function mapMemory(raw: MemoryApiResponse): Memory {
  return {
    id: raw.id,
    agentId: raw.agent_id,
    content: raw.content,
    type: raw.memory_type,
    createdAt: raw.created_at,
    sessionId: raw.session_id,
  };
}

export async function fetchMemories(agentId: string): Promise<Memory[]> {
  const res = await fetch(`${BASE_URL}/memories/?agent_id=${encodeURIComponent(agentId)}`);
  if (!res.ok) throw new Error(`Failed to fetch memories: ${res.status}`);
  const data: MemoryApiResponse[] = await res.json();
  return data.map(mapMemory);
}

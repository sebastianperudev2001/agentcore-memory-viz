import { MemorySession } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface MemorySessionApiResponse {
  session_id: string;
  actor_id: string;
  memory_id: string;
  created_at: string | null;
}

function mapSession(raw: MemorySessionApiResponse): MemorySession {
  return {
    sessionId: raw.session_id,
    actorId: raw.actor_id,
    memoryId: raw.memory_id,
    createdAt: raw.created_at,
  };
}

export async function fetchSessions(
  memoryId: string,
  actorId: string
): Promise<MemorySession[]> {
  const res = await fetch(
    `${BASE_URL}/memories/${encodeURIComponent(memoryId)}/sessions?actor_id=${encodeURIComponent(actorId)}`
  );
  if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.status}`);
  const data: MemorySessionApiResponse[] = await res.json();
  return data.map(mapSession);
}

import { Session } from "@/types";
import { MemoryApiResponse, mapMemory } from "./memories";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface SessionTurnApiResponse {
  index: number;
  user_input: string;
  agent_output: string;
  memories_read: MemoryApiResponse[];
  memories_written: MemoryApiResponse[];
}

interface SessionTraceApiResponse {
  session_id: string;
  turns: SessionTurnApiResponse[];
}

export async function fetchSessionTrace(sessionId: string): Promise<Session> {
  const res = await fetch(`${BASE_URL}/sessions/${encodeURIComponent(sessionId)}/trace`);
  if (!res.ok) throw new Error(`Failed to fetch session: ${res.status}`);
  const data: SessionTraceApiResponse = await res.json();
  return {
    id: data.session_id,
    agentId: "",
    startedAt: new Date().toISOString(),
    turns: data.turns.map((t) => ({
      index: t.index,
      input: t.user_input,
      output: t.agent_output,
      memoriesRead: t.memories_read.map(mapMemory),
      memoriesWritten: t.memories_written.map(mapMemory),
    })),
  };
}

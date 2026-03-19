import { MemoryResource } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface MemoryResourceApiResponse {
  id: string;
  name: string;
  status: string;
  event_expiry_days: number;
  strategies: string[];
}

function mapMemoryResource(raw: MemoryResourceApiResponse): MemoryResource {
  return {
    id: raw.id,
    name: raw.name,
    status: raw.status,
    eventExpiryDays: raw.event_expiry_days,
    strategies: raw.strategies,
  };
}

export async function fetchMemories(): Promise<MemoryResource[]> {
  const res = await fetch(`${BASE_URL}/memories/`);
  if (!res.ok) throw new Error(`Failed to fetch memories: ${res.status}`);
  const data: MemoryResourceApiResponse[] = await res.json();
  return data.map(mapMemoryResource);
}

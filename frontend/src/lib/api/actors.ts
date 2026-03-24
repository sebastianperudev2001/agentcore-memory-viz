import { ActorListResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ActorListApiResponse {
  actorIds: string[];
  nextToken: string | null;
  count: number;
}

function mapActorListResponse(raw: ActorListApiResponse): ActorListResponse {
  return {
    actorIds: raw.actorIds ?? [],
    nextToken: raw.nextToken ?? null,
    count: raw.count ?? (raw.actorIds?.length ?? 0),
  };
}

export async function fetchActors(
  memoryId: string,
  nextToken?: string,
  maxResults = 100
): Promise<ActorListResponse> {
  const params = new URLSearchParams();
  params.set("max_results", String(maxResults));
  if (nextToken) {
    params.set("next_token", nextToken);
  }

  const queryString = params.toString();
  const url = `${BASE_URL}/actors/${encodeURIComponent(memoryId)}${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch actors: ${res.status}`);
  return mapActorListResponse(await res.json());
}

import { Event, Message, BulkSeedEventsRequest, BulkSeedEventsResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface EventApiResponse {
  event_id: string;
  memory_id: string;
  actor_id: string;
  session_id: string;
  messages: { role: string; content: string }[];
  timestamp: string | null;
}

function mapEvent(raw: EventApiResponse): Event {
  return {
    eventId: raw.event_id,
    memoryId: raw.memory_id,
    actorId: raw.actor_id,
    sessionId: raw.session_id,
    messages: raw.messages as Message[],
    timestamp: raw.timestamp,
  };
}

function buildParams(actorId: string, sessionId: string): string {
  return `actor_id=${encodeURIComponent(actorId)}&session_id=${encodeURIComponent(sessionId)}`;
}

export async function fetchEvents(
  memoryId: string,
  actorId: string,
  sessionId: string
): Promise<Event[]> {
  const res = await fetch(
    `${BASE_URL}/memories/${encodeURIComponent(memoryId)}/events?${buildParams(actorId, sessionId)}`
  );
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  const data: EventApiResponse[] = await res.json();
  return data.map(mapEvent);
}

export async function fetchEvent(
  memoryId: string,
  actorId: string,
  sessionId: string,
  eventId: string
): Promise<Event> {
  const res = await fetch(
    `${BASE_URL}/memories/${encodeURIComponent(memoryId)}/events/${encodeURIComponent(eventId)}?${buildParams(actorId, sessionId)}`
  );
  if (!res.ok) throw new Error(`Failed to fetch event: ${res.status}`);
  return mapEvent(await res.json());
}

interface BulkSeedEventsApiResponse {
  session_id: string;
  events: EventApiResponse[];
}

export async function bulkSeedEvents(
  memoryId: string,
  request: BulkSeedEventsRequest
): Promise<BulkSeedEventsResponse> {
  const res = await fetch(
    `${BASE_URL}/memories/${encodeURIComponent(memoryId)}/events/bulk`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  const data: BulkSeedEventsApiResponse = await res.json();
  return {
    session_id: data.session_id,
    events: data.events.map(mapEvent),
  };
}

export async function deleteEvent(
  memoryId: string,
  actorId: string,
  sessionId: string,
  eventId: string
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/memories/${encodeURIComponent(memoryId)}/events/${encodeURIComponent(eventId)}?${buildParams(actorId, sessionId)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error(`Failed to delete event: ${res.status}`);
}

export interface MemoryResource {
  id: string;
  name: string;
  status: string;
  eventExpiryDays: number;
  strategies: string[];
}

export interface MemorySession {
  sessionId: string;
  actorId: string;
  memoryId: string;
  createdAt: string | null;
}

export interface Message {
  role: string;
  content: string;
}

export interface Event {
  eventId: string;
  memoryId: string;
  actorId: string;
  sessionId: string;
  messages: Message[];
  timestamp: string | null;
}

export interface MemoryRecord {
  recordId: string;
  content: string;
  namespace: string;
  createdAt: string | null;
}

export interface ActorListResponse {
  actorIds: string[];
  nextToken: string | null;
  count: number;
}

export interface BulkSeedMessage {
  role: string;
  content: string;
}

export interface BulkSeedEventItem {
  messages: BulkSeedMessage[];
  event_timestamp?: string;
}

export interface BulkSeedEventsRequest {
  actor_id: string;
  session_id?: string;
  events: BulkSeedEventItem[];
}

export interface BulkSeedEventsResponse {
  session_id: string;
  events: Event[];
}

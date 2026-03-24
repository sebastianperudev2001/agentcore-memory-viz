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

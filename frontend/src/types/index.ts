export interface Memory {
  id: string;
  agentId: string;
  sessionId?: string;
  content: string;
  createdAt: string;
  type: string;
}

export interface Session {
  id: string;
  agentId: string;
  startedAt: string;
  turns: SessionTurn[];
}

export interface SessionTurn {
  index: number;
  input: string;
  output: string;
  memoriesRead: Memory[];
  memoriesWritten: Memory[];
}

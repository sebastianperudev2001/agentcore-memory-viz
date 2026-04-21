# Event Insertion — Targeted Analysis

## Current State of Event Insertion

### Backend: COMPLETE
The backend already has a fully working bulk event insertion endpoint.

**Endpoint:** `POST /memories/{memory_id}/events/bulk`

**Request schema:**
```json
{
  "actor_id": "string (required)",
  "session_id": "string | null (auto-generates uuid4 hex if null)",
  "events": [
    {
      "messages": [
        { "role": "USER", "content": "Hello" },
        { "role": "ASSISTANT", "content": "Hi there" }
      ],
      "event_timestamp": "ISO datetime (optional, auto-increments if null)"
    }
  ]
}
```

**Response schema:**
```json
{
  "session_id": "generated-or-provided-id",
  "events": [
    {
      "event_id": "...",
      "memory_id": "...",
      "actor_id": "...",
      "session_id": "...",
      "messages": [...],
      "timestamp": "..."
    }
  ]
}
```

**Data flow:**
```
POST /events/bulk
  → EventsRouter.bulk_seed_events()
    → EventService.bulk_seed_events()
      → Generates session_id if null (uuid4().hex)
      → Gets base timestamp (now UTC)
      → For each event:
          - Uses event_timestamp or base + (i * 1ms)
          - AgentCoreRepository.create_event()
            → Transforms messages to AWS format:
               [{"conversational": {"role": role, "content": {"text": content}}}]
            → AWS bedrock-agentcore.create_event()
      → Returns BulkSeedResult
    → Maps to BulkSeedEventsResponse
```

### Frontend: MISSING
The frontend does NOT yet call the bulk insert endpoint.

**Missing pieces:**
1. `bulkSeedEvents()` function in `frontend/src/lib/api/events.ts`
2. TypeScript request/response types for bulk seed
3. UI component — a dialog/panel to input conversation data
4. Integration into the session view or session list

## Message Role Standards

| Role | Description | UI rendering |
|---|---|---|
| `USER` / `HUMAN` | User input | Right-aligned chat bubble |
| `ASSISTANT` | AI response | Left-aligned chat bubble |
| `SYSTEM` | System instruction | Distinct style |
| `TOOL` | Tool call or response | Left-aligned (treated as assistant) |

## Key Implementation Details

- **Session creation is implicit** — sessions are created automatically when the first event is inserted; no separate session creation step needed
- **Event timestamps auto-increment** — if not provided, each event gets `base_time + (i * 1ms)` ensuring stable ordering
- **Roles are case-normalized** in the UI (`role.toUpperCase()`)
- **Content supports JSON** — EventChatView auto-detects and renders JSON content in a code view

## Gaps to Address

| Gap | Where | Priority |
|---|---|---|
| `bulkSeedEvents()` API client function | `frontend/src/lib/api/events.ts` | Required |
| TypeScript types for bulk seed request/response | `frontend/src/types/index.ts` | Required |
| "Insert Events" UI component | New component | Required |
| Integration into session view | Existing pages | Required |
| Input format: conversation parser (if accepting raw text) | New utility | Optional |

# AgentCore Memory — Real Data Wiring Plan

**Date:** 2026-03-18
**Status:** ✅ Implemented

**Goal:** Wire up real Amazon Bedrock AgentCore Memory data via the `bedrock_agentcore` Python SDK. Replace all stub implementations with real AWS calls. Build a drill-down UI: Memory Resources → Sessions → Event Chat View (with Memory Records panel).

---

## Context

Before this plan the backend was entirely stubs — `AgentCoreRepository.list_memories()` returned `[]`, `SessionService.get_trace()` was a placeholder. No real AWS calls were made. The frontend showed empty tables.

---

## Decisions

| Question | Decision |
|---|---|
| AWS credentials | Both: `.env` file (explicit keys) + existing `~/.aws` mount |
| SDK | `bedrock_agentcore.memory.MemoryClient` |
| UI navigation | Drill-down: Memory → Sessions → Event Chat |
| Memory Records | Alongside session events in split panel |
| Domain architecture | Full redesign (all code was stubs, no breaking change) |

---

## Step 0 — Environment / Docker

**Files changed:**
- `docker-compose.yml` — added `env_file: .env` to backend service
- `.env.example` — created at project root (gitignored)

---

## Step 1 — Backend: Dependency

**Files changed:**
- `backend/pyproject.toml` — added `bedrock-agentcore` to `[project.dependencies]`
- `backend/.python-version` — bumped from `3.9` → `3.12` (SDK requires Python ≥3.10)
- `backend/pyproject.toml` — bumped `requires-python` from `>=3.9` → `>=3.10`

---

## Step 2 — Backend: Domain Layer

All entities use `from __future__ import annotations` and `Optional[T]` / `List[T]`.

| File | Action | Description |
|---|---|---|
| `backend/domain/memory.py` | Deleted | Replaced by `memory_resource.py` |
| `backend/domain/memory_resource.py` | Created | `MemoryResource(id, name, status, event_expiry_days, strategies)` |
| `backend/domain/session.py` | Rewritten | `MemorySession(session_id, actor_id, memory_id, created_at)` |
| `backend/domain/event.py` | Created | `Message(role, content)` + `Event(event_id, memory_id, actor_id, session_id, messages, timestamp)` |
| `backend/domain/memory_record.py` | Created | `MemoryRecord(record_id, content, namespace, created_at)` |

---

## Step 3 — Backend: Infrastructure Layer

**File:** `backend/infrastructure/agentcore_client.py` — full rewrite

Uses `bedrock_agentcore.memory.MemoryClient`. SDK surface used:

| Method | SDK call |
|---|---|
| `list_memories()` | `self.client.list_memories()` → `response["memories"]` |
| `list_sessions(memory_id, actor_id)` | `self.client.list_actor_sessions(memory_id, actor_id)` |
| `list_events(memory_id, actor_id, session_id)` | `self.client.list_events(...)` |
| `get_event(...)` | `self.client.gmdp_client.get_event(memoryId=..., ...)` |
| `delete_event(...)` | `self.client.gmdp_client.delete_event(memoryId=..., ...)` |
| `list_memory_records(memory_id, namespace)` | `self.client.list_memory_records(memoryId=..., namespace=...)` |

---

## Step 4 — Backend: Application Layer

| File | Action | Description |
|---|---|---|
| `backend/application/memory_service.py` | Rewritten | `list_memories()` — cache-first (TTL 300s), no agentId arg |
| `backend/application/session_service.py` | Rewritten | `list_sessions(memory_id, actor_id)` |
| `backend/application/event_service.py` | Created | `list_events`, `get_event`, `delete_event` |
| `backend/application/memory_record_service.py` | Created | `list_memory_records(memory_id, namespace)` |

---

## Step 5 — Backend: API Layer

**Schemas** (`backend/api/schemas.py`): replaced `MemoryResponse` with `MemoryResourceResponse`, `MemorySessionResponse`, `MessageResponse`, `EventResponse`, `MemoryRecordResponse`.

**Routers:**

| File | Action | Endpoints |
|---|---|---|
| `api/routers/memories.py` | Rewritten | `GET /memories/` |
| `api/routers/sessions.py` | Rewritten | `GET /memories/{memory_id}/sessions?actor_id=` |
| `api/routers/events.py` | Created | `GET /memories/{memory_id}/events?actor_id=&session_id=`<br>`GET /memories/{memory_id}/events/{event_id}?actor_id=&session_id=`<br>`DELETE /memories/{memory_id}/events/{event_id}?actor_id=&session_id=` |
| `api/routers/memory_records.py` | Created | `GET /memories/{memory_id}/records?namespace=` |

**`backend/main.py`** — registered `events.router` and `memory_records.router`.

---

## Step 6 — Frontend: Types

**File:** `frontend/src/types/index.ts` — full replacement.

Old types (`Memory`, `Session`, `SessionTurn`) removed. New types:
- `MemoryResource`, `MemorySession`, `Message`, `Event`, `MemoryRecord`

---

## Step 7 — Frontend: API Clients

| File | Action |
|---|---|
| `src/lib/api/memories.ts` | Updated — `fetchMemories()` (no args) |
| `src/lib/api/sessions.ts` | Updated — `fetchSessions(memoryId, actorId)` |
| `src/lib/api/events.ts` | Created — `fetchEvents`, `fetchEvent`, `deleteEvent` |
| `src/lib/api/memoryRecords.ts` | Created — `fetchMemoryRecords(memoryId, namespace)` |

---

## Step 8 — Frontend: Hooks

| File | Action |
|---|---|
| `src/hooks/useMemories.ts` | Updated — no args, auto-loads on mount |
| `src/hooks/useSessionTrace.ts` | Deleted |
| `src/hooks/useSessions.ts` | Created — `fetchSessions(actorId)` |
| `src/hooks/useEvents.ts` | Created — `fetchEvents`, `deleteEvent` |
| `src/hooks/useMemoryRecords.ts` | Created — `fetchRecords(memoryId, namespace)` |

---

## Step 9 — Frontend: Components

| File | Action | Description |
|---|---|---|
| `components/memory/MemoryBrowser.tsx` | Rewritten | No agentId input; auto-loads on mount; columns: ID, Name, Status (StatusIndicator), Event Expiry, Strategies; row click → `/memories/{id}` |
| `components/session/SessionTrace.tsx` | Deleted | Replaced by drill-down |
| `components/session/SessionList.tsx` | Created | Actor ID input + Load button; sessions table; row click → `/memories/{id}/sessions/{sessionId}?actorId=` |
| `components/event/EventChatView.tsx` | Created | Chat bubbles per message (USER=left/grey, ASSISTANT=right/blue); delete button per event |
| `components/event/MemoryRecordsPanel.tsx` | Created | Namespace input + Load button; list of records with namespace badge |
| `components/AppShell.tsx` | Updated | Removed "Session Trace" nav link |

---

## Step 10 — Frontend: Pages

| File | Action | Description |
|---|---|---|
| `app/memories/page.tsx` | No change | Already renders `<MemoryBrowser />` |
| `app/memories/[id]/page.tsx` | Rewritten | Renders `<SessionList memoryId={id} />` |
| `app/memories/[id]/sessions/[sessionId]/page.tsx` | Created | Two-column layout: `<EventChatView>` (left) + `<MemoryRecordsPanel>` (right); reads `actorId` from search params |
| `app/sessions/` (all files) | Deleted | Replaced by drill-down navigation |

---

## Verification Checklist

```bash
# 1. Copy env and fill credentials
cp .env.example .env

# 2. Start services
docker-compose up

# 3. Health check
curl http://localhost:8000/health
# → {"status":"ok"}

# 4. List memory resources
curl http://localhost:8000/memories/
# → [{...}, ...]  or []

# 5. List sessions for a memory
curl "http://localhost:8000/memories/{id}/sessions?actor_id=user"

# 6. List events for a session
curl "http://localhost:8000/memories/{id}/events?actor_id=user&session_id=sess-1"

# 7. Delete an event
curl -X DELETE "http://localhost:8000/memories/{id}/events/{event_id}?actor_id=user&session_id=sess-1"
# → 204

# 8. List memory records
curl "http://localhost:8000/memories/{id}/records?namespace=/"

# 9. Frontend — open http://localhost:3000
#    Memory Resources table auto-loads on page open
#    Click a row → Sessions page with Actor ID input
#    Enter actor_id, click Load → sessions table
#    Click a session → Event chat view + Memory Records panel
```

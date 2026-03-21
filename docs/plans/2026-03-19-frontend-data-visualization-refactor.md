# Frontend Data Visualization Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the frontend to properly display all data returned by the backend after the `agentcore_client.py` refactor — specifically fixing role normalization in chat bubbles and adding timestamp/createdAt display to events and memory records.

**Architecture:** Two component files are modified (`EventChatView.tsx`, `MemoryRecordsPanel.tsx`). Two new test files are created. No types, hooks, API, or page files need changes — the backend API shape is unchanged.

**Tech Stack:** Next.js 16, TypeScript, Cloudscape Design System, Jest + React Testing Library, ts-jest

---

## Context

The backend `infrastructure/agentcore_client.py` was updated to properly parse real AWS AgentCore API data (real pagination, `payload.conversational.content.text` format, datetime objects). Real data is now flowing. The frontend has two problems:

1. `ChatBubble` uses `role === "USER"` (case-sensitive) — AWS returns `"user"` or `"HUMAN"`, so user messages render with wrong styling.
2. `event.timestamp` and `record.createdAt` are populated by the backend but never displayed in the UI.

---

## File Map

| Action | Path |
|--------|------|
| CREATE | `frontend/tests/unit/components/EventChatView.test.tsx` |
| CREATE | `frontend/tests/unit/components/MemoryRecordsPanel.test.tsx` |
| EDIT | `frontend/src/components/event/EventChatView.tsx` |
| EDIT | `frontend/src/components/event/MemoryRecordsPanel.tsx` |

---

## Task 1: Fix Role Case-Sensitivity + Add EventChatView Tests

**Files:**
- Create: `frontend/tests/unit/components/EventChatView.test.tsx`
- Modify: `frontend/src/components/event/EventChatView.tsx:18`

### Steps

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/unit/components/EventChatView.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import EventChatView from "@/components/event/EventChatView";
import { Event } from "@/types";

function makeEvent(role: string, content: string): Event {
  return {
    eventId: "evt-1",
    memoryId: "mem-1",
    actorId: "actor-1",
    sessionId: "sess-1",
    messages: [{ role, content }],
    timestamp: null,
  };
}

describe("ChatBubble role normalization", () => {
  it('renders grey bubble for lowercase "user" role', () => {
    render(<EventChatView events={[makeEvent("user", "Hello")]} loading={false} onDelete={() => {}} />);
    const bubble = screen.getByTestId("chat-bubble");
    expect(bubble.style.backgroundColor).toBe("#3d3d3d");
  });

  it('renders grey bubble for "HUMAN" role', () => {
    render(<EventChatView events={[makeEvent("HUMAN", "Hi there")]} loading={false} onDelete={() => {}} />);
    const bubble = screen.getByTestId("chat-bubble");
    expect(bubble.style.backgroundColor).toBe("#3d3d3d");
  });

  it('renders blue bubble for lowercase "assistant" role', () => {
    render(<EventChatView events={[makeEvent("assistant", "Response")]} loading={false} onDelete={() => {}} />);
    const bubble = screen.getByTestId("chat-bubble");
    expect(bubble.style.backgroundColor).toBe("#0972d3");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm run test:unit -- --testPathPattern=EventChatView
```
Expected: FAIL — `getByTestId("chat-bubble")` not found (attribute not yet added) AND wrong backgroundColor

- [ ] **Step 3: Fix role normalization + add `data-testid` to `ChatBubble` in `EventChatView.tsx`**

In `frontend/src/components/event/EventChatView.tsx`:

1. Change line 18 (role comparison):
```typescript
// BEFORE
const isUser = role === "USER";

// AFTER
const normalizedRole = role.toUpperCase();
const isUser = normalizedRole === "USER" || normalizedRole === "HUMAN";
```

2. Add `data-testid="chat-bubble"` to the inner bubble `<div>` (the one with `backgroundColor`):
```tsx
// BEFORE
<div style={{ maxWidth: "75%", padding: "8px 12px", ... }}>

// AFTER
<div data-testid="chat-bubble" style={{ maxWidth: "75%", padding: "8px 12px", ... }}>
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npm run test:unit -- --testPathPattern=EventChatView
```
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/unit/components/EventChatView.test.tsx frontend/src/components/event/EventChatView.tsx
git commit -m "fix(frontend): normalize ChatBubble role to uppercase, treat HUMAN as user"
```

---

## Task 2: Show Event Timestamp in EventChatView Header

**Files:**
- Modify: `frontend/tests/unit/components/EventChatView.test.tsx` (add describe block)
- Modify: `frontend/src/components/event/EventChatView.tsx` (add helper + JSX)

### Steps

- [ ] **Step 1: Add timestamp tests to `EventChatView.test.tsx`**

Append to `frontend/tests/unit/components/EventChatView.test.tsx`:

```typescript
describe("EventChatView timestamp display", () => {
  it("shows formatted timestamp in the event header when timestamp is present", () => {
    const event: Event = {
      eventId: "evt-ts",
      memoryId: "mem-1",
      actorId: "actor-1",
      sessionId: "sess-1",
      messages: [],
      timestamp: "2026-03-18T10:30:00",
    };
    render(<EventChatView events={[event]} loading={false} onDelete={() => {}} />);
    expect(screen.getByText(/evt-ts/)).toBeInTheDocument();
    expect(screen.getByText(/2026|Mar|March/i)).toBeInTheDocument();
  });

  it("shows no date text when timestamp is null", () => {
    const event: Event = {
      eventId: "evt-no-ts",
      memoryId: "mem-1",
      actorId: "actor-1",
      sessionId: "sess-1",
      messages: [],
      timestamp: null,
    };
    render(<EventChatView events={[event]} loading={false} onDelete={() => {}} />);
    expect(screen.getByText(/evt-no-ts/)).toBeInTheDocument();
    expect(screen.queryByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify timestamp tests fail**

```bash
cd frontend && npm run test:unit -- --testPathPattern=EventChatView
```
Expected: 2 new FAIL — timestamp not rendered

- [ ] **Step 3: Add `formatTimestamp` helper and timestamp JSX to `EventChatView.tsx`**

Add helper function before the `ChatBubble` component:
```typescript
function formatTimestamp(ts: string | null): string | null {
  if (!ts) return null;
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return null;
  }
}
```

Update the `<Header>` children inside `events.map` (currently `Event: {event.eventId}`) to:
```tsx
<Header
  variant="h3"
  actions={
    <Button
      iconName="remove"
      variant="icon"
      onClick={() => onDelete(event.eventId)}
      ariaLabel="Delete event"
    />
  }
>
  {(() => {
    const ts = formatTimestamp(event.timestamp);
    return ts
      ? <>Event: {event.eventId} <Box variant="small" color="text-body-secondary" display="inline">{" — "}{ts}</Box></>
      : <>Event: {event.eventId}</>;
  })()}
</Header>
```

- [ ] **Step 4: Run test to verify all pass**

```bash
cd frontend && npm run test:unit -- --testPathPattern=EventChatView
```
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/unit/components/EventChatView.test.tsx frontend/src/components/event/EventChatView.tsx
git commit -m "feat(frontend): show event timestamp in EventChatView header"
```

---

## Task 3: Show `createdAt` in MemoryRecordsPanel

**Files:**
- Create: `frontend/tests/unit/components/MemoryRecordsPanel.test.tsx`
- Modify: `frontend/src/components/event/MemoryRecordsPanel.tsx`

### Steps

- [ ] **Step 1: Write the failing test**

Create `frontend/tests/unit/components/MemoryRecordsPanel.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import MemoryRecordsPanel from "@/components/event/MemoryRecordsPanel";
import { MemoryRecord } from "@/types";

const RECORDS: MemoryRecord[] = [
  {
    recordId: "rec-1",
    content: "Summary content",
    namespace: "/default",
    createdAt: "2026-03-18T09:00:00",
  },
  {
    recordId: "rec-2",
    content: "Another record",
    namespace: "/other",
    createdAt: null,
  },
];

describe("MemoryRecordsPanel", () => {
  it("shows namespace badge, recordId, and content", () => {
    render(<MemoryRecordsPanel records={RECORDS} loading={false} onFetch={() => {}} />);
    expect(screen.getByText("/default")).toBeInTheDocument();
    expect(screen.getByText("rec-1")).toBeInTheDocument();
    expect(screen.getByText("Summary content")).toBeInTheDocument();
  });

  it("shows formatted createdAt when present", () => {
    render(<MemoryRecordsPanel records={RECORDS} loading={false} onFetch={() => {}} />);
    expect(screen.getByText(/2026|Mar|March/i)).toBeInTheDocument();
  });

  it("does not show date text when createdAt is null", () => {
    render(
      <MemoryRecordsPanel records={[RECORDS[1]]} loading={false} onFetch={() => {}} />
    );
    expect(screen.queryByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i)).toBeNull();
  });

  it("shows empty state when no records and not loading", () => {
    render(<MemoryRecordsPanel records={[]} loading={false} onFetch={() => {}} />);
    expect(screen.getByText("No records found.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm run test:unit -- --testPathPattern=MemoryRecordsPanel
```
Expected: "shows formatted createdAt when present" FAIL; others PASS

- [ ] **Step 3: Add `formatTimestamp` and `createdAt` JSX to `MemoryRecordsPanel.tsx`**

Add helper at the top of the file (after imports):
```typescript
function formatTimestamp(ts: string | null): string | null {
  if (!ts) return null;
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return null;
  }
}
```

In the record card `SpaceBetween`, add after the `<Box variant="small">{record.recordId}</Box>` line:
```tsx
{formatTimestamp(record.createdAt) && (
  <Box variant="small" color="text-body-secondary">
    Created: {formatTimestamp(record.createdAt)}
  </Box>
)}
```

- [ ] **Step 4: Run test to verify all pass**

```bash
cd frontend && npm run test:unit -- --testPathPattern=MemoryRecordsPanel
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/unit/components/MemoryRecordsPanel.test.tsx frontend/src/components/event/MemoryRecordsPanel.tsx
git commit -m "feat(frontend): show createdAt in MemoryRecordsPanel record cards"
```

---

## Task 4: Full Suite Verification

- [ ] **Step 1: Run full unit test suite**

```bash
cd frontend && npm run test:unit
```
Expected: All tests PASS — hooks (4 files) + components (2 files) + example

- [ ] **Step 2: Manual smoke test** (requires running backend with real AWS credentials)

```bash
# Terminal 1
cd backend && uv run uvicorn main:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

Open `http://localhost:3000/memories` → click a memory → enter actor ID → click a session → verify:
- Chat bubbles align correctly for USER/user/HUMAN messages (grey, left)
- ASSISTANT/assistant messages align right (blue)
- Event header shows timestamp (e.g. "Event: evt-abc — 3/18/2026, 10:30:00 AM")
- Memory Records panel shows "Created: 3/18/2026, 9:00:00 AM" under each record

---

## Notes

- `role.toUpperCase()` matches existing hook test conventions where mock data uses `"USER"` / `"ASSISTANT"` uppercase.
- `formatTimestamp` is duplicated in both component files (4 lines). If a third component needs it, extract to `src/lib/formatTimestamp.ts`.
- `toLocaleString()` output varies by locale — tests use `/2026|Mar|March/i` regex to be locale-tolerant.
- Jest test match glob `**/tests/unit/**/*.test.(ts|tsx)` (from `jest.config.ts`) automatically picks up new files in `tests/unit/components/`.

# Code Generation Plan: insert-events-modal

## Unit: insert-events-modal

### Step 1 — Add TypeScript types to `frontend/src/types/index.ts`
- [x] Add `BulkSeedMessage` interface `{ role: string; content: string }`
- [x] Add `BulkSeedEventItem` interface `{ messages: BulkSeedMessage[]; event_timestamp?: string }`
- [x] Add `BulkSeedEventsRequest` interface `{ actor_id: string; session_id?: string; events: BulkSeedEventItem[] }`
- [x] Add `BulkSeedEventsResponse` interface `{ session_id: string; events: Event[] }`

### Step 2 — Add `bulkSeedEvents()` to `frontend/src/lib/api/events.ts`
- [x] Add `BulkSeedEventsApiResponse` internal interface (snake_case from API)
- [x] Implement `bulkSeedEvents(memoryId, request): Promise<BulkSeedEventsResponse>` — POST to `/memories/{memoryId}/events/bulk`
- [x] Map snake_case response to camelCase using existing `mapEvent()`

### Step 3 — Create `frontend/src/components/session/InsertEventsModal.tsx`
- [x] Define local state types: `DraftMessage { role, content }`, `DraftEvent { messages: DraftMessage[] }`
- [x] Initialize with 1 event containing 2 messages (USER + ASSISTANT)
- [x] Render `Modal` with header "Insert Events"
- [x] Render `Form` with:
  - `FormField` for `actor_id` (Input, required, shows validation error if empty)
  - `FormField` for `session_id` (Input, optional, placeholder "Leave blank to auto-generate")
  - Repeatable event blocks (one `Container` + `Header` per event):
    - "Event N" heading with "Remove Event" Button (disabled if only 1 event)
    - Repeatable message rows per event:
      - `Select` for role (options: USER, ASSISTANT, SYSTEM, TOOL)
      - `Textarea` for content (shows validation error if empty)
      - "Remove" Button (disabled if only 1 message in event)
    - "Add Message" Button
  - "Add Event" Button
- [x] Loading state: while submitting, disable all fields, buttons, Cancel, and close; show `loading` on Submit button
- [x] Error state: show `Alert type="error"` above form with error message
- [x] On submit: validate → call `bulkSeedEvents()` → on success call `onSuccess()` + close modal
- [x] Props: `{ memoryId, visible, onDismiss, onSuccess }`

### Step 4 — Wire into `frontend/src/components/session/SessionList.tsx`
- [x] Import `InsertEventsModal`
- [x] Add `insertModalVisible` state (boolean, default false)
- [x] Add "Insert Events" Button to the `Header` actions (alongside "Refresh")
- [x] Render `<InsertEventsModal>` with:
  - `memoryId` from props
  - `visible={insertModalVisible}`
  - `onDismiss={() => setInsertModalVisible(false)}`
  - `onSuccess={() => { setInsertModalVisible(false); fetchSessions(actorId); }}`

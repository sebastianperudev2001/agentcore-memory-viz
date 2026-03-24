"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import EventChatView from "@/components/event/EventChatView";
import MemoryRecordsPanel from "@/components/event/MemoryRecordsPanel";
import { useEvents } from "@/hooks/useEvents";
import { useMemoryRecords } from "@/hooks/useMemoryRecords";

export default function SessionEventPage() {
  const params = useParams<{ id: string; actorId: string; sessionId: string }>();
  const memoryId = params.id;
  const actorId = params.actorId;
  const sessionId = params.sessionId;

  const { events, loading: eventsLoading, fetchEvents, deleteEvent } = useEvents();
  const { records, loading: recordsLoading, fetchRecords } = useMemoryRecords();

  useEffect(() => {
    if (memoryId && actorId && sessionId) {
      fetchEvents(memoryId, actorId, sessionId);
      fetchRecords(memoryId, "/");
    }
  }, [memoryId, actorId, sessionId, fetchEvents, fetchRecords]);

  const handleDelete = async (eventId: string) => {
    await deleteEvent(memoryId, actorId, sessionId, eventId);
  };

  return (
    <AppShell
      breadcrumbs={[
        { text: "AgentCore Memory Viz", href: "/" },
        { text: "Memory Browser", href: "/memories" },
        { text: memoryId, href: `/memories/${memoryId}` },
        {
          text: actorId,
          href: `/memories/${memoryId}/actors/${encodeURIComponent(actorId)}/sessions`,
        },
        {
          text: sessionId,
          href: `/memories/${memoryId}/actors/${encodeURIComponent(actorId)}/sessions/${sessionId}`,
        },
      ]}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <EventChatView
          events={events}
          loading={eventsLoading}
          onDelete={handleDelete}
        />
        <MemoryRecordsPanel
          records={records}
          loading={recordsLoading}
          onFetch={(ns) => fetchRecords(memoryId, ns)}
        />
      </div>
    </AppShell>
  );
}

"use client";

import { useEffect } from "react";
import SessionList from "@/components/session/SessionList";
import MemoryRecordsPanel from "@/components/event/MemoryRecordsPanel";
import { useMemoryRecords } from "@/hooks/useMemoryRecords";

interface SessionsWithPreferencesProps {
  memoryId: string;
  actorId: string;
}

export default function SessionsWithPreferences({
  memoryId,
  actorId,
}: SessionsWithPreferencesProps) {
  const { records, loading, fetchRecords } = useMemoryRecords();

  useEffect(() => {
    if (memoryId && actorId) {
      fetchRecords(memoryId, `/preferences/${actorId}`);
    }
  }, [memoryId, actorId, fetchRecords]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 380px",
        gap: "24px",
        alignItems: "start",
      }}
    >
      <SessionList memoryId={memoryId} actorId={actorId} />
      <MemoryRecordsPanel
        records={records}
        loading={loading}
        title="Preferences"
      />
    </div>
  );
}

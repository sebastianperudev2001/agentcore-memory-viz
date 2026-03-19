"use client";

import { useState, useCallback } from "react";
import { MemorySession } from "@/types";
import { fetchSessions as apiFetchSessions } from "@/lib/api/sessions";

export function useSessions(memoryId: string) {
  const [sessions, setSessions] = useState<MemorySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(
    async (actorId: string) => {
      setLoading(true);
      setError(null);
      try {
        setSessions(await apiFetchSessions(memoryId, actorId));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [memoryId]
  );

  return { sessions, loading, error, fetchSessions };
}

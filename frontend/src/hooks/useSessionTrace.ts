"use client";

import { useState, useCallback } from "react";
import { Session } from "@/types";
import { fetchSessionTrace as apiFetchSessionTrace } from "@/lib/api/sessions";

export function useSessionTrace() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrace = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      setSession(await apiFetchSessionTrace(sessionId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSession(null);
    setError(null);
  }, []);

  return { session, loading, error, fetchTrace, reset };
}

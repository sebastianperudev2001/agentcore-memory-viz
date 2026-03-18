"use client";

import { useState, useCallback } from "react";
import { Memory } from "@/types";
import { fetchMemories as apiFetchMemories } from "@/lib/api/memories";

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = useCallback(async (agentId: string) => {
    setLoading(true);
    setError(null);
    try {
      setMemories(await apiFetchMemories(agentId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setMemories([]);
    setError(null);
  }, []);

  return { memories, loading, error, fetchMemories, reset };
}

"use client";

import { useState, useCallback } from "react";
import { MemoryResource } from "@/types";
import { fetchMemories as apiFetchMemories } from "@/lib/api/memories";

export function useMemories() {
  const [memories, setMemories] = useState<MemoryResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMemories(await apiFetchMemories());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  return { memories, loading, error, fetchMemories };
}

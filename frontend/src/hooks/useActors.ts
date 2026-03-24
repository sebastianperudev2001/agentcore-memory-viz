"use client";

import { useState, useCallback } from "react";
import { fetchActors as apiFetchActors } from "@/lib/api/actors";

export function useActors(memoryId: string) {
  const [actors, setActors] = useState<string[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialActors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetchActors(memoryId, undefined, 100);
      setActors(response.actorIds);
      setNextToken(response.nextToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [memoryId]);

  const fetchMoreActors = useCallback(async () => {
    if (!nextToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetchActors(memoryId, nextToken, 100);
      setActors((prev) => [...prev, ...response.actorIds]);
      setNextToken(response.nextToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [memoryId, nextToken]);

  const resetActors = useCallback(() => {
    setActors([]);
    setNextToken(null);
    setError(null);
  }, []);

  return {
    actors,
    nextToken,
    loading,
    error,
    fetchInitialActors,
    fetchMoreActors,
    resetActors,
  };
}

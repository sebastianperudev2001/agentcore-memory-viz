"use client";

import { useState, useCallback } from "react";
import { MemoryRecord } from "@/types";
import { fetchMemoryRecords as apiFetchRecords } from "@/lib/api/memoryRecords";

export function useMemoryRecords() {
  const [records, setRecords] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(
    async (memoryId: string, namespace: string) => {
      setLoading(true);
      setError(null);
      try {
        setRecords(await apiFetchRecords(memoryId, namespace));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { records, loading, error, fetchRecords };
}

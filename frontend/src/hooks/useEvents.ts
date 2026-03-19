"use client";

import { useState, useCallback } from "react";
import { Event } from "@/types";
import {
  fetchEvents as apiFetchEvents,
  deleteEvent as apiDeleteEvent,
} from "@/lib/api/events";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(
    async (memoryId: string, actorId: string, sessionId: string) => {
      setLoading(true);
      setError(null);
      try {
        setEvents(await apiFetchEvents(memoryId, actorId, sessionId));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteEvent = useCallback(
    async (
      memoryId: string,
      actorId: string,
      sessionId: string,
      eventId: string
    ) => {
      await apiDeleteEvent(memoryId, actorId, sessionId, eventId);
      setEvents((prev) => prev.filter((e) => e.eventId !== eventId));
    },
    []
  );

  return { events, loading, error, fetchEvents, deleteEvent };
}

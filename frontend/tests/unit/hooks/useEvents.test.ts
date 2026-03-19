import { renderHook, act } from "@testing-library/react";
import { useEvents } from "@/hooks/useEvents";
import * as api from "@/lib/api/events";
import { Event } from "@/types";

jest.mock("@/lib/api/events");

const mockFetchEvents = api.fetchEvents as jest.MockedFunction<typeof api.fetchEvents>;
const mockDeleteEvent = api.deleteEvent as jest.MockedFunction<typeof api.deleteEvent>;

const EVENTS: Event[] = [
  {
    eventId: "evt-1",
    memoryId: "mem-1",
    actorId: "user-abc",
    sessionId: "sess-1",
    messages: [
      { role: "USER", content: "Hello" },
      { role: "ASSISTANT", content: "Hi" },
    ],
    timestamp: "2026-03-18T00:00:00",
  },
  {
    eventId: "evt-2",
    memoryId: "mem-1",
    actorId: "user-abc",
    sessionId: "sess-1",
    messages: [{ role: "USER", content: "Bye" }],
    timestamp: null,
  },
];

describe("useEvents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with empty events", () => {
    const { result } = renderHook(() => useEvents());
    expect(result.current.events).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("populates events after fetch", async () => {
    mockFetchEvents.mockResolvedValueOnce(EVENTS);
    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.fetchEvents("mem-1", "user-abc", "sess-1");
    });

    expect(result.current.events).toHaveLength(2);
    expect(result.current.events[0].eventId).toBe("evt-1");
  });

  it("removes deleted event from state", async () => {
    mockFetchEvents.mockResolvedValueOnce(EVENTS);
    mockDeleteEvent.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useEvents());
    await act(async () => {
      await result.current.fetchEvents("mem-1", "user-abc", "sess-1");
    });

    await act(async () => {
      await result.current.deleteEvent("mem-1", "user-abc", "sess-1", "evt-1");
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].eventId).toBe("evt-2");
  });

  it("sets error on fetch failure", async () => {
    mockFetchEvents.mockRejectedValueOnce(new Error("Forbidden"));
    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.fetchEvents("mem-1", "user-abc", "sess-1");
    });

    expect(result.current.error).toBe("Forbidden");
  });
});

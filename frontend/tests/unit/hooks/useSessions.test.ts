import { renderHook, act } from "@testing-library/react";
import { useSessions } from "@/hooks/useSessions";
import * as api from "@/lib/api/sessions";
import { MemorySession } from "@/types";

jest.mock("@/lib/api/sessions");

const mockFetchSessions = api.fetchSessions as jest.MockedFunction<typeof api.fetchSessions>;

const SESSIONS: MemorySession[] = [
  { sessionId: "sess-1", actorId: "user-abc", memoryId: "mem-1", createdAt: "2026-03-18T00:00:00" },
  { sessionId: "sess-2", actorId: "user-abc", memoryId: "mem-1", createdAt: null },
];

describe("useSessions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with empty sessions", () => {
    const { result } = renderHook(() => useSessions("mem-1"));
    expect(result.current.sessions).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("populates sessions after fetch", async () => {
    mockFetchSessions.mockResolvedValueOnce(SESSIONS);
    const { result } = renderHook(() => useSessions("mem-1"));

    await act(async () => { await result.current.fetchSessions("user-abc"); });

    expect(result.current.sessions).toHaveLength(2);
    expect(result.current.sessions[0].sessionId).toBe("sess-1");
  });

  it("calls api with correct memoryId and actorId", async () => {
    mockFetchSessions.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useSessions("mem-42"));

    await act(async () => { await result.current.fetchSessions("actor-99"); });

    expect(mockFetchSessions).toHaveBeenCalledWith("mem-42", "actor-99");
  });

  it("sets error on fetch failure", async () => {
    mockFetchSessions.mockRejectedValueOnce(new Error("Unauthorized"));
    const { result } = renderHook(() => useSessions("mem-1"));

    await act(async () => { await result.current.fetchSessions("user-abc"); });

    expect(result.current.error).toBe("Unauthorized");
    expect(result.current.sessions).toEqual([]);
  });

  it("clears error on subsequent successful fetch", async () => {
    mockFetchSessions
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce(SESSIONS);

    const { result } = renderHook(() => useSessions("mem-1"));
    await act(async () => { await result.current.fetchSessions("user-abc"); });
    expect(result.current.error).toBe("fail");

    await act(async () => { await result.current.fetchSessions("user-abc"); });
    expect(result.current.error).toBeNull();
    expect(result.current.sessions).toHaveLength(2);
  });
});

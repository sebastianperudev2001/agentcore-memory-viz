import { renderHook, act } from "@testing-library/react";
import { useMemories } from "@/hooks/useMemories";
import * as api from "@/lib/api/memories";
import { MemoryResource } from "@/types";

jest.mock("@/lib/api/memories");

const mockFetchMemories = api.fetchMemories as jest.MockedFunction<typeof api.fetchMemories>;

const RESOURCES: MemoryResource[] = [
  { id: "mem-1", name: "My Memory", status: "ACTIVE", eventExpiryDays: 30, strategies: ["SEMANTIC"] },
  { id: "mem-2", name: "Other Memory", status: "CREATING", eventExpiryDays: 7, strategies: [] },
];

describe("useMemories", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("starts with empty memories, no loading, no error", () => {
    const { result } = renderHook(() => useMemories());
    expect(result.current.memories).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("populates memories on successful fetch", async () => {
    mockFetchMemories.mockResolvedValueOnce(RESOURCES);
    const { result } = renderHook(() => useMemories());

    await act(async () => { await result.current.fetchMemories(); });

    expect(result.current.memories).toHaveLength(2);
    expect(result.current.memories[0].id).toBe("mem-1");
    expect(result.current.error).toBeNull();
  });

  it("sets loading true while fetching, false after", async () => {
    let resolve: (v: MemoryResource[]) => void;
    mockFetchMemories.mockReturnValueOnce(new Promise((r) => { resolve = r; }));

    const { result } = renderHook(() => useMemories());
    act(() => { result.current.fetchMemories(); });

    expect(result.current.loading).toBe(true);
    await act(async () => { resolve!(RESOURCES); });
    expect(result.current.loading).toBe(false);
  });

  it("sets error message on fetch failure", async () => {
    mockFetchMemories.mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useMemories());

    await act(async () => { await result.current.fetchMemories(); });

    expect(result.current.memories).toEqual([]);
    expect(result.current.error).toBe("Network error");
    expect(result.current.loading).toBe(false);
  });

  it("clears error on subsequent successful fetch", async () => {
    mockFetchMemories
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValueOnce(RESOURCES);

    const { result } = renderHook(() => useMemories());
    await act(async () => { await result.current.fetchMemories(); });
    expect(result.current.error).toBe("fail");

    await act(async () => { await result.current.fetchMemories(); });
    expect(result.current.memories).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });
});

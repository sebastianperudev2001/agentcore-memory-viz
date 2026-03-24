import { renderHook, act } from "@testing-library/react";
import { useActors } from "@/hooks/useActors";
import * as api from "@/lib/api/actors";

jest.mock("@/lib/api/actors");

const mockFetchActors = api.fetchActors as jest.MockedFunction<typeof api.fetchActors>;

describe("useActors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with empty actors state", () => {
    const { result } = renderHook(() => useActors("mem-1"));
    expect(result.current.actors).toEqual([]);
    expect(result.current.nextToken).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("fetches initial actors", async () => {
    mockFetchActors.mockResolvedValueOnce({
      actorIds: ["actor-1", "actor-2"],
      nextToken: "token-1",
      count: 2,
    });

    const { result } = renderHook(() => useActors("mem-1"));

    await act(async () => {
      await result.current.fetchInitialActors();
    });

    expect(mockFetchActors).toHaveBeenCalledWith("mem-1", undefined, 100);
    expect(result.current.actors).toEqual(["actor-1", "actor-2"]);
    expect(result.current.nextToken).toBe("token-1");
  });

  it("appends actors on fetchMoreActors", async () => {
    mockFetchActors
      .mockResolvedValueOnce({
        actorIds: ["actor-1"],
        nextToken: "token-1",
        count: 1,
      })
      .mockResolvedValueOnce({
        actorIds: ["actor-2"],
        nextToken: null,
        count: 1,
      });

    const { result } = renderHook(() => useActors("mem-1"));

    await act(async () => {
      await result.current.fetchInitialActors();
    });

    await act(async () => {
      await result.current.fetchMoreActors();
    });

    expect(mockFetchActors).toHaveBeenNthCalledWith(1, "mem-1", undefined, 100);
    expect(mockFetchActors).toHaveBeenNthCalledWith(2, "mem-1", "token-1", 100);
    expect(result.current.actors).toEqual(["actor-1", "actor-2"]);
    expect(result.current.nextToken).toBeNull();
  });

  it("does not fetch more when nextToken is missing", async () => {
    const { result } = renderHook(() => useActors("mem-1"));

    await act(async () => {
      await result.current.fetchMoreActors();
    });

    expect(mockFetchActors).not.toHaveBeenCalled();
  });

  it("resets state", async () => {
    mockFetchActors.mockResolvedValueOnce({
      actorIds: ["actor-1"],
      nextToken: "token-1",
      count: 1,
    });

    const { result } = renderHook(() => useActors("mem-1"));

    await act(async () => {
      await result.current.fetchInitialActors();
    });

    act(() => {
      result.current.resetActors();
    });

    expect(result.current.actors).toEqual([]);
    expect(result.current.nextToken).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

import { renderHook, act } from "@testing-library/react";
import { useMemoryRecords } from "@/hooks/useMemoryRecords";
import * as api from "@/lib/api/memoryRecords";
import { MemoryRecord } from "@/types";

jest.mock("@/lib/api/memoryRecords");

const mockFetchRecords = api.fetchMemoryRecords as jest.MockedFunction<typeof api.fetchMemoryRecords>;

const RECORDS: MemoryRecord[] = [
  { recordId: "rec-1", content: "User prefers concise answers", namespace: "/prefs", createdAt: "2026-03-18T00:00:00" },
  { recordId: "rec-2", content: "User is based in NYC", namespace: "/prefs", createdAt: null },
];

describe("useMemoryRecords", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with empty records", () => {
    const { result } = renderHook(() => useMemoryRecords());
    expect(result.current.records).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("populates records after fetch", async () => {
    mockFetchRecords.mockResolvedValueOnce(RECORDS);
    const { result } = renderHook(() => useMemoryRecords());

    await act(async () => {
      await result.current.fetchRecords("mem-1", "/prefs");
    });

    expect(result.current.records).toHaveLength(2);
    expect(result.current.records[0].recordId).toBe("rec-1");
  });

  it("calls api with correct memoryId and namespace", async () => {
    mockFetchRecords.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useMemoryRecords());

    await act(async () => {
      await result.current.fetchRecords("mem-42", "/custom/ns");
    });

    expect(mockFetchRecords).toHaveBeenCalledWith("mem-42", "/custom/ns");
  });

  it("sets error on fetch failure", async () => {
    mockFetchRecords.mockRejectedValueOnce(new Error("Not Found"));
    const { result } = renderHook(() => useMemoryRecords());

    await act(async () => {
      await result.current.fetchRecords("mem-1", "/");
    });

    expect(result.current.error).toBe("Not Found");
    expect(result.current.records).toEqual([]);
  });
});

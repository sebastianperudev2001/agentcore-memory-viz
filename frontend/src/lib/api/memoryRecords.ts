import { MemoryRecord } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface MemoryRecordApiResponse {
  record_id: string;
  content: string;
  namespace: string;
  created_at: string | null;
}

function mapRecord(raw: MemoryRecordApiResponse): MemoryRecord {
  return {
    recordId: raw.record_id,
    content: raw.content,
    namespace: raw.namespace,
    createdAt: raw.created_at,
  };
}

export async function fetchMemoryRecords(
  memoryId: string,
  namespace: string
): Promise<MemoryRecord[]> {
  const res = await fetch(
    `${BASE_URL}/memories/${encodeURIComponent(memoryId)}/records?namespace=${encodeURIComponent(namespace)}`
  );
  if (!res.ok) throw new Error(`Failed to fetch memory records: ${res.status}`);
  const data: MemoryRecordApiResponse[] = await res.json();
  return data.map(mapRecord);
}

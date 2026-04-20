import { render, screen } from "@testing-library/react";
import MemoryRecordsPanel from "@/components/event/MemoryRecordsPanel";
import { MemoryRecord } from "@/types";

const RECORDS: MemoryRecord[] = [
  {
    recordId: "rec-1",
    content: "Summary content",
    namespace: "/default",
    createdAt: "2026-03-18T09:00:00",
  },
  {
    recordId: "rec-2",
    content: "Another record",
    namespace: "/other",
    createdAt: null,
  },
];

describe("MemoryRecordsPanel", () => {
  it("shows namespace badge, recordId, and content", () => {
    render(<MemoryRecordsPanel records={RECORDS} loading={false} />);
    expect(screen.getByText("/default")).toBeInTheDocument();
    expect(screen.getByText("rec-1")).toBeInTheDocument();
    expect(screen.getByText("Summary content")).toBeInTheDocument();
  });

  it("shows formatted createdAt when present", () => {
    render(<MemoryRecordsPanel records={RECORDS} loading={false} />);
    const dateMatches = screen.getAllByText(/2026|Mar|March/i);
    expect(dateMatches.length).toBeGreaterThan(0);
  });

  it("does not show date text when createdAt is null", () => {
    render(
      <MemoryRecordsPanel records={[RECORDS[1]]} loading={false} />
    );
    expect(screen.queryByText(/Created:/i)).toBeNull();
  });

  it("shows empty state when no records and not loading", () => {
    render(<MemoryRecordsPanel records={[]} loading={false} />);
    expect(screen.getByText("No records found.")).toBeInTheDocument();
  });
});

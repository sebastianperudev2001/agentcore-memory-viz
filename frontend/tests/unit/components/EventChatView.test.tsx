import { render, screen } from "@testing-library/react";
import EventChatView from "@/components/event/EventChatView";
import { Event } from "@/types";

function makeEvent(role: string, content: string): Event {
  return {
    eventId: "evt-1",
    memoryId: "mem-1",
    actorId: "actor-1",
    sessionId: "sess-1",
    messages: [{ role, content }],
    timestamp: null,
  };
}

describe("EventChatView timestamp display", () => {
  it("shows formatted timestamp in the event header when timestamp is present", () => {
    const event: Event = {
      eventId: "evt-ts",
      memoryId: "mem-1",
      actorId: "actor-1",
      sessionId: "sess-1",
      messages: [],
      timestamp: "2026-03-18T10:30:00",
    };
    render(<EventChatView events={[event]} loading={false} onDelete={() => {}} />);
    expect(screen.getByText(/evt-ts/)).toBeInTheDocument();
    expect(screen.getByText(/2026|Mar|March/i)).toBeInTheDocument();
  });

  it("shows no date text when timestamp is null", () => {
    const event: Event = {
      eventId: "evt-no-ts",
      memoryId: "mem-1",
      actorId: "actor-1",
      sessionId: "sess-1",
      messages: [],
      timestamp: null,
    };
    render(<EventChatView events={[event]} loading={false} onDelete={() => {}} />);
    expect(screen.getByText(/evt-no-ts/)).toBeInTheDocument();
    expect(screen.queryByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i)).toBeNull();
  });
});

describe("ChatBubble role normalization", () => {
  it('renders grey bubble for lowercase "user" role', () => {
    render(<EventChatView events={[makeEvent("user", "Hello")]} loading={false} onDelete={() => {}} />);
    const bubble = screen.getByTestId("chat-bubble");
    // jsdom normalises hex colours to rgb() when reading back style properties
    expect(bubble.style.backgroundColor).toBe("rgb(61, 61, 61)");
  });

  it('renders grey bubble for "HUMAN" role', () => {
    render(<EventChatView events={[makeEvent("HUMAN", "Hi there")]} loading={false} onDelete={() => {}} />);
    const bubble = screen.getByTestId("chat-bubble");
    expect(bubble.style.backgroundColor).toBe("rgb(61, 61, 61)");
  });

  it('renders blue bubble for lowercase "assistant" role', () => {
    render(<EventChatView events={[makeEvent("assistant", "Response")]} loading={false} onDelete={() => {}} />);
    const bubble = screen.getByTestId("chat-bubble");
    expect(bubble.style.backgroundColor).toBe("rgb(9, 114, 211)");
  });
});

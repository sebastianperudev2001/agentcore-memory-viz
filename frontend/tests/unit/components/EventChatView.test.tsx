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

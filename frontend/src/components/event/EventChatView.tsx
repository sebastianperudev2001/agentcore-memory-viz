"use client";

import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Spinner from "@cloudscape-design/components/spinner";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import { Event } from "@/types";

interface EventChatViewProps {
  events: Event[];
  loading: boolean;
  onDelete: (eventId: string) => void;
}

function ChatBubble({ role, content }: { role: string; content: string }) {
  const normalizedRole = role.toUpperCase();
  const isUser = normalizedRole === "USER" || normalizedRole === "HUMAN";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-start" : "flex-end",
        margin: "4px 0",
      }}
    >
      <div
        data-testid="chat-bubble"
        style={{
          maxWidth: "75%",
          padding: "8px 12px",
          borderRadius: "12px",
          backgroundColor: isUser ? "#3d3d3d" : "#0972d3",
          color: "#fff",
          fontSize: "14px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <Box variant="small" color="inherit">
          {role}
        </Box>
        {content}
      </div>
    </div>
  );
}

export default function EventChatView({
  events,
  loading,
  onDelete,
}: EventChatViewProps) {
  if (loading) {
    return <Spinner size="large" />;
  }

  if (events.length === 0) {
    return <Box textAlign="center">No events found for this session.</Box>;
  }

  return (
    <SpaceBetween direction="vertical" size="m">
      {events.map((event) => (
        <Container
          key={event.eventId}
          header={
            <Header
              variant="h3"
              actions={
                <Button
                  iconName="remove"
                  variant="icon"
                  onClick={() => onDelete(event.eventId)}
                  ariaLabel="Delete event"
                />
              }
            >
              Event: {event.eventId}
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="xs">
            {event.messages.map((msg, i) => (
              <ChatBubble key={i} role={msg.role} content={msg.content} />
            ))}
          </SpaceBetween>
        </Container>
      ))}
    </SpaceBetween>
  );
}

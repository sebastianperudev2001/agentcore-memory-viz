"use client";

import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Spinner from "@cloudscape-design/components/spinner";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Avatar from "@cloudscape-design/chat-components/avatar";
import ChatBubble from "@cloudscape-design/chat-components/chat-bubble";
import CodeView from "@cloudscape-design/code-view/code-view";
import { Event } from "@/types";

interface EventChatViewProps {
  events: Event[];
  loading: boolean;
  onDelete: (eventId: string) => void;
}

function formatTimestamp(ts: string | null): string | null {
  if (!ts) return null;
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return null;
  }
}

function tryParseJson(content: string): object | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed !== null && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    // not JSON
  }
  return null;
}

function ChatMessageBubble({ role, content }: { role: string; content: string }) {
  const normalizedRole = role.toUpperCase();
  const isUser = normalizedRole === "USER" || normalizedRole === "HUMAN";
  const isSystem = normalizedRole === "SYSTEM";

  let avatarInitial = "A";
  if (isUser) avatarInitial = "U";
  if (isSystem) avatarInitial = "S";

  const parsed = tryParseJson(content);
  const prettyJson = parsed ? JSON.stringify(parsed, null, 2) : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
        gap: "6px",
      }}
    >
      {/* Chat bubble: just shows the role label, stays compact */}
      <div style={{ maxWidth: "70%" }}>
        <ChatBubble
          type={isUser ? "outgoing" : "incoming"}
          avatar={<Avatar initials={avatarInitial} ariaLabel={`${role} avatar`} />}
          ariaLabel={`${role} message`}
        >
          <Box variant="small" color="text-body-secondary">
            {role}
          </Box>
          {/* Only show plain text inside the bubble, not JSON */}
          {!prettyJson && (
            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: "4px" }}>
              {content}
            </div>
          )}
        </ChatBubble>
      </div>

      {/* JSON rendered separately at full width below bubble */}
      {prettyJson && (
        <div style={{ width: "100%", maxHeight: "220px", overflowY: "auto", overflowX: "auto" }}>
          <CodeView content={prettyJson} lineNumbers={true} wrapLines={true} />
        </div>
      )}
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
              {(() => {
                const ts = formatTimestamp(event.timestamp);
                return ts
                  ? <><span>Event: {event.eventId}</span> <Box variant="small" color="text-body-secondary" display="inline">{" — "}{ts}</Box></>
                  : <>Event: {event.eventId}</>;
              })()}
            </Header>
          }
        >
          <SpaceBetween direction="vertical" size="xs">
            {event.messages.map((msg, i) => (
              <ChatMessageBubble key={i} role={msg.role} content={msg.content} />
            ))}
          </SpaceBetween>
        </Container>
      ))}
    </SpaceBetween>
  );
}

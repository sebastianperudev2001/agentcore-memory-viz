"use client";

import { useState } from "react";
import Modal from "@cloudscape-design/components/modal";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Textarea from "@cloudscape-design/components/textarea";
import Select from "@cloudscape-design/components/select";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import Alert from "@cloudscape-design/components/alert";
import { bulkSeedEvents } from "@/lib/api/events";

const ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "ASSISTANT", label: "Assistant" },
  { value: "SYSTEM", label: "System" },
  { value: "TOOL", label: "Tool" },
];

interface DraftMessage {
  role: string;
  content: string;
}

interface DraftEvent {
  messages: DraftMessage[];
}

function defaultDraft(): DraftEvent[] {
  return [
    {
      messages: [
        { role: "USER", content: "" },
        { role: "ASSISTANT", content: "" },
      ],
    },
  ];
}

interface InsertEventsModalProps {
  memoryId: string;
  visible: boolean;
  onDismiss: () => void;
  onSuccess: () => void;
}

export default function InsertEventsModal({
  memoryId,
  visible,
  onDismiss,
  onSuccess,
}: InsertEventsModalProps) {
  const [actorId, setActorId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [events, setEvents] = useState<DraftEvent[]>(defaultDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actorIdError, setActorIdError] = useState("");
  const [contentErrors, setContentErrors] = useState<Record<string, string>>({});

  function handleDismiss() {
    if (submitting) return;
    resetForm();
    onDismiss();
  }

  function resetForm() {
    setActorId("");
    setSessionId("");
    setEvents(defaultDraft());
    setError(null);
    setActorIdError("");
    setContentErrors({});
  }

  function updateMessage(eIdx: number, mIdx: number, field: keyof DraftMessage, value: string) {
    setEvents((prev) => {
      const next = prev.map((e, ei) =>
        ei === eIdx
          ? {
              ...e,
              messages: e.messages.map((m, mi) =>
                mi === mIdx ? { ...m, [field]: value } : m
              ),
            }
          : e
      );
      return next;
    });
    if (field === "content") {
      setContentErrors((prev) => {
        const key = `${eIdx}-${mIdx}`;
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
  }

  function addMessage(eIdx: number) {
    setEvents((prev) =>
      prev.map((e, ei) =>
        ei === eIdx
          ? { ...e, messages: [...e.messages, { role: "USER", content: "" }] }
          : e
      )
    );
  }

  function removeMessage(eIdx: number, mIdx: number) {
    setEvents((prev) =>
      prev.map((e, ei) =>
        ei === eIdx
          ? { ...e, messages: e.messages.filter((_, mi) => mi !== mIdx) }
          : e
      )
    );
  }

  function addEvent() {
    setEvents((prev) => [
      ...prev,
      { messages: [{ role: "USER", content: "" }] },
    ]);
  }

  function removeEvent(eIdx: number) {
    setEvents((prev) => prev.filter((_, ei) => ei !== eIdx));
  }

  function validate(): boolean {
    let valid = true;

    if (!actorId.trim()) {
      setActorIdError("Actor ID is required.");
      valid = false;
    } else {
      setActorIdError("");
    }

    const newContentErrors: Record<string, string> = {};
    events.forEach((e, eIdx) => {
      e.messages.forEach((m, mIdx) => {
        if (!m.content.trim()) {
          newContentErrors[`${eIdx}-${mIdx}`] = "Message content is required.";
          valid = false;
        }
      });
    });
    setContentErrors(newContentErrors);

    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      await bulkSeedEvents(memoryId, {
        actor_id: actorId.trim(),
        session_id: sessionId.trim() || undefined,
        events: events.map((e) => ({
          messages: e.messages.map((m) => ({ role: m.role, content: m.content })),
        })),
      });
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      onDismiss={handleDismiss}
      closeAriaLabel="Close"
      size="large"
      header="Insert Events"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={handleDismiss} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              Insert
            </Button>
          </SpaceBetween>
        </Box>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {error && (
          <Alert type="error" header="Insertion failed">
            {error}
          </Alert>
        )}

        <Form>
          <SpaceBetween direction="vertical" size="m">
            <FormField label="Actor ID" errorText={actorIdError}>
              <Input
                value={actorId}
                onChange={({ detail }) => {
                  setActorId(detail.value);
                  if (detail.value.trim()) setActorIdError("");
                }}
                placeholder="e.g. user-123"
                disabled={submitting}
              />
            </FormField>

            <FormField
              label={
                <span>
                  Session ID <i>– optional</i>
                </span>
              }
            >
              <Input
                value={sessionId}
                onChange={({ detail }) => setSessionId(detail.value)}
                placeholder="Leave blank to auto-generate"
                disabled={submitting}
              />
            </FormField>
          </SpaceBetween>
        </Form>

        <SpaceBetween direction="vertical" size="m">
          {events.map((event, eIdx) => (
            <Container
              key={eIdx}
              header={
                <Header
                  variant="h3"
                  actions={
                    <Button
                      variant="icon"
                      iconName="remove"
                      ariaLabel="Remove event"
                      onClick={() => removeEvent(eIdx)}
                      disabled={submitting || events.length === 1}
                    />
                  }
                >
                  Event {eIdx + 1}
                </Header>
              }
            >
              <SpaceBetween direction="vertical" size="s">
                {event.messages.map((msg, mIdx) => (
                  <div key={mIdx} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <div style={{ minWidth: "140px" }}>
                      <FormField label={mIdx === 0 ? "Role" : ""}>
                        <Select
                          selectedOption={
                            ROLE_OPTIONS.find((o) => o.value === msg.role) ?? ROLE_OPTIONS[0]
                          }
                          options={ROLE_OPTIONS}
                          onChange={({ detail }) =>
                            updateMessage(eIdx, mIdx, "role", detail.selectedOption.value ?? "USER")
                          }
                          disabled={submitting}
                        />
                      </FormField>
                    </div>

                    <div style={{ flex: 1 }}>
                      <FormField
                        label={mIdx === 0 ? "Content" : ""}
                        errorText={contentErrors[`${eIdx}-${mIdx}`]}
                      >
                        <Textarea
                          value={msg.content}
                          onChange={({ detail }) =>
                            updateMessage(eIdx, mIdx, "content", detail.value)
                          }
                          placeholder="Enter message content"
                          rows={2}
                          disabled={submitting}
                        />
                      </FormField>
                    </div>

                    <div style={{ paddingBlockStart: mIdx === 0 ? "24px" : "4px" }}>
                      <Button
                        variant="icon"
                        iconName="remove"
                        ariaLabel="Remove message"
                        onClick={() => removeMessage(eIdx, mIdx)}
                        disabled={submitting || event.messages.length === 1}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  iconName="add-plus"
                  onClick={() => addMessage(eIdx)}
                  disabled={submitting}
                >
                  Add message
                </Button>
              </SpaceBetween>
            </Container>
          ))}

          <Button iconName="add-plus" onClick={addEvent} disabled={submitting}>
            Add event
          </Button>
        </SpaceBetween>
      </SpaceBetween>
    </Modal>
  );
}

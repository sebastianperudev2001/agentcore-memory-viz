"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Button from "@cloudscape-design/components/button";
import Alert from "@cloudscape-design/components/alert";
import Spinner from "@cloudscape-design/components/spinner";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Box from "@cloudscape-design/components/box";
import { useSessionTrace } from "@/hooks/useSessionTrace";

interface SessionTraceProps {
  initialSessionId: string;
}

export default function SessionTrace({ initialSessionId }: SessionTraceProps) {
  const [sessionId, setSessionId] = useState(initialSessionId);
  const { session, loading, error, fetchTrace } = useSessionTrace();
  const router = useRouter();

  useEffect(() => {
    if (initialSessionId) {
      fetchTrace(initialSessionId);
    }
  }, [initialSessionId]);

  const handleFetch = async () => {
    await fetchTrace(sessionId);
    router.replace(`/sessions/${sessionId}`);
  };

  return (
    <ContentLayout header={<Header variant="h1">Session Trace</Header>}>
      <SpaceBetween direction="vertical" size="l">
        <SpaceBetween direction="horizontal" size="s">
          <FormField label="Session ID">
            <Input
              value={sessionId}
              onChange={({ detail }) => setSessionId(detail.value)}
              placeholder="Enter session ID"
            />
          </FormField>
          <div style={{ paddingTop: "24px" }}>
            <Button
              variant="primary"
              onClick={handleFetch}
              disabled={!sessionId || loading}
            >
              Load Trace
            </Button>
          </div>
        </SpaceBetween>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <Spinner size="large" />
        ) : session ? (
          session.turns.length === 0 ? (
            <StatusIndicator type="info">
              No turns recorded yet.
            </StatusIndicator>
          ) : (
            <SpaceBetween direction="vertical" size="m">
              {session.turns.map((turn) => (
                <ExpandableSection
                  key={turn.index}
                  headerText={`Turn ${turn.index + 1}`}
                  defaultExpanded={turn.index === 0}
                >
                  <SpaceBetween direction="vertical" size="s">
                    <Box variant="awsui-key-label">Input</Box>
                    <Box>{turn.input}</Box>
                    <Box variant="awsui-key-label">Output</Box>
                    <Box>{turn.output}</Box>

                    {turn.memoriesRead.length > 0 && (
                      <SpaceBetween direction="vertical" size="xs">
                        <Box variant="awsui-key-label">Memories Read</Box>
                        {turn.memoriesRead.map((m) => (
                          <StatusIndicator key={m.id} type="success">
                            {m.content.length > 60
                              ? m.content.slice(0, 60) + "…"
                              : m.content}
                          </StatusIndicator>
                        ))}
                      </SpaceBetween>
                    )}

                    {turn.memoriesWritten.length > 0 && (
                      <SpaceBetween direction="vertical" size="xs">
                        <Box variant="awsui-key-label">Memories Written</Box>
                        {turn.memoriesWritten.map((m) => (
                          <StatusIndicator key={m.id} type="warning">
                            {m.content.length > 60
                              ? m.content.slice(0, 60) + "…"
                              : m.content}
                          </StatusIndicator>
                        ))}
                      </SpaceBetween>
                    )}
                  </SpaceBetween>
                </ExpandableSection>
              ))}
            </SpaceBetween>
          )
        ) : null}
      </SpaceBetween>
    </ContentLayout>
  );
}

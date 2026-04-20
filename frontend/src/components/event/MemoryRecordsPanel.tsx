"use client";

import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Spinner from "@cloudscape-design/components/spinner";
import Box from "@cloudscape-design/components/box";
import Badge from "@cloudscape-design/components/badge";
import ExpandableSection from "@cloudscape-design/components/expandable-section";
import { MemoryRecord } from "@/types";

function formatTimestamp(ts: string | null): string | null {
  if (!ts) return null;
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return null;
  }
}

interface MemoryRecordsPanelProps {
  records: MemoryRecord[];
  loading: boolean;
  title?: string;
}

export default function MemoryRecordsPanel({
  records,
  loading,
  title = "Memory Records",
}: MemoryRecordsPanelProps) {
  return (
    <Container header={<Header variant="h2">{title}</Header>}>
      <ExpandableSection headerText={title} defaultExpanded>
        {loading ? (
          <Spinner size="normal" />
        ) : records.length === 0 ? (
          <Box textAlign="center" color="text-body-secondary">
            No records found.
          </Box>
        ) : (
          <SpaceBetween direction="vertical" size="s">
            {records.map((record) => (
              <Container key={record.recordId}>
                <SpaceBetween direction="vertical" size="xs">
                  <SpaceBetween direction="horizontal" size="xs">
                    <Badge color="grey">{record.namespace}</Badge>
                    <Box variant="small" color="text-body-secondary">
                      {record.recordId}
                    </Box>
                  </SpaceBetween>
                  {formatTimestamp(record.createdAt) && (
                    <Box variant="small" color="text-body-secondary">
                      Created: {formatTimestamp(record.createdAt)}
                    </Box>
                  )}
                  <Box>{record.content}</Box>
                </SpaceBetween>
              </Container>
            ))}
          </SpaceBetween>
        )}
      </ExpandableSection>
    </Container>
  );
}

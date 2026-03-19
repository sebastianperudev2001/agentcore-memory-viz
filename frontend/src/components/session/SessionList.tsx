"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Button from "@cloudscape-design/components/button";
import Alert from "@cloudscape-design/components/alert";
import Spinner from "@cloudscape-design/components/spinner";
import Table from "@cloudscape-design/components/table";
import Pagination from "@cloudscape-design/components/pagination";
import Box from "@cloudscape-design/components/box";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { useSessions } from "@/hooks/useSessions";
import { MemorySession } from "@/types";

interface SessionListProps {
  memoryId: string;
}

export default function SessionList({ memoryId }: SessionListProps) {
  const [actorId, setActorId] = useState("");
  const { sessions, loading, error, fetchSessions } = useSessions(memoryId);
  const router = useRouter();

  const { items, collectionProps, paginationProps } = useCollection(sessions, {
    pagination: { pageSize: 10 },
    sorting: {},
  });

  const columnDefinitions = [
    {
      id: "sessionId",
      header: "Session ID",
      cell: (item: MemorySession) => item.sessionId,
      sortingField: "sessionId",
    },
    {
      id: "actorId",
      header: "Actor ID",
      cell: (item: MemorySession) => item.actorId,
      sortingField: "actorId",
    },
    {
      id: "createdAt",
      header: "Created At",
      cell: (item: MemorySession) =>
        item.createdAt ? new Date(item.createdAt).toLocaleString() : "—",
      sortingField: "createdAt",
    },
  ];

  return (
    <ContentLayout
      header={<Header variant="h1">Sessions for {memoryId}</Header>}
    >
      <SpaceBetween direction="vertical" size="l">
        <SpaceBetween direction="horizontal" size="s">
          <FormField label="Actor ID">
            <Input
              value={actorId}
              onChange={({ detail }) => setActorId(detail.value)}
              placeholder="Enter actor ID"
            />
          </FormField>
          <div style={{ paddingTop: "24px" }}>
            <Button
              variant="primary"
              onClick={() => fetchSessions(actorId)}
              disabled={!actorId || loading}
            >
              Load Sessions
            </Button>
          </div>
        </SpaceBetween>

        {error && <Alert type="error">{error}</Alert>}

        {loading ? (
          <Spinner size="large" />
        ) : (
          <Table
            {...collectionProps}
            items={items}
            columnDefinitions={columnDefinitions}
            pagination={<Pagination {...paginationProps} />}
            onRowClick={({ detail }) => {
              const s = detail.item as MemorySession;
              router.push(
                `/memories/${memoryId}/sessions/${s.sessionId}?actorId=${encodeURIComponent(s.actorId)}`
              );
            }}
            empty={
              <Box textAlign="center">
                Enter an Actor ID and click Load Sessions.
              </Box>
            }
          />
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}

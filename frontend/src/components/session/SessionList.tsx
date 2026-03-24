"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
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
  actorId: string;
}

export default function SessionList({ memoryId, actorId }: SessionListProps) {
  const { sessions, loading, error, fetchSessions } = useSessions(memoryId);
  const router = useRouter();

  useEffect(() => {
    if (actorId) {
      fetchSessions(actorId);
    }
  }, [actorId, fetchSessions]);

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
      header={<Header variant="h1">Sessions for {memoryId} / {actorId}</Header>}
    >
      <SpaceBetween direction="vertical" size="l">
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
                `/memories/${memoryId}/actors/${encodeURIComponent(actorId)}/sessions/${s.sessionId}`
              );
            }}
            empty={
              <Box textAlign="center">
                No sessions found for this actor.
              </Box>
            }
          />
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}

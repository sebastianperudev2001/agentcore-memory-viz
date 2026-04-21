"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Alert from "@cloudscape-design/components/alert";
import Spinner from "@cloudscape-design/components/spinner";
import Table from "@cloudscape-design/components/table";
import Pagination from "@cloudscape-design/components/pagination";
import Button from "@cloudscape-design/components/button";
import Box from "@cloudscape-design/components/box";
import Autosuggest from "@cloudscape-design/components/autosuggest";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { useSessions } from "@/hooks/useSessions";
import { MemorySession } from "@/types";
import InsertEventsModal from "./InsertEventsModal";

interface SessionListProps {
  memoryId: string;
  actorId: string;
}

export default function SessionList({ memoryId, actorId }: SessionListProps) {
  const [searchValue, setSearchValue] = useState("");
  const [insertModalVisible, setInsertModalVisible] = useState(false);
  const { sessions, loading, error, fetchSessions } = useSessions(memoryId);
  const router = useRouter();

  const navigateToSession = (sessionId: string) => {
    const normalizedSessionId = sessionId.trim();
    if (!normalizedSessionId) return;
    router.push(
      `/memories/${memoryId}/actors/${encodeURIComponent(actorId)}/sessions/${encodeURIComponent(normalizedSessionId)}`
    );
  };

  useEffect(() => {
    if (actorId) {
      fetchSessions(actorId);
    }
  }, [actorId, fetchSessions]);

  const normalizedSearch = searchValue.trim().toLowerCase();

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : Number.NEGATIVE_INFINITY;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : Number.NEGATIVE_INFINITY;
      return bTime - aTime;
    });
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (!normalizedSearch) return sortedSessions;
    return sortedSessions.filter((session) =>
      session.sessionId.toLowerCase().includes(normalizedSearch)
    );
  }, [sortedSessions, normalizedSearch]);

  const autosuggestOptions = useMemo(() => {
    const source = normalizedSearch
      ? sortedSessions.filter((session) =>
          session.sessionId.toLowerCase().includes(normalizedSearch)
        )
      : sortedSessions;

    return source.map((session) => ({ value: session.sessionId }));
  }, [sortedSessions, normalizedSearch]);

  const { items, collectionProps, paginationProps } = useCollection(filteredSessions, {
    pagination: { pageSize: 100 },
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
      header={
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                onClick={() => fetchSessions(actorId)}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                iconName="add-plus"
                onClick={() => setInsertModalVisible(true)}
              >
                Insert Events
              </Button>
            </SpaceBetween>
          }
        >
          Sessions for {memoryId} / {actorId}
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {error && <Alert type="error">{error}</Alert>}
        <Autosuggest
          value={searchValue}
          options={autosuggestOptions}
          placeholder="Search sessions"
          enteredTextLabel={(value) => `Use: ${value}`}
          onChange={({ detail }) => setSearchValue(detail.value)}
          onSelect={({ detail }) => {
            setSearchValue(detail.value);
            if (sessions.some((session) => session.sessionId === detail.value)) {
              navigateToSession(detail.value);
            }
          }}
          empty="No matching sessions"
        />

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
              navigateToSession(s.sessionId);
            }}
            empty={
              <Box textAlign="center">
                No sessions found for this actor.
              </Box>
            }
          />
        )}
      </SpaceBetween>
      <InsertEventsModal
        memoryId={memoryId}
        visible={insertModalVisible}
        onDismiss={() => setInsertModalVisible(false)}
        onSuccess={() => {
          setInsertModalVisible(false);
          fetchSessions(actorId);
        }}
      />
    </ContentLayout>
  );
}

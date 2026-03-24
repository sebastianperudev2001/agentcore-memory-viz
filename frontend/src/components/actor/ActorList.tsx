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
import { useActors } from "@/hooks/useActors";

interface ActorItem {
  actorId: string;
}

interface ActorListProps {
  memoryId: string;
}

export default function ActorList({ memoryId }: ActorListProps) {
  const [searchValue, setSearchValue] = useState("");
  const {
    actors,
    nextToken,
    loading,
    error,
    fetchInitialActors,
    fetchMoreActors,
    resetActors,
  } = useActors(memoryId);
  const router = useRouter();

  const navigateToActorSessions = (actorId: string) => {
    const normalizedActorId = actorId.trim();
    if (!normalizedActorId) return;
    router.push(
      `/memories/${memoryId}/actors/${encodeURIComponent(normalizedActorId)}/sessions`
    );
  };

  useEffect(() => {
    fetchInitialActors();
    return () => {
      resetActors();
    };
  }, [fetchInitialActors, resetActors]);

  const actorItems: ActorItem[] = actors.map((actorId) => ({ actorId }));
  const normalizedSearch = searchValue.trim().toLowerCase();

  const filteredActorItems = useMemo(() => {
    if (!normalizedSearch) return actorItems;
    return actorItems.filter((item) =>
      item.actorId.toLowerCase().includes(normalizedSearch)
    );
  }, [actorItems, normalizedSearch]);

  const autosuggestOptions = useMemo(() => {
    const source = normalizedSearch
      ? actorItems.filter((item) =>
          item.actorId.toLowerCase().includes(normalizedSearch)
        )
      : actorItems;
    return source.map((item) => ({ value: item.actorId }));
  }, [actorItems, normalizedSearch]);

  const { items, collectionProps, paginationProps } = useCollection(filteredActorItems, {
    pagination: { pageSize: 100 },
    sorting: {},
  });

  const columnDefinitions = [
    {
      id: "actorId",
      header: "Actor ID",
      cell: (item: ActorItem) => item.actorId,
      sortingField: "actorId",
    },
  ];

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <Button iconName="refresh" onClick={fetchInitialActors} loading={loading}>
              Refresh
            </Button>
          }
        >
          Actors for {memoryId}
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {error && <Alert type="error">{error}</Alert>}

        <Autosuggest
          value={searchValue}
          options={autosuggestOptions}
          placeholder="Search actors"
          enteredTextLabel={(value) => `Use: ${value}`}
          onChange={({ detail }) => setSearchValue(detail.value)}
          onSelect={({ detail }) => {
            setSearchValue(detail.value);
            navigateToActorSessions(detail.value);
          }}
          empty="No matching actors"
        />

        <Box>
          <Button
            variant="primary"
            disabled={!searchValue.trim()}
            onClick={() => navigateToActorSessions(searchValue)}
          >
            Go to actor sessions
          </Button>
        </Box>

        {loading && actors.length === 0 ? (
          <Spinner size="large" />
        ) : (
          <Table
            {...collectionProps}
            items={items}
            columnDefinitions={columnDefinitions}
            pagination={<Pagination {...paginationProps} />}
            onRowClick={({ detail }) => {
              const actor = detail.item as ActorItem;
              navigateToActorSessions(actor.actorId);
            }}
            empty={<Box textAlign="center">No actors found for this memory.</Box>}
          />
        )}

        <Box>
          <Button onClick={fetchMoreActors} disabled={!nextToken || loading} loading={loading}>
            Load more actors
          </Button>
        </Box>
      </SpaceBetween>
    </ContentLayout>
  );
}

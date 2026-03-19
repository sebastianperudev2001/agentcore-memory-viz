"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import Alert from "@cloudscape-design/components/alert";
import Spinner from "@cloudscape-design/components/spinner";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import Pagination from "@cloudscape-design/components/pagination";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { useMemories } from "@/hooks/useMemories";
import { MemoryResource } from "@/types";

function statusType(
  status: string
): "success" | "error" | "warning" | "pending" | "in-progress" | "info" {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "FAILED":
      return "error";
    case "DELETING":
      return "warning";
    case "CREATING":
    case "UPDATING":
      return "in-progress";
    default:
      return "info";
  }
}

export default function MemoryBrowser() {
  const { memories, loading, error, fetchMemories } = useMemories();
  const router = useRouter();

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  const { items, filterProps, collectionProps, paginationProps, actions } =
    useCollection(memories, {
      filtering: {
        empty: <Box textAlign="center">No memory resources found.</Box>,
        noMatch: (
          <Box textAlign="center">
            No matches.{" "}
            <Button onClick={() => actions.setFiltering("")}>
              Clear filter
            </Button>
          </Box>
        ),
      },
      pagination: { pageSize: 10 },
      sorting: {},
    });

  const columnDefinitions = [
    {
      id: "id",
      header: "Memory ID",
      cell: (item: MemoryResource) => item.id,
      sortingField: "id",
    },
    {
      id: "name",
      header: "Name",
      cell: (item: MemoryResource) => item.name,
      sortingField: "name",
    },
    {
      id: "status",
      header: "Status",
      cell: (item: MemoryResource) => (
        <StatusIndicator type={statusType(item.status)}>
          {item.status}
        </StatusIndicator>
      ),
      sortingField: "status",
    },
    {
      id: "eventExpiryDays",
      header: "Event Expiry (days)",
      cell: (item: MemoryResource) => item.eventExpiryDays,
      sortingField: "eventExpiryDays",
    },
    {
      id: "strategies",
      header: "Strategies",
      cell: (item: MemoryResource) => (
        <SpaceBetween direction="horizontal" size="xs">
          {item.strategies.map((s) => (
            <Badge key={s} color="blue">
              {s}
            </Badge>
          ))}
        </SpaceBetween>
      ),
    },
  ];

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <Button
              iconName="refresh"
              onClick={fetchMemories}
              loading={loading}
            >
              Refresh
            </Button>
          }
        >
          Memory Resources
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="l">
        {error && <Alert type="error">{error}</Alert>}

        {loading && memories.length === 0 ? (
          <Spinner size="large" />
        ) : (
          <Table
            {...collectionProps}
            items={items}
            columnDefinitions={columnDefinitions}
            filter={
              <TextFilter
                {...filterProps}
                filteringPlaceholder="Filter memory resources"
              />
            }
            pagination={<Pagination {...paginationProps} />}
            onRowClick={({ detail }) =>
              router.push(`/memories/${(detail.item as MemoryResource).id}`)
            }
            empty={<Box textAlign="center">No memory resources found.</Box>}
          />
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}

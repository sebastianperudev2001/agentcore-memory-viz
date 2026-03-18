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
import TextFilter from "@cloudscape-design/components/text-filter";
import Pagination from "@cloudscape-design/components/pagination";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { useMemories } from "@/hooks/useMemories";
import { Memory } from "@/types";

export default function MemoryBrowser() {
  const [agentId, setAgentId] = useState("");
  const { memories, loading, error, fetchMemories } = useMemories();
  const router = useRouter();

  const { items, filterProps, collectionProps, paginationProps, actions } =
    useCollection(memories, {
      filtering: {
        empty: (
          <Box textAlign="center">
            No memories found. Enter an Agent ID and fetch.
          </Box>
        ),
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
      header: "ID",
      cell: (item: Memory) => item.id.slice(0, 8) + "…",
    },
    {
      id: "content",
      header: "Content",
      cell: (item: Memory) =>
        item.content.length > 80
          ? item.content.slice(0, 80) + "…"
          : item.content,
    },
    {
      id: "type",
      header: "Memory Type",
      cell: (item: Memory) => <Badge color="blue">{item.type}</Badge>,
    },
    {
      id: "sessionId",
      header: "Session ID",
      cell: (item: Memory) => item.sessionId ?? "—",
    },
    {
      id: "createdAt",
      header: "Created At",
      cell: (item: Memory) => new Date(item.createdAt).toLocaleString(),
    },
  ];

  return (
    <ContentLayout header={<Header variant="h1">Memory Browser</Header>}>
      <SpaceBetween direction="vertical" size="l">
        <SpaceBetween direction="horizontal" size="s">
          <FormField label="Agent ID">
            <Input
              value={agentId}
              onChange={({ detail }) => setAgentId(detail.value)}
              placeholder="Enter agent ID"
            />
          </FormField>
          <div style={{ paddingTop: "24px" }}>
            <Button
              variant="primary"
              onClick={() => fetchMemories(agentId)}
              disabled={!agentId || loading}
            >
              Fetch Memories
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
            filter={<TextFilter {...filterProps} filteringPlaceholder="Filter memories" />}
            pagination={<Pagination {...paginationProps} />}
            onRowClick={({ detail }) =>
              router.push(`/memories/${(detail.item as Memory).id}`)
            }
            empty={
              <Box textAlign="center">
                No memories found. Enter an Agent ID and fetch.
              </Box>
            }
          />
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}

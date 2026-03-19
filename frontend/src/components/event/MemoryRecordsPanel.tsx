"use client";

import { useState } from "react";
import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Button from "@cloudscape-design/components/button";
import Spinner from "@cloudscape-design/components/spinner";
import Box from "@cloudscape-design/components/box";
import Badge from "@cloudscape-design/components/badge";
import { MemoryRecord } from "@/types";

interface MemoryRecordsPanelProps {
  records: MemoryRecord[];
  loading: boolean;
  onFetch: (namespace: string) => void;
}

export default function MemoryRecordsPanel({
  records,
  loading,
  onFetch,
}: MemoryRecordsPanelProps) {
  const [namespace, setNamespace] = useState("/");

  return (
    <Container header={<Header variant="h2">Memory Records</Header>}>
      <SpaceBetween direction="vertical" size="m">
        <SpaceBetween direction="horizontal" size="s">
          <FormField label="Namespace">
            <Input
              value={namespace}
              onChange={({ detail }) => setNamespace(detail.value)}
              placeholder="/"
            />
          </FormField>
          <div style={{ paddingTop: "24px" }}>
            <Button
              variant="primary"
              onClick={() => onFetch(namespace)}
              loading={loading}
            >
              Load
            </Button>
          </div>
        </SpaceBetween>

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
                  <Box>{record.content}</Box>
                </SpaceBetween>
              </Container>
            ))}
          </SpaceBetween>
        )}
      </SpaceBetween>
    </Container>
  );
}

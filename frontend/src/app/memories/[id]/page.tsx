import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import Box from "@cloudscape-design/components/box";

export const metadata: Metadata = {
  title: "Memory Detail — AgentCore Memory Viz",
};

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell
      breadcrumbs={[
        { text: "AgentCore Memory Viz", href: "/" },
        { text: "Memory Browser", href: "/memories" },
        { text: id, href: `/memories/${id}` },
      ]}
    >
      <Box>Memory detail coming soon.</Box>
    </AppShell>
  );
}

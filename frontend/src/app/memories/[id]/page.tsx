import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import SessionList from "@/components/session/SessionList";

export const metadata: Metadata = {
  title: "Sessions — AgentCore Memory Viz",
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
      <SessionList memoryId={id} />
    </AppShell>
  );
}

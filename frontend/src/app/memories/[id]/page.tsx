import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import ActorList from "@/components/actor/ActorList";

export const metadata: Metadata = {
  title: "Actors — AgentCore Memory Viz",
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
      <ActorList memoryId={id} />
    </AppShell>
  );
}

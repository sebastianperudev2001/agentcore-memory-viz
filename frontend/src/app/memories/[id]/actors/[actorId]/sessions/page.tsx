import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import SessionList from "@/components/session/SessionList";

export const metadata: Metadata = {
  title: "Sessions — AgentCore Memory Viz",
};

export default async function ActorSessionsPage({
  params,
}: {
  params: Promise<{ id: string; actorId: string }>;
}) {
  const { id, actorId } = await params;

  return (
    <AppShell
      breadcrumbs={[
        { text: "AgentCore Memory Viz", href: "/" },
        { text: "Memory Browser", href: "/memories" },
        { text: id, href: `/memories/${id}` },
        {
          text: actorId,
          href: `/memories/${id}/actors/${encodeURIComponent(actorId)}/sessions`,
        },
      ]}
    >
      <SessionList memoryId={id} actorId={actorId} />
    </AppShell>
  );
}

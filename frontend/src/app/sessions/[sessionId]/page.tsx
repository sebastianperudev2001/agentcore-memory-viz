import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import SessionTrace from "@/components/session/SessionTrace";

export const metadata: Metadata = {
  title: "Session Trace — AgentCore Memory Viz",
};

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return (
    <AppShell
      breadcrumbs={[
        { text: "AgentCore Memory Viz", href: "/" },
        { text: "Session Trace", href: "/sessions" },
        { text: sessionId, href: `/sessions/${sessionId}` },
      ]}
    >
      <SessionTrace initialSessionId={sessionId} />
    </AppShell>
  );
}

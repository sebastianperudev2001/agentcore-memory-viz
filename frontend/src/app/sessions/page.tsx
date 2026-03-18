import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import SessionTrace from "@/components/session/SessionTrace";

export const metadata: Metadata = {
  title: "Session Trace — AgentCore Memory Viz",
};

export default function SessionsPage() {
  return (
    <AppShell
      breadcrumbs={[
        { text: "AgentCore Memory Viz", href: "/" },
        { text: "Session Trace", href: "/sessions" },
      ]}
    >
      <SessionTrace initialSessionId="" />
    </AppShell>
  );
}

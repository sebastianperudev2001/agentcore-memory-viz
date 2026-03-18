import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import MemoryBrowser from "@/components/memory/MemoryBrowser";

export const metadata: Metadata = {
  title: "Memory Browser — AgentCore Memory Viz",
};

export default function MemoriesPage() {
  return (
    <AppShell
      breadcrumbs={[
        { text: "AgentCore Memory Viz", href: "/" },
        { text: "Memory Browser", href: "/memories" },
      ]}
    >
      <MemoryBrowser />
    </AppShell>
  );
}

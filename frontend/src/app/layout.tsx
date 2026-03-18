import "@cloudscape-design/global-styles/index.css";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentCore Memory Viz",
  description: "Open source visualizer for Amazon Bedrock AgentCore Memory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

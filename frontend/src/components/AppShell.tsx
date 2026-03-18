"use client";

import { useEffect, useState } from "react";
import AppLayout from "@cloudscape-design/components/app-layout";
import SideNavigation from "@cloudscape-design/components/side-navigation";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import TopNavigation from "@cloudscape-design/components/top-navigation";
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { type: "link" as const, text: "Memory Browser", href: "/memories" },
  { type: "link" as const, text: "Session Trace", href: "/sessions" },
];

interface BreadcrumbItem {
  text: string;
  href: string;
}

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppShell({ children, breadcrumbs }: AppShellProps) {
  const [navOpen, setNavOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    applyMode(darkMode ? Mode.Dark : Mode.Light);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <>
      <TopNavigation
        identity={{ href: "/", title: "AgentCore Memory Viz" }}
        utilities={[
          {
            type: "button",
            iconName: darkMode ? "star" : "star-filled",
            title: darkMode ? "Dark mode" : "Light mode",
            text: darkMode ? "Dark" : "Light",
            onClick: toggleDarkMode,
          },
        ]}
      />
      <AppLayout
        navigationOpen={navOpen}
        onNavigationChange={({ detail }) => setNavOpen(detail.open)}
        navigation={
          <SideNavigation
            header={{ text: "AgentCore Memory Viz", href: "/" }}
            activeHref={pathname}
            items={NAV_ITEMS}
          />
        }
        breadcrumbs={breadcrumbs && <BreadcrumbGroup items={breadcrumbs} />}
        toolsHide
        content={children}
      />
    </>
  );
}

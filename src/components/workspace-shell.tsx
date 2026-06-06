"use client";

import {
  DesktopSidebar,
  MobileSidebar,
} from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { WorkspaceDashboard } from "@/components/workspace-dashboard";
import { navItems, type NavKey } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { useEffect, useMemo, useState } from "react";

export function WorkspaceShell() {
  const [activeNav, setActiveNav] = useState<NavKey>("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const activeItem = useMemo(
    () => navItems.find((item) => item.key === activeNav) ?? navItems[0],
    [activeNav],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarOpen((value) => !value);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavClick = (key: NavKey) => {
    setActiveNav(key);
    setMobileOpen(false);
  };

  return (
    <main className={cn("h-screen overflow-hidden bg-background text-foreground", dark && "dark")}>
      <div className="flex h-screen w-full overflow-hidden">
        <DesktopSidebar
          activeNav={activeNav}
          isOpen={sidebarOpen}
          onNavClick={handleNavClick}
        />

        <MobileSidebar
          activeNav={activeNav}
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onNavClick={handleNavClick}
        />

        <section className="flex h-screen min-w-0 flex-1 flex-col">
          <Header
            activeTitle={activeItem.title}
            dark={dark}
            onMobileMenu={() => setMobileOpen(true)}
            onThemeToggle={() => setDark((value) => !value)}
            onToggleSidebar={() => setSidebarOpen((value) => !value)}
            sidebarOpen={sidebarOpen}
          />

          <WorkspaceDashboard />
        </section>
      </div>
    </main>
  );
}

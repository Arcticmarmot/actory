"use client";

import {
  DesktopSidebar,
  MobileSidebar,
} from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { MyNovelsView } from "@/components/my-novels-view";
import { MyScreenplaysView } from "@/components/my-screenplays-view";
import {
  WorkspaceDashboard,
  type WorkspaceNovelDraft,
} from "@/components/workspace-dashboard";
import { navItems, type NavKey } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { useEffect, useMemo, useState } from "react";

export function WorkspaceShell() {
  const [activeNav, setActiveNav] = useState<NavKey>("workspace");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [workspaceNovelDraft, setWorkspaceNovelDraft] =
    useState<WorkspaceNovelDraft | null>(null);
  const [workspaceDraftKey, setWorkspaceDraftKey] = useState("empty");

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

  const handleConvertNovel = (novel: WorkspaceNovelDraft) => {
    setWorkspaceNovelDraft(novel);
    setWorkspaceDraftKey(`${novel.id ?? novel.title}-${Date.now()}`);
    setActiveNav("workspace");
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

          {activeNav === "workspace" ? (
            <WorkspaceDashboard
              key={workspaceDraftKey}
              initialNovel={workspaceNovelDraft}
            />
          ) : null}
          {activeNav === "novels" ? (
            <MyNovelsView onConvertNovel={handleConvertNovel} />
          ) : null}
          {activeNav === "screenplays" ? <MyScreenplaysView /> : null}
          {activeNav === "stats" ? (
            <PlaceholderPanel title={activeItem.title} />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-4 md:px-6">
      <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
        <strong className="text-sm text-foreground">{title}</strong>
        <p className="mt-2 text-sm text-muted-foreground">该模块待实现。</p>
      </div>
    </div>
  );
}

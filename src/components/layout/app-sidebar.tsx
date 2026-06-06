import { navItems, type NavKey } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { IconUserCircle, IconX } from "@tabler/icons-react";
import { IconButton } from "../ui/icon-button";

export function DesktopSidebar({
  activeNav,
  isOpen,
  onNavClick,
}: {
  activeNav: NavKey;
  isOpen: boolean;
  onNavClick: (key: NavKey) => void;
}) {
  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar/85 text-sidebar-foreground backdrop-blur-xl transition-[width] duration-200 ease-linear md:flex md:flex-col",
        isOpen ? "w-64" : "w-[3.25rem]",
      )}
    >
      <SidebarBrand isOpen={isOpen} />
      <SidebarNav activeNav={activeNav} isOpen={isOpen} onNavClick={onNavClick} />
      <SidebarFooter isOpen={isOpen} />
    </aside>
  );
}

export function MobileSidebar({
  activeNav,
  isOpen,
  onClose,
  onNavClick,
}: {
  activeNav: NavKey;
  isOpen: boolean;
  onClose: () => void;
  onNavClick: (key: NavKey) => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      <button
        aria-label="关闭菜单"
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        type="button"
        onClick={onClose}
      />
      <aside
        className={cn(
          "relative h-full w-72 border-r border-sidebar-border bg-sidebar/90 text-sidebar-foreground shadow-xl backdrop-blur-xl transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-3">
          <SidebarBrand isOpen />
          <IconButton label="关闭菜单" onClick={onClose}>
            <IconX className="size-4" />
          </IconButton>
        </div>
        <SidebarNav activeNav={activeNav} isOpen onNavClick={onNavClick} />
        <SidebarFooter isOpen />
      </aside>
    </div>
  );
}

function SidebarBrand({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="flex h-16 items-center gap-2 px-2">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sidebar-border bg-card/70 text-sm font-semibold text-foreground shadow-sm backdrop-blur">
        A
      </div>
      <div
        className={cn(
          "min-w-0 transition-opacity duration-150",
          isOpen
            ? "w-auto opacity-100"
            : "pointer-events-none w-0 overflow-hidden opacity-0",
        )}
      >
        <p className="truncate text-sm font-semibold leading-5 text-foreground">Actory</p>
        <p className="truncate text-xs text-muted-foreground">Act the story</p>
      </div>
    </div>
  );
}

function SidebarNav({
  activeNav,
  isOpen,
  onNavClick,
}: {
  activeNav: NavKey;
  isOpen: boolean;
  onNavClick: (key: NavKey) => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.key;

          return (
            <button
              key={item.key}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-[15px] font-medium leading-[15px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border border-sidebar-border bg-sidebar-accent/90 text-sidebar-accent-foreground shadow-sm shadow-black/[0.03]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !isOpen && "justify-center",
              )}
              title={item.title}
              type="button"
              onClick={() => onNavClick(item.key)}
            >
              <Icon className="size-[15px] shrink-0" stroke={1.9} />
              <span
                className={cn(
                  "truncate transition-opacity duration-150",
                  isOpen ? "opacity-100" : "hidden opacity-0",
                )}
              >
                {item.title}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function SidebarFooter({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="border-t border-sidebar-border p-2">
      <button
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-md px-2 text-left transition hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !isOpen && "justify-center",
        )}
        title="作者工作区"
        type="button"
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <IconUserCircle className="size-4" />
        </div>
        <div className={cn("min-w-0", isOpen ? "block" : "hidden")}>
          <p className="truncate text-[13px] font-medium text-foreground">作者工作区</p>
          <p className="truncate text-xs text-muted-foreground">本地草稿</p>
        </div>
      </button>
    </div>
  );
}

import { IconButton } from "@/components/ui/icon-button";
import {
  IconBell,
  IconChevronRight,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMenu2,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSun,
} from "@tabler/icons-react";

const actionButtonClass =
  "hidden h-9 cursor-pointer items-center gap-2 rounded-lg border border-primary/15 bg-primary/10 px-3.5 text-xs font-bold text-primary shadow-sm shadow-primary/5 backdrop-blur transition hover:border-primary/25 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex";

export function Header({
  activeTitle,
  dark,
  onMobileMenu,
  onThemeToggle,
  onToggleSidebar,
  sidebarOpen,
}: {
  activeTitle: string;
  dark: boolean;
  onMobileMenu: () => void;
  onThemeToggle: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) {
  const SidebarIcon = sidebarOpen
    ? IconLayoutSidebarLeftCollapse
    : IconLayoutSidebarLeftExpand;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/65 px-3 backdrop-blur-xl md:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <IconButton className="md:hidden" label="打开菜单" onClick={onMobileMenu}>
          <IconMenu2 className="size-4" />
        </IconButton>
        <IconButton
          className="hidden md:inline-flex"
          label={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          onClick={onToggleSidebar}
        >
          <SidebarIcon className="size-4" />
        </IconButton>
        <div className="flex min-w-0 items-center gap-1 text-[13px] text-muted-foreground">
          <span className="hidden sm:inline">Actory</span>
          <IconChevronRight className="hidden size-3 sm:inline" />
          <span className="truncate font-medium text-foreground">{activeTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="hidden h-9 w-64 items-center gap-2 rounded-md border bg-card px-3 text-[13px] text-muted-foreground shadow-sm lg:flex">
          <IconSearch className="size-4" />
          <input
            className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="搜索小说、剧本或场景"
          />
        </label>
        <button
          className={actionButtonClass}
          type="button"
        >
          <IconPlus className="size-4" />
          <strong>开始创作</strong>
        </button>
        <IconButton label={dark ? "切换亮色" : "切换暗色"} onClick={onThemeToggle}>
          {dark ? <IconSun className="size-4" /> : <IconMoon className="size-4" />}
        </IconButton>
        <IconButton label="通知">
          <IconBell className="size-4" />
        </IconButton>
      </div>
    </header>
  );
}

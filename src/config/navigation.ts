import {
  IconBooks,
  IconChartBar,
  IconMovie,
  IconWand,
  type TablerIcon,
} from "@tabler/icons-react";

export type NavKey = "workspace" | "novels" | "screenplays" | "stats";

export type NavItem = {
  key: NavKey;
  title: string;
  icon: TablerIcon;
};

export const navItems: NavItem[] = [
  { key: "workspace", title: "创作中心", icon: IconWand },
  { key: "stats", title: "数据看板", icon: IconChartBar },
  { key: "novels", title: "我的小说", icon: IconBooks },
  { key: "screenplays", title: "我的剧本", icon: IconMovie },
];

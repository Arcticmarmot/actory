"use client";

import { cn } from "@/lib/cn";
import {
  getNovelStorageEventName,
  parseNovelStorageSnapshot,
  readNovelStorageSnapshot,
} from "@/lib/novel-storage";
import {
  getScreenplayStorageEventName,
  parseScreenplayStorageSnapshot,
  readScreenplayStorageSnapshot,
  type StoredScreenplay,
} from "@/lib/screenplay-storage";
import {
  normalizeScreenplayType,
  type ScriptStyleValue,
} from "@/components/workspace-dashboard";
import {
  IconBooks,
  IconChartBar,
  IconMovie,
  IconNotebook,
  IconPhoto,
} from "@tabler/icons-react";
import { useMemo, useSyncExternalStore } from "react";

type StyleStat = {
  backgroundClass: string;
  barClass: string;
  label: string;
  textClass: string;
  value: ScriptStyleValue;
};

const styleStats: StyleStat[] = [
  {
    backgroundClass: "bg-cyan-500/10",
    barClass: "bg-cyan-400",
    label: "标准影视",
    textClass: "text-cyan-500 dark:text-cyan-300",
    value: "standard_film",
  },
  {
    backgroundClass: "bg-rose-500/10",
    barClass: "bg-rose-400",
    label: "商业短剧",
    textClass: "text-rose-500 dark:text-rose-300",
    value: "commercial_short_drama",
  },
  {
    backgroundClass: "bg-emerald-500/10",
    barClass: "bg-emerald-400",
    label: "奇幻动画",
    textClass: "text-emerald-500 dark:text-emerald-300",
    value: "fantasy_animation",
  },
  {
    backgroundClass: "bg-amber-500/10",
    barClass: "bg-amber-400",
    label: "舞台话剧",
    textClass: "text-amber-500 dark:text-amber-300",
    value: "stage_play",
  },
];

const subscribeToCreationStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(getNovelStorageEventName(), callback);
  window.addEventListener(getScreenplayStorageEventName(), callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(getNovelStorageEventName(), callback);
    window.removeEventListener(getScreenplayStorageEventName(), callback);
  };
};

const readCreationStorageSnapshot = () =>
  JSON.stringify({
    novels: readNovelStorageSnapshot(),
    screenplays: readScreenplayStorageSnapshot(),
  });

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "未知时间";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const parseCreationSnapshot = (snapshot: string) => {
  try {
    const parsed = JSON.parse(snapshot) as {
      novels?: unknown;
      screenplays?: unknown;
    };

    return {
      novels:
        typeof parsed.novels === "string"
          ? parseNovelStorageSnapshot(parsed.novels)
          : [],
      screenplays:
        typeof parsed.screenplays === "string"
          ? parseScreenplayStorageSnapshot(parsed.screenplays)
          : [],
    };
  } catch {
    return {
      novels: [],
      screenplays: [],
    };
  }
};

const getStyleLabel = (value: string) =>
  styleStats.find((style) => style.value === normalizeScreenplayType(value))
    ?.label ?? "标准影视";

export function StatsDashboard({
  onOpenScreenplay,
}: {
  onOpenScreenplay: (screenplayId: string) => void;
}) {
  const storageSnapshot = useSyncExternalStore(
    subscribeToCreationStorage,
    readCreationStorageSnapshot,
    () => JSON.stringify({ novels: "[]", screenplays: "[]" }),
  );
  const { novels, screenplays } = useMemo(
    () => parseCreationSnapshot(storageSnapshot),
    [storageSnapshot],
  );
  const chapterCount = useMemo(
    () => novels.reduce((total, novel) => total + novel.chapters.length, 0),
    [novels],
  );
  const sceneCount = useMemo(
    () =>
      screenplays.reduce(
        (total, screenplay) => total + screenplay.scenes.length,
        0,
      ),
    [screenplays],
  );
  const styleCounts = useMemo(
    () =>
      styleStats.map((style) => {
        const count = screenplays.filter(
          (screenplay) =>
            normalizeScreenplayType(screenplay.screenplayType) === style.value,
        ).length;
        const percentage =
          screenplays.length > 0 ? Math.round((count / screenplays.length) * 100) : 0;

        return {
          ...style,
          count,
          percentage,
        };
      }),
    [screenplays],
  );
  const recentScreenplays = useMemo(
    () =>
      [...screenplays]
        .sort(
          (left, right) =>
            new Date(right.updatedAt).getTime() -
            new Date(left.updatedAt).getTime(),
        )
        .slice(0, 5),
    [screenplays],
  );
  const overviewItems = [
    {
      icon: IconBooks,
      label: "小说数",
      value: novels.length,
    },
    {
      icon: IconNotebook,
      label: "章节数",
      value: chapterCount,
    },
    {
      icon: IconMovie,
      label: "剧本数",
      value: screenplays.length,
    },
    {
      icon: IconPhoto,
      label: "场景数",
      value: sceneCount,
    },
  ];

  return (
    <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary shadow-sm">
                <IconChartBar className="size-5" />
              </div>
              <div>
                <strong className="text-lg leading-6 text-foreground md:text-xl">
                  数据概览
                </strong>
                <p className="mt-1 text-xs text-muted-foreground">
                  统计本地保存的小说和剧本草稿
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {overviewItems.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.label}
                  className="rounded-lg border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm text-muted-foreground">
                      {item.label}
                    </strong>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <strong className="mt-5 block text-3xl leading-none text-foreground">
                    {item.value}
                  </strong>
                </article>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3">
            <strong className="text-base text-foreground">剧本风格分布</strong>
            <p className="mt-1 text-xs text-muted-foreground">
              按当前保存剧本数量计算百分比
            </p>
          </div>
          <div className="grid gap-4 rounded-lg border bg-card p-4 shadow-sm md:p-5">
            {styleCounts.map((style) => (
              <div key={style.value} className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2.5 rounded-full",
                        style.barClass,
                      )}
                    />
                    <strong className="text-sm text-foreground">
                      {style.label}
                    </strong>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {style.count} 个 · {style.percentage}%
                  </span>
                </div>
                <div
                  className={cn(
                    "h-3 overflow-hidden rounded-full",
                    style.backgroundClass,
                  )}
                >
                  <div
                    className={cn(
                      "h-full min-w-0 rounded-full transition-all",
                      style.barClass,
                    )}
                    style={{ width: `${style.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3">
            <strong className="text-base text-foreground">最近剧本</strong>
            <p className="mt-1 text-xs text-muted-foreground">
              最近更新的 5 个剧本草稿
            </p>
          </div>
          {recentScreenplays.length > 0 ? (
            <div className="grid gap-3">
              {recentScreenplays.map((screenplay) => (
                <RecentScreenplayItem
                  key={screenplay.id}
                  screenplay={screenplay}
                  onOpen={() => onOpenScreenplay(screenplay.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-md border bg-card p-8 text-center shadow-sm">
              <strong className="text-sm text-foreground">还没有剧本数据</strong>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                在创作中心转换并保存剧本后，这里会显示最近的剧本草稿。
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function RecentScreenplayItem({
  onOpen,
  screenplay,
}: {
  onOpen: () => void;
  screenplay: StoredScreenplay;
}) {
  const style = styleStats.find(
    (item) => item.value === normalizeScreenplayType(screenplay.screenplayType),
  );

  return (
    <button
      className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-4 text-left shadow-sm transition hover:border-primary/35 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      type="button"
      onClick={onOpen}
    >
      <div className="min-w-0">
        <strong className="block truncate text-sm text-foreground">
          {screenplay.title}
        </strong>
        <p className="mt-1 text-xs text-muted-foreground">
          {getStyleLabel(screenplay.screenplayType)} · {screenplay.scenes.length} 场 · 更新于{" "}
          {formatDate(screenplay.updatedAt)}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-md border px-2.5 py-1 text-xs font-bold",
          style?.backgroundClass,
          style?.textClass,
        )}
      >
        {getStyleLabel(screenplay.screenplayType)}
      </span>
    </button>
  );
}

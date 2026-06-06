"use client";

import { cn } from "@/lib/cn";
import {
  IconBooks,
  IconDeviceFloppy,
  IconLock,
  IconLockOpen,
  IconMovie,
  IconPlus,
  IconTrash,
  IconWand,
} from "@tabler/icons-react";
import { useState } from "react";

const MIN_CHAPTERS = 3;
const MAX_CHAPTERS = 10;
const TITLE_LIMIT = 20;
const CONTENT_LIMIT = 5000;

type ChapterDraft = {
  id: string;
  title: string;
  content: string;
  locked: boolean;
};

type ChapterError = {
  title?: string;
  content?: string;
};

type FormNotice = {
  tone: "error" | "success";
  text: string;
};

const styleOptions = [
  {
    label: "电影",
    value: "film",
    idleClass:
      "border-cyan-500/15 bg-cyan-500/5 hover:border-cyan-400/25 hover:bg-cyan-500/10",
    activeClass:
      "border-cyan-300/40 bg-cyan-400/10 shadow-cyan-500/10 ring-cyan-300/15",
  },
  {
    label: "电视剧",
    value: "tv_series",
    idleClass:
      "border-violet-500/15 bg-violet-500/5 hover:border-violet-400/25 hover:bg-violet-500/10",
    activeClass:
      "border-violet-300/40 bg-violet-400/10 shadow-violet-500/10 ring-violet-300/15",
  },
  {
    label: "短剧",
    value: "short_drama",
    idleClass:
      "border-rose-500/15 bg-rose-500/5 hover:border-rose-400/25 hover:bg-rose-500/10",
    activeClass:
      "border-rose-300/40 bg-rose-400/10 shadow-rose-500/10 ring-rose-300/15",
  },
  {
    label: "舞台剧",
    value: "stage_play",
    idleClass:
      "border-amber-500/15 bg-amber-500/5 hover:border-amber-400/25 hover:bg-amber-500/10",
    activeClass:
      "border-amber-300/40 bg-amber-400/10 shadow-amber-500/10 ring-amber-300/15",
  },
  {
    label: "广播剧",
    value: "audio_drama",
    idleClass:
      "border-emerald-500/15 bg-emerald-500/5 hover:border-emerald-400/25 hover:bg-emerald-500/10",
    activeClass:
      "border-emerald-300/40 bg-emerald-400/10 shadow-emerald-500/10 ring-emerald-300/15",
  },
] as const;

type ScriptStyleValue = (typeof styleOptions)[number]["value"];

const initialChapters: ChapterDraft[] = Array.from(
  { length: MIN_CHAPTERS },
  (_, index) => ({
    id: `chapter-${index + 1}`,
    title: "",
    content: "",
    locked: false,
  }),
);

const primaryButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary/15 bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/10 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-card px-3.5 text-xs font-bold text-foreground shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const dangerButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-card px-3.5 text-xs font-bold text-red-500 shadow-sm transition hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40";

const fieldClass =
  "w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-ring/25 read-only:cursor-default read-only:bg-muted/60 read-only:text-muted-foreground";

const errorFieldClass =
  "border-red-500/60 focus:border-red-500/70 focus:ring-red-500/20";

const validateChapter = (chapter: ChapterDraft): ChapterError => ({
  title: chapter.title.trim() ? undefined : "标题不能为空",
  content: chapter.content.trim() ? undefined : "内容不能为空",
});

const hasChapterError = (error: ChapterError) => Boolean(error.title || error.content);

export function WorkspaceDashboard() {
  const [chapters, setChapters] = useState<ChapterDraft[]>(initialChapters);
  const [errors, setErrors] = useState<Record<string, ChapterError>>({});
  const [formNotice, setFormNotice] = useState<FormNotice | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ScriptStyleValue>(
    styleOptions[0].value,
  );
  const canAddChapter = chapters.length < MAX_CHAPTERS;
  const lockedCount = chapters.filter((chapter) => chapter.locked).length;

  const updateChapter = (
    id: string,
    field: "title" | "content",
    value: string,
  ) => {
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === id ? { ...chapter, [field]: value } : chapter,
      ),
    );
    setErrors((current) => {
      if (!current[id]?.[field] || !value.trim()) {
        return current;
      }

      return {
        ...current,
        [id]: {
          ...current[id],
          [field]: undefined,
        },
      };
    });
    setFormNotice(null);
  };

  const toggleChapterLock = (id: string) => {
    const targetChapter = chapters.find((chapter) => chapter.id === id);

    if (!targetChapter) {
      return;
    }

    if (!targetChapter.locked) {
      const nextError = validateChapter(targetChapter);

      if (hasChapterError(nextError)) {
        setErrors((current) => ({ ...current, [id]: nextError }));
        setFormNotice({
          tone: "error",
          text: `第 ${chapters.findIndex((chapter) => chapter.id === id) + 1} 章需要填写标题和内容后才能锁定。`,
        });
        return;
      }
    }

    setErrors((current) => ({ ...current, [id]: {} }));
    setFormNotice(null);
    setChapters((current) =>
      current.map((chapter) =>
        chapter.id === id ? { ...chapter, locked: !chapter.locked } : chapter,
      ),
    );
  };

  const addChapter = () => {
    if (!canAddChapter) {
      return;
    }

    setChapters((current) => [
      ...current,
      {
        id: `chapter-${current.length + 1}-${Date.now()}`,
        title: "",
        content: "",
        locked: false,
      },
    ]);
    setFormNotice(null);
  };

  const deleteChapter = (id: string) => {
    setChapters((current) => {
      if (current.length <= MIN_CHAPTERS) {
        return current;
      }

      return current.filter((chapter) => chapter.id !== id);
    });
    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors[id];
      return nextErrors;
    });
    setFormNotice(null);
  };

  const validateAllChapters = (actionName: "保存" | "转换") => {
    const nextErrors = chapters.reduce<Record<string, ChapterError>>(
      (result, chapter) => {
        const chapterError = validateChapter(chapter);

        if (hasChapterError(chapterError)) {
          result[chapter.id] = chapterError;
        }

        return result;
      },
      {},
    );

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFormNotice({
        tone: "error",
        text: `${actionName}前请补全每个章节的标题和内容。`,
      });
      return;
    }

    setFormNotice({
      tone: "success",
      text: `${actionName}检查通过。`,
    });
  };

  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <div className="grid h-full min-h-0 gap-4 px-4 py-4 md:px-6 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          <input name="script_style" type="hidden" value={selectedStyle} />
          <div className="shrink-0 border-b px-4 py-4 md:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary shadow-sm">
                    <IconBooks className="size-5" />
                  </div>
                  <strong className="text-lg leading-6 text-foreground md:text-xl">
                    小说章节输入
                  </strong>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {styleOptions.map((option) => {
                    const active = selectedStyle === option.value;

                    return (
                      <button
                        key={option.value}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border px-3 text-xs text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? `ring-2 ${option.activeClass}`
                            : option.idleClass,
                        )}
                        type="button"
                        onClick={() => setSelectedStyle(option.value)}
                      >
                        <strong>{option.label}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-md border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {chapters.length}/{MAX_CHAPTERS} 章
                </span>
                <span className="rounded-md border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  已锁定 {lockedCount}
                </span>
              </div>
            </div>
          </div>

          <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto px-4 md:px-5">
            <div className="space-y-3 py-4">
              {chapters.map((chapter, index) => (
                <ChapterCard
                  key={chapter.id}
                  canDelete={chapters.length > MIN_CHAPTERS}
                  chapter={chapter}
                  error={errors[chapter.id]}
                  index={index}
                  onChange={updateChapter}
                  onDelete={deleteChapter}
                  onToggleLock={toggleChapterLock}
                />
              ))}

              <button
                className={cn(
                  "flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed bg-background text-xs font-bold text-muted-foreground transition hover:border-primary/40 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  !canAddChapter && "cursor-not-allowed opacity-50 hover:border-border hover:bg-background hover:text-muted-foreground",
                )}
                disabled={!canAddChapter}
                type="button"
                onClick={addChapter}
              >
                <IconPlus className="size-4" />
                <strong>{canAddChapter ? "新增章节" : "最多 10 个章节"}</strong>
              </button>
            </div>
          </div>

          <div className="shrink-0 border-t bg-card/90 px-4 py-3 backdrop-blur md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  标题最多 {TITLE_LIMIT} 字，内容最多 {CONTENT_LIMIT} 字。
                </p>
                {formNotice ? (
                  <p
                    className={cn(
                      "mt-1 text-xs font-medium",
                      formNotice.tone === "error" ? "text-red-500" : "text-primary",
                    )}
                  >
                    {formNotice.text}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  className={secondaryButtonClass}
                  type="button"
                  onClick={() => validateAllChapters("保存")}
                >
                  <IconDeviceFloppy className="size-4" />
                  <strong>保存</strong>
                </button>
                <button
                  className={primaryButtonClass}
                  type="button"
                  onClick={() => validateAllChapters("转换")}
                >
                  <IconWand className="size-4" />
                  <strong>转换</strong>
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="subtle-scrollbar min-h-0 overflow-y-auto rounded-lg border bg-card p-4 shadow-sm md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary shadow-sm">
                <IconMovie className="size-5" />
              </div>
              <strong className="text-lg leading-6 text-foreground md:text-xl">
                剧本样式输出
              </strong>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-md border bg-background p-4">
              <p className="text-sm font-medium">输入要求</p>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
                <p>默认 3 个章节，可新增到 10 个章节。</p>
                <p>每章包含标题和内容，支持单章锁定。</p>
                <p>左右区域独立滚动，长内容不会影响另一侧操作。</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChapterCard({
  canDelete,
  chapter,
  error,
  index,
  onChange,
  onDelete,
  onToggleLock,
}: {
  canDelete: boolean;
  chapter: ChapterDraft;
  error?: ChapterError;
  index: number;
  onChange: (id: string, field: "title" | "content", value: string) => void;
  onDelete: (id: string) => void;
  onToggleLock: (id: string) => void;
}) {
  const LockIcon = chapter.locked ? IconLock : IconLockOpen;

  return (
    <article
      className={cn(
        "rounded-lg border bg-background p-4 shadow-sm transition",
        chapter.locked && "border-primary/20 bg-accent/60",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground">
            {index + 1}
          </div>
          <div>
            <h3 className="text-sm font-semibold">第 {index + 1} 章</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {chapter.locked ? "已锁定，当前只读" : "编辑中"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className={secondaryButtonClass}
            type="button"
            onClick={() => onToggleLock(chapter.id)}
          >
            <LockIcon className="size-4" />
            <strong>{chapter.locked ? "解锁" : "锁定"}</strong>
          </button>
          <button
            className={dangerButtonClass}
            disabled={!canDelete}
            title={canDelete ? "删除章节" : "至少保留 3 个章节"}
            type="button"
            onClick={() => onDelete(chapter.id)}
          >
            <IconTrash className="size-4" />
            <strong>删除</strong>
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2">
          <span className="flex items-center justify-between gap-3 text-sm font-medium">
            标题
            <span className="text-xs font-normal text-muted-foreground">
              {chapter.title.length}/{TITLE_LIMIT}
            </span>
          </span>
          <input
            aria-invalid={Boolean(error?.title)}
            aria-readonly={chapter.locked}
            className={cn(fieldClass, error?.title && errorFieldClass)}
            maxLength={TITLE_LIMIT}
            placeholder="输入章节标题"
            readOnly={chapter.locked}
            value={chapter.title}
            onChange={(event) =>
              onChange(chapter.id, "title", event.target.value)
            }
          />
          {error?.title ? (
            <span className="text-xs font-medium text-red-500">{error.title}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="flex items-center justify-between gap-3 text-sm font-medium">
            内容
            <span className="text-xs font-normal text-muted-foreground">
              {chapter.content.length}/{CONTENT_LIMIT}
            </span>
          </span>
          <textarea
            aria-invalid={Boolean(error?.content)}
            aria-readonly={chapter.locked}
            className={cn(
              fieldClass,
              "subtle-scrollbar min-h-44 resize-y leading-6",
              error?.content && errorFieldClass,
            )}
            maxLength={CONTENT_LIMIT}
            placeholder="输入章节正文，后续会用于转换为剧本初稿"
            readOnly={chapter.locked}
            value={chapter.content}
            onChange={(event) =>
              onChange(chapter.id, "content", event.target.value)
            }
          />
          {error?.content ? (
            <span className="text-xs font-medium text-red-500">
              {error.content}
            </span>
          ) : null}
        </label>
      </div>
    </article>
  );
}

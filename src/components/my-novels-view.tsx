"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/cn";
import {
  createStoredNovel,
  deleteStoredNovel,
  findNovelTitleConflict,
  getNovelStorageEventName,
  parseNovelStorageSnapshot,
  readNovelStorageSnapshot,
  type StoredNovel,
  type StoredNovelChapter,
  updateStoredNovel,
} from "@/lib/novel-storage";
import {
  IconArrowLeft,
  IconBooks,
  IconChevronDown,
  IconChevronUp,
  IconDeviceFloppy,
  IconEdit,
  IconLock,
  IconLockOpen,
  IconPlus,
  IconTrash,
  IconWand,
  IconX,
} from "@tabler/icons-react";
import { useMemo, useState, useSyncExternalStore } from "react";

const MIN_CHAPTERS = 3;
const MAX_CHAPTERS = 10;
const TITLE_LIMIT = 20;
const CONTENT_LIMIT = 5000;

type RightPanelMode = "empty" | "view" | "new" | "edit";

type NovelChapterDraft = {
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

const createInitialChapters = (): NovelChapterDraft[] =>
  Array.from({ length: MIN_CHAPTERS }, (_, index) => ({
    id: `chapter-${index + 1}`,
    title: "",
    content: "",
    locked: false,
  }));

const primaryButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary/15 bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/10 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-card px-3.5 text-xs font-bold text-foreground shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const dangerButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-card px-3.5 text-xs font-bold text-red-500 shadow-sm transition hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40";

const lockButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-warning/35 bg-warning/10 px-3.5 text-xs font-bold text-warning shadow-sm transition hover:bg-warning/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const fieldClass =
  "w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-ring/25 read-only:cursor-default read-only:bg-muted/60 read-only:text-muted-foreground";

const errorFieldClass =
  "border-red-500/60 focus:border-red-500/70 focus:ring-red-500/20";

const validateChapter = (chapter: NovelChapterDraft): ChapterError => ({
  title: chapter.title.trim() ? undefined : "标题不能为空",
  content: chapter.content.trim() ? undefined : "内容不能为空",
});

const hasChapterError = (error: ChapterError) => Boolean(error.title || error.content);

const toDraftChapters = (chapters: StoredNovelChapter[]): NovelChapterDraft[] =>
  chapters.length >= MIN_CHAPTERS
    ? chapters.slice(0, MAX_CHAPTERS).map((chapter, index) => ({
        id: chapter.id || `chapter-${index + 1}`,
        title: chapter.title,
        content: chapter.content,
        locked: Boolean(chapter.locked),
      }))
    : createInitialChapters();

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

const subscribeToNovelStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(getNovelStorageEventName(), callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(getNovelStorageEventName(), callback);
  };
};

export function MyNovelsView({
  onConvertNovel,
}: {
  onConvertNovel: (novel: StoredNovel) => void;
}) {
  const [panelMode, setPanelMode] = useState<RightPanelMode>("empty");
  const [selectedNovelId, setSelectedNovelId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoredNovel | null>(null);
  const novelStorageSnapshot = useSyncExternalStore(
    subscribeToNovelStorage,
    readNovelStorageSnapshot,
    () => "[]",
  );
  const novels = useMemo(
    () => parseNovelStorageSnapshot(novelStorageSnapshot),
    [novelStorageSnapshot],
  );
  const sortedNovels = useMemo(
    () =>
      [...novels].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      ),
    [novels],
  );
  const selectedNovel =
    sortedNovels.find((novel) => novel.id === selectedNovelId) ?? null;

  const openEmptyPanel = () => {
    setPanelMode("empty");
    setSelectedNovelId(null);
  };

  const openCreatePanel = () => {
    setSelectedNovelId(null);
    setPanelMode("new");
  };

  const openViewPanel = (novel: StoredNovel) => {
    setSelectedNovelId(novel.id);
    setPanelMode("view");
  };

  const openEditPanel = (novel: StoredNovel) => {
    setSelectedNovelId(novel.id);
    setPanelMode("edit");
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) {
      return;
    }

    deleteStoredNovel(deleteTarget.id);

    if (deleteTarget.id === selectedNovelId) {
      openEmptyPanel();
    }

    setDeleteTarget(null);
  };

  const handleSaved = (novel: StoredNovel) => {
    setSelectedNovelId(novel.id);
    setPanelMode("view");
  };

  return (
    <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 md:px-6">
      {deleteTarget ? (
        <ConfirmDialog
          cancelLabel="取消"
          confirmLabel="删除"
          message={`确认删除小说《${deleteTarget.title}》吗？`}
          title="删除小说"
          tone="danger"
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary shadow-sm">
                <IconBooks className="size-5" />
              </div>
              <div>
                <strong className="text-lg leading-6 text-foreground md:text-xl">
                  我的小说
                </strong>
                <p className="mt-1 text-xs text-muted-foreground">
                  已保存 {sortedNovels.length} 部小说草稿
                </p>
              </div>
            </div>
            <button className={primaryButtonClass} type="button" onClick={openCreatePanel}>
              <IconPlus className="size-4" />
              <strong>新建小说</strong>
            </button>
          </div>

          <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
            {sortedNovels.length > 0 ? (
              <div className="grid gap-3">
                {sortedNovels.map((novel) => {
                  const active = selectedNovelId === novel.id;

                  return (
                    <article
                      key={novel.id}
                      className={cn(
                        "rounded-lg border bg-background p-4 shadow-sm transition",
                        active && "border-primary/35 bg-accent/50",
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <button
                          className="min-w-0 flex-1 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          type="button"
                          onClick={() => openViewPanel(novel)}
                        >
                          <strong className="block truncate text-base text-foreground">
                            {novel.title}
                          </strong>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {novel.chapters.length} 章 · 更新于 {formatDate(novel.updatedAt)}
                          </p>
                        </button>
                        <div className="flex shrink-0 gap-2">
                          <button
                            className={primaryButtonClass}
                            type="button"
                            onClick={() => onConvertNovel(novel)}
                          >
                            <IconWand className="size-4" />
                            <strong>转换</strong>
                          </button>
                          <button
                            className={secondaryButtonClass}
                            type="button"
                            onClick={() => openEditPanel(novel)}
                          >
                            <IconEdit className="size-4" />
                            <strong>编辑</strong>
                          </button>
                          <button
                            className={dangerButtonClass}
                            type="button"
                            onClick={() => setDeleteTarget(novel)}
                          >
                            <IconTrash className="size-4" />
                            <strong>删除</strong>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md border bg-background p-8 text-center">
                <strong className="text-sm text-foreground">还没有保存的小说</strong>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  可以在创作中心保存当前小说，也可以在这里新建一部小说草稿。
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          {panelMode === "empty" ? <NovelEmptyPanel /> : null}
          {panelMode === "view" && selectedNovel ? (
            <NovelDetailPanel
              novel={selectedNovel}
              onClose={openEmptyPanel}
              onEdit={() => openEditPanel(selectedNovel)}
            />
          ) : null}
          {panelMode === "new" ? (
            <NovelEditor
              key="new"
              mode="new"
              novel={null}
              onBack={openEmptyPanel}
              onClose={openEmptyPanel}
              onSaved={handleSaved}
            />
          ) : null}
          {panelMode === "edit" && selectedNovel ? (
            <NovelEditor
              key={selectedNovel.id}
              mode="edit"
              novel={selectedNovel}
              onBack={() => openViewPanel(selectedNovel)}
              onClose={openEmptyPanel}
              onSaved={handleSaved}
            />
          ) : null}
          {(panelMode === "view" || panelMode === "edit") && !selectedNovel ? (
            <NovelEmptyPanel />
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function NovelEmptyPanel() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="max-w-xs text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
          <IconBooks className="size-5" />
        </div>
        <strong className="mt-4 block text-sm text-foreground">选择一部小说</strong>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          左侧选择小说后，这里会显示详情，也可以新建或编辑小说。
        </p>
      </div>
    </div>
  );
}

function NovelDetailPanel({
  novel,
  onClose,
  onEdit,
}: {
  novel: StoredNovel;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleChapterExpanded = (id: string) => {
    setExpandedChapterIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-4 md:px-5">
        <div className="min-w-0">
          <strong className="block truncate text-lg text-foreground">
            {novel.title}
          </strong>
          <p className="mt-1 text-xs text-muted-foreground">
            {novel.chapters.length} 章 · 更新于 {formatDate(novel.updatedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <button className={secondaryButtonClass} type="button" onClick={onEdit}>
            <IconEdit className="size-4" />
            <strong>编辑</strong>
          </button>
          <button className={secondaryButtonClass} type="button" onClick={onClose}>
            <IconX className="size-4" />
            <strong>关闭</strong>
          </button>
        </div>
      </div>
      <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
        <div className="grid gap-3">
          {novel.chapters.map((chapter, index) => {
            const expanded = expandedChapterIds.has(chapter.id);
            const ToggleIcon = expanded ? IconChevronUp : IconChevronDown;

            return (
              <article key={chapter.id} className="rounded-lg border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <strong className="min-w-0 truncate text-sm text-foreground">
                    第 {index + 1} 章 · {chapter.title}
                  </strong>
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={() => toggleChapterExpanded(chapter.id)}
                  >
                    <ToggleIcon className="size-4" />
                    <strong>{expanded ? "收起" : "展开"}</strong>
                  </button>
                </div>
                <p
                  className={cn(
                    "mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground",
                    !expanded && "line-clamp-3",
                  )}
                >
                  {chapter.content}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </>
  );
}

function NovelEditor({
  mode,
  novel,
  onBack,
  onClose,
  onSaved,
}: {
  mode: "new" | "edit";
  novel: StoredNovel | null;
  onBack: () => void;
  onClose: () => void;
  onSaved: (novel: StoredNovel) => void;
}) {
  const [title, setTitle] = useState(novel?.title ?? "");
  const [titleError, setTitleError] = useState("");
  const [chapters, setChapters] = useState<NovelChapterDraft[]>(
    novel ? toDraftChapters(novel.chapters) : createInitialChapters(),
  );
  const [errors, setErrors] = useState<Record<string, ChapterError>>({});
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [saveDialog, setSaveDialog] = useState<"confirm" | "conflict" | null>(
    null,
  );
  const canAddChapter = chapters.length < MAX_CHAPTERS;
  const lockedCount = chapters.filter((chapter) => chapter.locked).length;

  const validateForSave = () => {
    const titleMissing = !title.trim();
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

    setTitleError(titleMissing ? "作品标题不能为空" : "");
    setErrors(nextErrors);

    if (titleMissing || Object.keys(nextErrors).length > 0) {
      setNotice({
        tone: "error",
        text: "保存前请补全作品标题、每个章节的标题和内容。",
      });
      return false;
    }

    if (findNovelTitleConflict(title, novel?.id)) {
      setSaveDialog("conflict");
      return false;
    }

    return true;
  };

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
    setNotice(null);
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
        setNotice({
          tone: "error",
          text: "章节需要填写标题和内容后才能锁定。",
        });
        return;
      }
    }

    setErrors((current) => ({ ...current, [id]: {} }));
    setNotice(null);
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
    setNotice(null);
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
    setNotice(null);
  };

  const requestSave = () => {
    if (!validateForSave()) {
      return;
    }

    setSaveDialog("confirm");
  };

  const confirmSave = () => {
    const payload = {
      title,
      chapters: chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title.trim(),
        content: chapter.content.trim(),
        locked: chapter.locked,
      })),
    };
    const savedNovel =
      mode === "edit" && novel
        ? updateStoredNovel(novel.id, payload)
        : createStoredNovel(payload);

    if (savedNovel) {
      onSaved(savedNovel);
    }

    setSaveDialog(null);
  };

  return (
    <>
      {saveDialog === "confirm" ? (
        <ConfirmDialog
          cancelLabel="取消"
          confirmLabel="确认"
          message="您确定要保存这篇小说吗？"
          title="保存小说"
          onCancel={() => setSaveDialog(null)}
          onConfirm={confirmSave}
        />
      ) : null}
      {saveDialog === "conflict" ? (
        <ConfirmDialog
          message="已存在同名小说，请修改标题后再保存。"
          tone="danger"
          title="无法保存"
          onCancel={() => setSaveDialog(null)}
        />
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b px-4 py-4 md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary shadow-sm">
                <IconBooks className="size-5" />
              </div>
              <div>
                <strong className="text-lg leading-6 text-foreground md:text-xl">
                  {mode === "edit" ? "编辑小说" : "新建小说"}
                </strong>
                <p className="mt-1 text-xs text-muted-foreground">
                  至少 {MIN_CHAPTERS} 章，最多 {MAX_CHAPTERS} 章
                </p>
              </div>
            </div>
            <button className={secondaryButtonClass} type="button" onClick={onClose}>
              <IconX className="size-4" />
              <strong>关闭</strong>
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-start">
            <label
              className="mt-2.5 text-sm font-medium text-muted-foreground"
              htmlFor="novel-editor-title"
            >
              <strong>标题</strong>
            </label>
            <div>
              <input
                id="novel-editor-title"
                aria-invalid={Boolean(titleError)}
                className={cn(fieldClass, titleError && errorFieldClass)}
                maxLength={TITLE_LIMIT}
                placeholder="输入作品标题"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);

                  if (event.target.value.trim()) {
                    setTitleError("");
                  }

                  setNotice(null);
                }}
              />
              {titleError ? (
                <span className="mt-1 block text-xs font-medium text-red-500">
                  {titleError}
                </span>
              ) : null}
            </div>
            <span className="rounded-md border bg-secondary px-2.5 py-2 text-xs font-medium text-secondary-foreground">
              {chapters.length}/{MAX_CHAPTERS} 章
            </span>
            <span className="rounded-md border bg-secondary px-2.5 py-2 text-xs font-medium text-secondary-foreground">
              已锁定 {lockedCount}
            </span>
          </div>
        </div>

        <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
          <div className="grid gap-3">
            {chapters.map((chapter, index) => (
              <NovelChapterCard
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
                !canAddChapter &&
                  "cursor-not-allowed opacity-50 hover:border-border hover:bg-background hover:text-muted-foreground",
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
              {notice ? (
                <p
                  className={cn(
                    "text-xs font-medium",
                    notice.tone === "error" ? "text-red-500" : "text-primary",
                  )}
                >
                  {notice.text}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  标题最多 {TITLE_LIMIT} 字，内容最多 {CONTENT_LIMIT} 字。
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button className={secondaryButtonClass} type="button" onClick={onBack}>
                <IconArrowLeft className="size-4" />
                <strong>返回</strong>
              </button>
              <button className={primaryButtonClass} type="button" onClick={requestSave}>
                <IconDeviceFloppy className="size-4" />
                <strong>保存</strong>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function NovelChapterCard({
  canDelete,
  chapter,
  error,
  index,
  onChange,
  onDelete,
  onToggleLock,
}: {
  canDelete: boolean;
  chapter: NovelChapterDraft;
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
        chapter.locked && "border-warning/25 bg-warning/5",
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
            className={lockButtonClass}
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
            onChange={(event) => onChange(chapter.id, "title", event.target.value)}
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
            placeholder="输入章节正文"
            readOnly={chapter.locked}
            value={chapter.content}
            onChange={(event) => onChange(chapter.id, "content", event.target.value)}
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

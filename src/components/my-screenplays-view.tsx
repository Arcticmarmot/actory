"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  normalizeScreenplayType,
  ScreenplayOutputPanel,
  type BlockDraft,
  type CharacterDraft,
  type HeadingDraft,
  type ScreenplayDraft,
  type ScriptStyleValue,
} from "@/components/workspace-dashboard";
import { cn } from "@/lib/cn";
import {
  deleteStoredScreenplay,
  findScreenplayTitleConflict,
  getScreenplayStorageEventName,
  parseScreenplayStorageSnapshot,
  readScreenplayStorageSnapshot,
  type StoredScreenplay,
  updateStoredScreenplay,
} from "@/lib/screenplay-storage";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconEdit,
  IconMovie,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { useMemo, useState, useSyncExternalStore } from "react";

type RightPanelMode = "empty" | "view" | "edit";

type FormNotice = {
  tone: "error" | "success";
  text: string;
};

const screenplayStyleLabels: Record<ScriptStyleValue, string> = {
  standard_film: "标准影视",
  commercial_short_drama: "商业短剧",
  fantasy_animation: "奇幻动画",
  stage_play: "舞台话剧",
};

const secondaryButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-card px-3.5 text-xs font-bold text-foreground shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const primaryButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary/15 bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/10 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const dangerButtonClass =
  "inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-card px-3.5 text-xs font-bold text-red-500 shadow-sm transition hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40";

const footerActionButtonClass = "min-w-[92px]";

const titleFieldClass =
  "h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-ring";

const subscribeToScreenplayStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener(getScreenplayStorageEventName(), callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(getScreenplayStorageEventName(), callback);
  };
};

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

const getScreenplayStyleLabel = (value: string) =>
  screenplayStyleLabels[normalizeScreenplayType(value)] ?? value;

const toScreenplayDraft = (screenplay: StoredScreenplay): ScreenplayDraft => ({
  title: screenplay.title,
  screenplayType: normalizeScreenplayType(screenplay.screenplayType),
  characters: screenplay.characters,
  scenes: screenplay.scenes,
});

export function MyScreenplaysView({
  targetScreenplayId,
}: {
  targetScreenplayId?: string | null;
}) {
  const [panelMode, setPanelMode] = useState<RightPanelMode>(
    targetScreenplayId ? "view" : "empty",
  );
  const [selectedScreenplayId, setSelectedScreenplayId] = useState<string | null>(
    targetScreenplayId ?? null,
  );
  const [deleteTarget, setDeleteTarget] = useState<StoredScreenplay | null>(null);
  const screenplayStorageSnapshot = useSyncExternalStore(
    subscribeToScreenplayStorage,
    readScreenplayStorageSnapshot,
    () => "[]",
  );
  const screenplays = useMemo(
    () => parseScreenplayStorageSnapshot(screenplayStorageSnapshot),
    [screenplayStorageSnapshot],
  );
  const sortedScreenplays = useMemo(
    () =>
      [...screenplays].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      ),
    [screenplays],
  );
  const selectedScreenplay =
    sortedScreenplays.find((screenplay) => screenplay.id === selectedScreenplayId) ??
    null;

  const openEmptyPanel = () => {
    setPanelMode("empty");
    setSelectedScreenplayId(null);
  };

  const openViewPanel = (screenplay: StoredScreenplay) => {
    setSelectedScreenplayId(screenplay.id);
    setPanelMode("view");
  };

  const openEditPanel = (screenplay: StoredScreenplay) => {
    setSelectedScreenplayId(screenplay.id);
    setPanelMode("edit");
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) {
      return;
    }

    deleteStoredScreenplay(deleteTarget.id);

    if (deleteTarget.id === selectedScreenplayId) {
      openEmptyPanel();
    }

    setDeleteTarget(null);
  };

  const handleSaved = (screenplay: StoredScreenplay) => {
    setSelectedScreenplayId(screenplay.id);
    setPanelMode("view");
  };

  return (
    <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 md:px-6">
      {deleteTarget ? (
        <ConfirmDialog
          cancelLabel="取消"
          confirmLabel="删除"
          message={`确认删除剧本《${deleteTarget.title}》吗？`}
          title="删除剧本"
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
                <IconMovie className="size-5" />
              </div>
              <div>
                <strong className="text-lg leading-6 text-foreground md:text-xl">
                  我的剧本
                </strong>
                <p className="mt-1 text-xs text-muted-foreground">
                  已保存 {sortedScreenplays.length} 个剧本草稿
                </p>
              </div>
            </div>
          </div>

          <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
            {sortedScreenplays.length > 0 ? (
              <div className="grid gap-3">
                {sortedScreenplays.map((screenplay) => {
                  const active = selectedScreenplayId === screenplay.id;

                  return (
                    <article
                      key={screenplay.id}
                      className={cn(
                        "rounded-lg border bg-background p-4 shadow-sm transition",
                        active && "border-primary/35 bg-accent/50",
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <button
                          className="min-w-0 flex-1 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          type="button"
                          onClick={() => openViewPanel(screenplay)}
                        >
                          <strong className="block truncate text-base text-foreground">
                            {screenplay.title}
                          </strong>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {getScreenplayStyleLabel(screenplay.screenplayType)} ·{" "}
                            {screenplay.scenes.length} 场 · 更新于{" "}
                            {formatDate(screenplay.updatedAt)}
                          </p>
                        </button>
                        <div className="flex shrink-0 gap-2">
                          <button
                            className={secondaryButtonClass}
                            type="button"
                            onClick={() => openEditPanel(screenplay)}
                          >
                            <IconEdit className="size-4" />
                            <strong>编辑</strong>
                          </button>
                          <button
                            className={dangerButtonClass}
                            type="button"
                            onClick={() => setDeleteTarget(screenplay)}
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
                <strong className="text-sm text-foreground">还没有保存的剧本</strong>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  在创作中心转换出剧本后，点击右侧保存即可加入这里。
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          {panelMode === "empty" ? <ScreenplayEmptyPanel /> : null}
          {panelMode === "view" && selectedScreenplay ? (
            <ScreenplayDetailPanel
              screenplay={selectedScreenplay}
              onClose={openEmptyPanel}
              onEdit={() => openEditPanel(selectedScreenplay)}
            />
          ) : null}
          {panelMode === "edit" && selectedScreenplay ? (
            <ScreenplayEditor
              key={selectedScreenplay.id}
              screenplay={selectedScreenplay}
              onBack={() => openViewPanel(selectedScreenplay)}
              onClose={openEmptyPanel}
              onSaved={handleSaved}
            />
          ) : null}
          {(panelMode === "view" || panelMode === "edit") && !selectedScreenplay ? (
            <ScreenplayEmptyPanel />
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function ScreenplayEmptyPanel() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="max-w-xs text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
          <IconMovie className="size-5" />
        </div>
        <strong className="mt-4 block text-sm text-foreground">选择一个剧本</strong>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          左侧选择剧本后，这里会显示详情，也可以继续编辑剧本草稿。
        </p>
      </div>
    </div>
  );
}

function ScreenplayDetailPanel({
  onClose,
  onEdit,
  screenplay,
}: {
  onClose: () => void;
  onEdit: () => void;
  screenplay: StoredScreenplay;
}) {
  const draft = toScreenplayDraft(screenplay);

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-4 md:px-5">
        <div className="min-w-0">
          <strong className="block truncate text-lg text-foreground">
            {screenplay.title}
          </strong>
          <p className="mt-1 text-xs text-muted-foreground">
            {getScreenplayStyleLabel(screenplay.screenplayType)} ·{" "}
            {screenplay.scenes.length} 场 · 更新于 {formatDate(screenplay.updatedAt)}
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
        <ScreenplayOutputPanel
          draft={draft}
          locked
          onBlockChange={() => undefined}
          onCharacterChange={() => undefined}
          onHeadingChange={() => undefined}
          onSceneChange={() => undefined}
        />
      </div>
    </>
  );
}

function ScreenplayEditor({
  onBack,
  onClose,
  onSaved,
  screenplay,
}: {
  onBack: () => void;
  onClose: () => void;
  onSaved: (screenplay: StoredScreenplay) => void;
  screenplay: StoredScreenplay;
}) {
  const [draft, setDraft] = useState<ScreenplayDraft>(() =>
    toScreenplayDraft(screenplay),
  );
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [saveDialog, setSaveDialog] = useState<"confirm" | "conflict" | null>(
    null,
  );

  const updateCharacter = (
    id: string,
    field: Exclude<keyof CharacterDraft, "id">,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      characters: current.characters.map((character) =>
        character.id === id ? { ...character, [field]: value } : character,
      ),
    }));
    setNotice(null);
  };

  const updateScene = (
    id: string,
    field: "number" | "sourceChapter",
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === id ? { ...scene, [field]: value } : scene,
      ),
    }));
    setNotice(null);
  };

  const updateSceneHeading = (
    id: string,
    field: keyof HeadingDraft,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === id
          ? { ...scene, heading: { ...scene.heading, [field]: value } }
          : scene,
      ),
    }));
    setNotice(null);
  };

  const updateBlock = (
    sceneId: string,
    blockId: string,
    field: Exclude<keyof BlockDraft, "id">,
    value: string,
  ) => {
    setDraft((current) => ({
      ...current,
      scenes: current.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              blocks: scene.blocks.map((block) =>
                block.id === blockId ? { ...block, [field]: value } : block,
              ),
            }
          : scene,
      ),
    }));
    setNotice(null);
  };

  const requestSave = () => {
    if (!draft.title.trim()) {
      setNotice({
        tone: "error",
        text: "剧本标题不能为空。",
      });
      return;
    }

    if (findScreenplayTitleConflict(draft.title, screenplay.id)) {
      setSaveDialog("conflict");
      return;
    }

    setSaveDialog("confirm");
  };

  const confirmSave = () => {
    const savedScreenplay = updateStoredScreenplay(screenplay.id, {
      title: draft.title,
      screenplayType: draft.screenplayType,
      characters: draft.characters,
      scenes: draft.scenes,
    });

    if (savedScreenplay) {
      onSaved(savedScreenplay);
    }

    setNotice({
      tone: "success",
      text: "剧本已保存。",
    });
    setSaveDialog(null);
  };

  return (
    <>
      {saveDialog === "confirm" ? (
        <ConfirmDialog
          cancelLabel="取消"
          confirmLabel="确认"
          message="您确定要保存这个剧本吗？"
          title="保存剧本"
          onCancel={() => setSaveDialog(null)}
          onConfirm={confirmSave}
        />
      ) : null}
      {saveDialog === "conflict" ? (
        <ConfirmDialog
          message="已存在同名剧本，请修改标题后再保存。"
          tone="danger"
          title="无法保存"
          onCancel={() => setSaveDialog(null)}
        />
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-4 md:px-5">
          <div className="min-w-[220px] flex-1">
            <label className="flex items-center gap-3">
              <span className="shrink-0 text-sm font-medium text-muted-foreground">
                <strong>标题</strong>
              </span>
              <input
                className={titleFieldClass}
                maxLength={80}
                value={draft.title}
                onChange={(event) => {
                  setDraft((current) => ({ ...current, title: event.target.value }));
                  setNotice(null);
                }}
              />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              剧本风格：{getScreenplayStyleLabel(draft.screenplayType)}
            </p>
          </div>
          <button className={secondaryButtonClass} type="button" onClick={onClose}>
            <IconX className="size-4" />
            <strong>关闭</strong>
          </button>
        </div>

        <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
          <ScreenplayOutputPanel
            draft={draft}
            locked={false}
            onBlockChange={updateBlock}
            onCharacterChange={updateCharacter}
            onHeadingChange={updateSceneHeading}
            onSceneChange={updateScene}
          />
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
                  剧本风格：{getScreenplayStyleLabel(draft.screenplayType)}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className={cn(secondaryButtonClass, footerActionButtonClass)}
                type="button"
                onClick={onBack}
              >
                <IconArrowLeft className="size-4" />
                <strong>返回</strong>
              </button>
              <button
                className={cn(primaryButtonClass, footerActionButtonClass)}
                type="button"
                onClick={requestSave}
              >
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

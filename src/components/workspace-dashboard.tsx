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

type ConvertResponseBody = {
  error?: unknown;
  screenplayYaml?: unknown;
};

type CharacterDraft = {
  id: string;
  name: string;
  role: string;
  description: string;
};

type HeadingDraft = {
  space: string;
  location: string;
  time: string;
};

type BlockDraft = {
  id: string;
  type: string;
  text: string;
  character: string;
  parenthetical: string;
  line: string;
};

type SceneDraft = {
  id: string;
  number: string;
  sourceChapter: string;
  heading: HeadingDraft;
  blocks: BlockDraft[];
};

type ScreenplayDraft = {
  title: string;
  screenplayType: ScriptStyleValue;
  characters: CharacterDraft[];
  scenes: SceneDraft[];
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

const roleLabels: Record<string, string> = {
  protagonist: "主角",
  supporting: "配角",
  antagonist: "反派",
};

const headingSpaceLabels: Record<string, string> = {
  exterior: "外景",
  interior: "内景",
};

const blockTypeLabels: Record<string, string> = {
  action: "动作",
  dialogue: "对白",
};

const stripYamlValue = (value: string) => {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

const getYamlPair = (line: string) => {
  const separatorIndex = line.indexOf(":");

  if (separatorIndex < 0) {
    return null;
  }

  return {
    key: line.slice(0, separatorIndex).trim(),
    value: stripYamlValue(line.slice(separatorIndex + 1)),
  };
};

const findTopLevelYamlValue = (yaml: string, key: string) => {
  const line = yaml
    .split("\n")
    .find((item) => item.startsWith(`${key}:`));

  if (!line) {
    return "";
  }

  return stripYamlValue(line.slice(line.indexOf(":") + 1));
};

const normalizeScreenplayType = (value: string): ScriptStyleValue => {
  if (value === "short_drama" || value === "stage_play") {
    return value;
  }

  return "film";
};

const parseScreenplayYaml = (yaml: string): ScreenplayDraft => {
  const lines = yaml.split("\n");
  const characters: CharacterDraft[] = [];
  const scenes: SceneDraft[] = [];
  let currentCharacter: CharacterDraft | null = null;
  let currentScene: SceneDraft | null = null;
  let currentBlock: BlockDraft | null = null;
  let section: "characters" | "scenes" | null = null;
  let inHeading = false;
  let inBlocks = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    if (trimmed === "characters:") {
      section = "characters";
      currentScene = null;
      currentBlock = null;
      inHeading = false;
      inBlocks = false;
      continue;
    }

    if (trimmed === "scenes:") {
      section = "scenes";
      currentCharacter = null;
      currentBlock = null;
      inHeading = false;
      inBlocks = false;
      continue;
    }

    if (section === "characters") {
      if (rawLine.startsWith("  - id:")) {
        currentCharacter = {
          id: stripYamlValue(rawLine.slice(rawLine.indexOf(":") + 1)),
          name: "",
          role: "",
          description: "",
        };
        characters.push(currentCharacter);
        continue;
      }

      if (currentCharacter && rawLine.startsWith("    ")) {
        const pair = getYamlPair(trimmed);

        if (!pair) {
          continue;
        }

        if (pair.key === "name") {
          currentCharacter.name = pair.value;
        } else if (pair.key === "role") {
          currentCharacter.role = roleLabels[pair.value] ?? pair.value;
        } else if (pair.key === "description") {
          currentCharacter.description = pair.value;
        }
      }
    }

    if (section === "scenes") {
      if (rawLine.startsWith("  - id:")) {
        currentScene = {
          id: stripYamlValue(rawLine.slice(rawLine.indexOf(":") + 1)),
          number: "",
          sourceChapter: "",
          heading: {
            space: "",
            location: "",
            time: "",
          },
          blocks: [],
        };
        scenes.push(currentScene);
        currentBlock = null;
        inHeading = false;
        inBlocks = false;
        continue;
      }

      if (!currentScene) {
        continue;
      }

      if (trimmed === "heading:") {
        inHeading = true;
        inBlocks = false;
        continue;
      }

      if (trimmed === "blocks:") {
        inHeading = false;
        inBlocks = true;
        continue;
      }

      if (inBlocks && rawLine.startsWith("      - type:")) {
        currentBlock = {
          id: `${currentScene.id}_block_${currentScene.blocks.length + 1}`,
          type: blockTypeLabels[
            stripYamlValue(rawLine.slice(rawLine.indexOf(":") + 1))
          ] ?? stripYamlValue(rawLine.slice(rawLine.indexOf(":") + 1)),
          text: "",
          character: "",
          parenthetical: "",
          line: "",
        };
        currentScene.blocks.push(currentBlock);
        continue;
      }

      if (inBlocks && currentBlock && rawLine.startsWith("        ")) {
        const pair = getYamlPair(trimmed);

        if (!pair) {
          continue;
        }

        if (pair.key === "text") {
          currentBlock.text = pair.value;
        } else if (pair.key === "character") {
          currentBlock.character = pair.value;
        } else if (pair.key === "parenthetical") {
          currentBlock.parenthetical = pair.value;
        } else if (pair.key === "line") {
          currentBlock.line = pair.value;
        }
        continue;
      }

      if (inHeading && rawLine.startsWith("      ")) {
        const pair = getYamlPair(trimmed);

        if (!pair) {
          continue;
        }

        if (pair.key === "space") {
          currentScene.heading.space = headingSpaceLabels[pair.value] ?? pair.value;
        } else if (pair.key === "location") {
          currentScene.heading.location = pair.value;
        } else if (pair.key === "time") {
          currentScene.heading.time = pair.value;
        }
        continue;
      }

      if (rawLine.startsWith("    ")) {
        const pair = getYamlPair(trimmed);

        if (!pair) {
          continue;
        }

        if (pair.key === "number") {
          currentScene.number = pair.value;
        } else if (pair.key === "source_chapter") {
          currentScene.sourceChapter = pair.value;
        }
      }
    }
  }

  return {
    title: findTopLevelYamlValue(yaml, "title"),
    screenplayType: normalizeScreenplayType(
      findTopLevelYamlValue(yaml, "screenplay_type"),
    ),
    characters,
    scenes,
  };
};

export function WorkspaceDashboard() {
  const [chapters, setChapters] = useState<ChapterDraft[]>(initialChapters);
  const [errors, setErrors] = useState<Record<string, ChapterError>>({});
  const [formNotice, setFormNotice] = useState<FormNotice | null>(null);
  const [screenplayDraft, setScreenplayDraft] = useState<ScreenplayDraft | null>(
    null,
  );
  const [outputLocked, setOutputLocked] = useState(true);
  const [outputNotice, setOutputNotice] = useState<FormNotice | null>(null);
  const [isConverting, setIsConverting] = useState(false);
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
    setScreenplayDraft(null);
    setOutputNotice(null);
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
    setScreenplayDraft(null);
    setOutputNotice(null);
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
    setScreenplayDraft(null);
    setOutputNotice(null);
  };

  const updateScreenplayField = (
    field: "title" | "screenplayType",
    value: string,
  ) => {
    if (outputLocked) {
      return;
    }

    setScreenplayDraft((current) =>
      current
        ? {
            ...current,
            [field]:
              field === "screenplayType"
                ? normalizeScreenplayType(value)
                : value,
          }
        : current,
    );
    setOutputNotice(null);
  };

  const updateCharacter = (
    id: string,
    field: Exclude<keyof CharacterDraft, "id">,
    value: string,
  ) => {
    if (outputLocked) {
      return;
    }

    setScreenplayDraft((current) =>
      current
        ? {
            ...current,
            characters: current.characters.map((character) =>
              character.id === id ? { ...character, [field]: value } : character,
            ),
          }
        : current,
    );
    setOutputNotice(null);
  };

  const updateScene = (
    id: string,
    field: "number" | "sourceChapter",
    value: string,
  ) => {
    if (outputLocked) {
      return;
    }

    setScreenplayDraft((current) =>
      current
        ? {
            ...current,
            scenes: current.scenes.map((scene) =>
              scene.id === id ? { ...scene, [field]: value } : scene,
            ),
          }
        : current,
    );
    setOutputNotice(null);
  };

  const updateSceneHeading = (
    id: string,
    field: keyof HeadingDraft,
    value: string,
  ) => {
    if (outputLocked) {
      return;
    }

    setScreenplayDraft((current) =>
      current
        ? {
            ...current,
            scenes: current.scenes.map((scene) =>
              scene.id === id
                ? { ...scene, heading: { ...scene.heading, [field]: value } }
                : scene,
            ),
          }
        : current,
    );
    setOutputNotice(null);
  };

  const updateBlock = (
    sceneId: string,
    blockId: string,
    field: Exclude<keyof BlockDraft, "id">,
    value: string,
  ) => {
    if (outputLocked) {
      return;
    }

    setScreenplayDraft((current) =>
      current
        ? {
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
          }
        : current,
    );
    setOutputNotice(null);
  };

  const validateChaptersForAction = (actionName: "保存" | "转换") => {
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
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateChaptersForAction("保存")) {
      return;
    }

    setFormNotice({
      tone: "success",
      text: "保存检查通过。",
    });
  };

  const handleConvert = async () => {
    if (!validateChaptersForAction("转换")) {
      return;
    }

    setIsConverting(true);
    setFormNotice(null);

    try {
      const response = await fetch("/api/convert", {
        body: JSON.stringify({
          title: chapters[0]?.title.trim() ?? "",
          screenplayType: selectedStyle,
          chapters: chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title.trim(),
            content: chapter.content.trim(),
          })),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const responseBody = (await response.json()) as ConvertResponseBody;

      if (!response.ok) {
        setScreenplayDraft(null);
        setOutputNotice(null);
        setFormNotice({
          tone: "error",
          text:
            typeof responseBody.error === "string"
              ? responseBody.error
              : "转换请求失败。",
        });
        return;
      }

      if (typeof responseBody.screenplayYaml !== "string") {
        setScreenplayDraft(null);
        setOutputNotice(null);
        setFormNotice({
          tone: "error",
          text: "转换响应缺少 screenplayYaml。",
        });
        return;
      }

      setScreenplayDraft(parseScreenplayYaml(responseBody.screenplayYaml));
      setOutputLocked(true);
      setOutputNotice(null);
      setFormNotice({
        tone: "success",
        text: "转换完成，mock 剧本已输出。",
      });
    } catch {
      setScreenplayDraft(null);
      setOutputNotice(null);
      setFormNotice({
        tone: "error",
        text: "转换请求失败。",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleOutputSave = () => {
    if (!screenplayDraft) {
      setOutputNotice({
        tone: "error",
        text: "请先转换生成剧本内容。",
      });
      return;
    }

    setOutputNotice({
      tone: "success",
      text: "剧本输出已通过本地检查。",
    });
  };

  const toggleOutputLock = () => {
    if (!screenplayDraft) {
      setOutputNotice({
        tone: "error",
        text: "请先转换生成剧本内容。",
      });
      return;
    }

    setOutputLocked((current) => !current);
    setOutputNotice(null);
  };

  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <div className="grid h-full min-h-0 gap-4 px-4 py-4 md:px-6 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          <input name="screenplayType" type="hidden" value={selectedStyle} />
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
                        onClick={() => {
                          setSelectedStyle(option.value);
                          setScreenplayDraft(null);
                          setOutputNotice(null);
                        }}
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
                  onClick={handleSave}
                >
                  <IconDeviceFloppy className="size-4" />
                  <strong>保存</strong>
                </button>
                <button
                  className={primaryButtonClass}
                  disabled={isConverting}
                  type="button"
                  onClick={handleConvert}
                >
                  <IconWand className="size-4" />
                  <strong>{isConverting ? "转换中" : "转换"}</strong>
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="shrink-0 border-b px-4 py-4 md:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-primary shadow-sm">
                  <IconMovie className="size-5" />
                </div>
                <strong className="text-lg leading-6 text-foreground md:text-xl">
                  剧本样式输出
                </strong>
              </div>
              <span className="rounded-md border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {screenplayDraft ? (outputLocked ? "已锁定" : "编辑中") : "等待转换"}
              </span>
            </div>
          </div>

          <div className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
            {screenplayDraft ? (
              <ScreenplayOutputPanel
                draft={screenplayDraft}
                locked={outputLocked}
                onBlockChange={updateBlock}
                onCharacterChange={updateCharacter}
                onFieldChange={updateScreenplayField}
                onHeadingChange={updateSceneHeading}
                onSceneChange={updateScene}
              />
            ) : (
              <div className="rounded-md border bg-background p-4">
                <strong className="text-sm text-foreground">等待剧本输出</strong>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  左侧小说章节填写完成后点击转换，这里会展示中文化后的剧本标题、风格、人物和场景内容。
                </p>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t bg-card/90 px-4 py-3 backdrop-blur md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  输出默认锁定，解锁后除 ID 外都可以编辑。
                </p>
                {outputNotice ? (
                  <p
                    className={cn(
                      "mt-1 text-xs font-medium",
                      outputNotice.tone === "error" ? "text-red-500" : "text-primary",
                    )}
                  >
                    {outputNotice.text}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <button
                  className={secondaryButtonClass}
                  type="button"
                  onClick={handleOutputSave}
                >
                  <IconDeviceFloppy className="size-4" />
                  <strong>保存</strong>
                </button>
                <button
                  className={secondaryButtonClass}
                  type="button"
                  onClick={toggleOutputLock}
                >
                  {outputLocked ? (
                    <IconLock className="size-4" />
                  ) : (
                    <IconLockOpen className="size-4" />
                  )}
                  <strong>{outputLocked ? "解锁" : "锁定"}</strong>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ScreenplayOutputPanel({
  draft,
  locked,
  onBlockChange,
  onCharacterChange,
  onFieldChange,
  onHeadingChange,
  onSceneChange,
}: {
  draft: ScreenplayDraft;
  locked: boolean;
  onBlockChange: (
    sceneId: string,
    blockId: string,
    field: Exclude<keyof BlockDraft, "id">,
    value: string,
  ) => void;
  onCharacterChange: (
    id: string,
    field: Exclude<keyof CharacterDraft, "id">,
    value: string,
  ) => void;
  onFieldChange: (field: "title" | "screenplayType", value: string) => void;
  onHeadingChange: (id: string, field: keyof HeadingDraft, value: string) => void;
  onSceneChange: (
    id: string,
    field: "number" | "sourceChapter",
    value: string,
  ) => void;
}) {
  const characterNameById = new Map(
    draft.characters.map((character) => [character.id, character.name]),
  );

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-background p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 sm:col-span-2">
            <span className="text-sm font-medium">标题</span>
            <input
              className={fieldClass}
              readOnly={locked}
              value={draft.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">剧本风格</span>
            <select
              className={cn(
                fieldClass,
                "disabled:cursor-default disabled:bg-muted/60 disabled:text-muted-foreground",
              )}
              disabled={locked}
              value={draft.screenplayType}
              onChange={(event) =>
                onFieldChange("screenplayType", event.target.value)
              }
            >
              {styleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <details className="rounded-md border bg-background" open>
        <summary className="cursor-pointer border-b px-4 py-3 text-sm font-bold text-foreground">
          人物列表
        </summary>
        <div className="grid gap-3 p-4">
          {draft.characters.map((character) => (
            <div key={character.id} className="rounded-md border bg-card p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-xs font-medium text-muted-foreground">ID</span>
                  <input className={fieldClass} readOnly value={character.id} />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-medium text-muted-foreground">姓名</span>
                  <input
                    className={fieldClass}
                    readOnly={locked}
                    value={character.name}
                    onChange={(event) =>
                      onCharacterChange(character.id, "name", event.target.value)
                    }
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-medium text-muted-foreground">角色定位</span>
                  <input
                    className={fieldClass}
                    readOnly={locked}
                    value={character.role}
                    onChange={(event) =>
                      onCharacterChange(character.id, "role", event.target.value)
                    }
                  />
                </label>
                <label className="grid gap-2 sm:col-span-2">
                  <span className="text-xs font-medium text-muted-foreground">人物简介</span>
                  <textarea
                    className={cn(fieldClass, "subtle-scrollbar min-h-20 resize-y leading-6")}
                    readOnly={locked}
                    value={character.description}
                    onChange={(event) =>
                      onCharacterChange(
                        character.id,
                        "description",
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </details>

      <details className="rounded-md border bg-background" open>
        <summary className="cursor-pointer border-b px-4 py-3 text-sm font-bold text-foreground">
          场景列表
        </summary>
        <div className="space-y-3 p-4">
          {draft.scenes.map((scene, sceneIndex) => (
            <details
              key={scene.id}
              className="rounded-md border bg-card"
              open={sceneIndex === 0}
            >
              <summary className="cursor-pointer px-3 py-3 text-sm font-bold text-foreground">
                第 {scene.number || sceneIndex + 1} 场
                {scene.heading.location ? ` · ${scene.heading.location}` : ""}
              </summary>
              <div className="grid gap-4 border-t p-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-xs font-medium text-muted-foreground">ID</span>
                    <input className={fieldClass} readOnly value={scene.id} />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-medium text-muted-foreground">场次</span>
                    <input
                      className={fieldClass}
                      readOnly={locked}
                      value={scene.number}
                      onChange={(event) =>
                        onSceneChange(scene.id, "number", event.target.value)
                      }
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-medium text-muted-foreground">来源章节</span>
                    <input
                      className={fieldClass}
                      readOnly={locked}
                      value={scene.sourceChapter}
                      onChange={(event) =>
                        onSceneChange(scene.id, "sourceChapter", event.target.value)
                      }
                    />
                  </label>
                </div>

                <div className="grid gap-3 rounded-md border bg-background p-3 sm:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-xs font-medium text-muted-foreground">空间</span>
                    <select
                      className={cn(
                        fieldClass,
                        "disabled:cursor-default disabled:bg-muted/60 disabled:text-muted-foreground",
                      )}
                      disabled={locked}
                      value={scene.heading.space}
                      onChange={(event) =>
                        onHeadingChange(scene.id, "space", event.target.value)
                      }
                    >
                      <option value="外景">外景</option>
                      <option value="内景">内景</option>
                      {scene.heading.space &&
                      scene.heading.space !== "外景" &&
                      scene.heading.space !== "内景" ? (
                        <option value={scene.heading.space}>
                          {scene.heading.space}
                        </option>
                      ) : null}
                    </select>
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-medium text-muted-foreground">地点</span>
                    <input
                      className={fieldClass}
                      readOnly={locked}
                      value={scene.heading.location}
                      onChange={(event) =>
                        onHeadingChange(scene.id, "location", event.target.value)
                      }
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-xs font-medium text-muted-foreground">时间</span>
                    <input
                      className={fieldClass}
                      readOnly={locked}
                      value={scene.heading.time}
                      onChange={(event) =>
                        onHeadingChange(scene.id, "time", event.target.value)
                      }
                    />
                  </label>
                </div>

                <div className="grid gap-3">
                  <strong className="text-sm text-foreground">内容块</strong>
                  {scene.blocks.map((block, blockIndex) => (
                    <div key={block.id} className="rounded-md border bg-background p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="rounded-md border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                          第 {blockIndex + 1} 段
                        </span>
                        <span className="text-xs text-muted-foreground">{block.type}</span>
                      </div>
                      <div className="grid gap-3">
                        <label className="grid gap-2">
                          <span className="text-xs font-medium text-muted-foreground">类型</span>
                          <select
                            className={cn(
                              fieldClass,
                              "disabled:cursor-default disabled:bg-muted/60 disabled:text-muted-foreground",
                            )}
                            disabled={locked}
                            value={block.type}
                            onChange={(event) =>
                              onBlockChange(
                                scene.id,
                                block.id,
                                "type",
                                event.target.value,
                              )
                            }
                          >
                            <option value="动作">动作</option>
                            <option value="对白">对白</option>
                          </select>
                        </label>

                        {block.type === "对白" ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className="grid gap-2">
                              <span className="text-xs font-medium text-muted-foreground">角色</span>
                              <select
                                className={cn(
                                  fieldClass,
                                  "disabled:cursor-default disabled:bg-muted/60 disabled:text-muted-foreground",
                                )}
                                disabled={locked}
                                value={block.character}
                                onChange={(event) =>
                                  onBlockChange(
                                    scene.id,
                                    block.id,
                                    "character",
                                    event.target.value,
                                  )
                                }
                              >
                                {draft.characters.map((character) => (
                                  <option key={character.id} value={character.id}>
                                    {character.name || character.id}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="grid gap-2">
                              <span className="text-xs font-medium text-muted-foreground">语气提示</span>
                              <input
                                className={fieldClass}
                                readOnly={locked}
                                value={block.parenthetical}
                                onChange={(event) =>
                                  onBlockChange(
                                    scene.id,
                                    block.id,
                                    "parenthetical",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                            <label className="grid gap-2 sm:col-span-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                台词
                                {block.character
                                  ? ` · ${characterNameById.get(block.character) ?? ""}`
                                  : ""}
                              </span>
                              <textarea
                                className={cn(
                                  fieldClass,
                                  "subtle-scrollbar min-h-20 resize-y leading-6",
                                )}
                                readOnly={locked}
                                value={block.line}
                                onChange={(event) =>
                                  onBlockChange(
                                    scene.id,
                                    block.id,
                                    "line",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="grid gap-2">
                            <span className="text-xs font-medium text-muted-foreground">动作内容</span>
                            <textarea
                              className={cn(
                                fieldClass,
                                "subtle-scrollbar min-h-20 resize-y leading-6",
                              )}
                              readOnly={locked}
                              value={block.text}
                              onChange={(event) =>
                                onBlockChange(
                                  scene.id,
                                  block.id,
                                  "text",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      </details>
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

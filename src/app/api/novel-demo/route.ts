import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { ScreenplayType } from "@/lib/screenplay-prompt";

export const dynamic = "force-dynamic";

type NovelDemoChapter = {
  id?: string;
  title: string;
  content: string;
};

type NovelDemoPayload = {
  title: string;
  screenplayType: ScreenplayType;
  chapters: NovelDemoChapter[];
};

const allowedScreenplayTypes = new Set<ScreenplayType>([
  "standard_film",
  "commercial_short_drama",
  "fantasy_animation",
  "stage_play",
]);
const allowedDemoIds = new Set(["1", "2", "3"]);

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

const findTopLevelValue = (lines: string[], key: string) => {
  const line = lines.find((item) => item.startsWith(`${key}:`));

  if (!line) {
    return "";
  }

  return stripYamlValue(line.slice(line.indexOf(":") + 1));
};

const assignChapterValue = (
  chapter: Partial<NovelDemoChapter>,
  key: string,
  value: string,
) => {
  if (key === "id") {
    chapter.id = value;
  } else if (key === "title") {
    chapter.title = value;
  } else if (key === "content") {
    chapter.content = value;
  }
};

const toCompleteChapter = (
  chapter: Partial<NovelDemoChapter> | null,
): NovelDemoChapter | null => {
  if (!chapter?.title?.trim() || !chapter.content?.trim()) {
    return null;
  }

  return {
    id: chapter.id,
    title: chapter.title.trim(),
    content: chapter.content.trim(),
  };
};

const parseNovelDemoYaml = (yaml: string): NovelDemoPayload | null => {
  const lines = yaml.replace(/\r\n/g, "\n").split("\n");
  const title = findTopLevelValue(lines, "title");
  const screenplayType = findTopLevelValue(lines, "screenplayType");
  const chapters: NovelDemoChapter[] = [];
  let currentChapter: Partial<NovelDemoChapter> | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";

    if (line.startsWith("  - ")) {
      const completedChapter = toCompleteChapter(currentChapter);

      if (completedChapter) {
        chapters.push(completedChapter);
      }

      currentChapter = {};

      const pair = getYamlPair(line.slice(4));

      if (pair) {
        assignChapterValue(currentChapter, pair.key, pair.value);
      }

      continue;
    }

    if (!currentChapter || !line.startsWith("    ")) {
      continue;
    }

    const trimmedLine = line.trim();

    if (trimmedLine === "content: |") {
      const contentLines: string[] = [];
      index += 1;

      while (index < lines.length) {
        const contentLine = lines[index] ?? "";

        if (contentLine.startsWith("  - ")) {
          index -= 1;
          break;
        }

        if (contentLine.startsWith("      ")) {
          contentLines.push(contentLine.slice(6));
        } else if (!contentLine.trim()) {
          contentLines.push("");
        }

        index += 1;
      }

      currentChapter.content = contentLines.join("\n").trim();
      continue;
    }

    const pair = getYamlPair(trimmedLine);

    if (pair) {
      assignChapterValue(currentChapter, pair.key, pair.value);
    }
  }

  const completedChapter = toCompleteChapter(currentChapter);

  if (completedChapter) {
    chapters.push(completedChapter);
  }

  if (
    !title ||
    !allowedScreenplayTypes.has(screenplayType as ScreenplayType) ||
    chapters.length < 3
  ) {
    return null;
  }

  return {
    title,
    screenplayType: screenplayType as ScreenplayType,
    chapters,
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const demoId = searchParams.get("demo") ?? "1";

    if (!allowedDemoIds.has(demoId)) {
      return NextResponse.json(
        { error: "Unknown novel demo." },
        { status: 400 },
      );
    }

    const filePath = path.join(
      process.cwd(),
      "docs",
      "demo-novels",
      `novel-demo${demoId}.yaml`,
    );
    const yaml = await readFile(filePath, "utf8");
    const payload = parseNovelDemoYaml(yaml);

    if (!payload) {
      return NextResponse.json(
        { error: `novel-demo${demoId}.yaml format is invalid.` },
        { status: 500 },
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error(
      "Failed to load novel demo:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: "Failed to load novel demo." },
      { status: 500 },
    );
  }
}

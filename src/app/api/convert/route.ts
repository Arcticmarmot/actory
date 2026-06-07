import { NextResponse } from "next/server";
import { callLLM } from "@/lib/llm-client";
import {
  buildScreenplayPrompt,
  type ScreenplayChapterInput,
  type ScreenplayType,
} from "@/lib/screenplay-prompt";

type ConversionMode = "mock" | "llm";

type ConvertRequestBody = {
  title: string;
  screenplayType: ScreenplayType;
  chapters: ScreenplayChapterInput[];
};

const allowedScreenplayTypes = new Set<ScreenplayType>([
  "standard_film",
  "commercial_short_drama",
  "fantasy_animation",
  "stage_play",
]);

const buildMockScreenplayYaml = () => `# 剧本标题，属于作品内容，可以写入 YAML
title: "雨中的钟表店"

# 剧本类型，用于提示 AI 和前端采取不同的生成、编辑和展示策略
# 推荐值：standard_film、commercial_short_drama、fantasy_animation、stage_play
screenplay_type: "standard_film"

# 人物列表
# 人物信息独立存放，方便对白块通过 character 字段引用
characters:
  - id: "char_001"
    name: "林舟"
    role: "protagonist"
    description: "年轻的修表匠，沉默敏感，对父亲的离去始终无法释怀。"

  - id: "char_002"
    name: "沈青"
    role: "supporting"
    description: "林舟旧识，冷静克制，知道怀表背后的秘密。"

# 场景列表
# scenes 数组的顺序就是剧本的阅读顺序
scenes:
  - id: "scene_001"
    number: 1

    # 当前场景主要改编自小说第几章
    # MVP 阶段只使用单个章节编号，不使用数组
    source_chapter: 1

    # 场景头，对应剧本中的“内景 / 外景 + 地点 + 时间”
    heading:
      space: "exterior"
      location: "海边公路"
      time: "黄昏"

    # 场景内部的线性内容块
    # 动作、环境、声音、对白都按照实际发生顺序排列
    blocks:
      - type: "action"
        text: "海浪一下一下拍在黑色礁石上。远处的灯塔还没有亮，天空低得像要压到海面。"

      - type: "action"
        text: "林舟站在护栏边，手里攥着一封被雨水打湿的信。"

      - type: "action"
        text: "沈青从公路另一头走来。她没有打伞，外套被风吹得贴在身上。"

      - type: "dialogue"
        character: "char_001"
        line: "你还是来了。"

      - type: "action"
        text: "沈青停下，看着他。"

      - type: "dialogue"
        character: "char_002"
        line: "我只是想把话说完。"

      - type: "action"
        text: "林舟手里的信被雨水洇开，最后一行字变得模糊。"

  - id: "scene_002"
    number: 2
    source_chapter: 1

    heading:
      space: "interior"
      location: "老钟表店"
      time: "夜"

    blocks:
      - type: "action"
        text: "店里没有开主灯，只有柜台上一盏旧台灯亮着。墙上的钟停在不同的时间，像一群沉默的旁观者。"

      - type: "action"
        text: "林舟推门进来，雨水从他的发梢落到地板上。沈青站在柜台后，手里拿着那只旧怀表。"

      - type: "dialogue"
        character: "char_001"
        line: "你又把它拿出来了？"

      - type: "action"
        text: "沈青没有回答。她把怀表放在灯下，表盖上映出一圈昏黄的光。"

      - type: "dialogue"
        character: "char_002"
        parenthetical: "低声"
        line: "它今天走了三分钟。"

      - type: "action"
        text: "林舟愣住。他伸手去拿怀表，却在快要碰到的时候停了下来。"

      - type: "dialogue"
        character: "char_001"
        line: "不可能。它已经停了十年。"

      - type: "action"
        text: "沈青抬头看他，像是早知道他会这么说。"

      - type: "dialogue"
        character: "char_002"
        line: "有些东西不是停了，只是在等人回来。"`;

const getConversionMode = (): ConversionMode =>
  process.env.CONVERSION_MODE === "llm" ? "llm" : "mock";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validateConvertPayload = (
  payload: unknown,
): { body: ConvertRequestBody; error?: never } | { body?: never; error: string } => {
  if (!isRecord(payload)) {
    return { error: "Request body must be a JSON object." };
  }

  if (!hasText(payload.title)) {
    return { error: "title is required." };
  }

  if (
    typeof payload.screenplayType !== "string" ||
    !allowedScreenplayTypes.has(payload.screenplayType as ScreenplayType)
  ) {
    return {
      error:
        "screenplayType must be one of standard_film, commercial_short_drama, fantasy_animation, stage_play.",
    };
  }

  if (!Array.isArray(payload.chapters) || payload.chapters.length < 3) {
    return { error: "chapters must contain at least 3 chapters." };
  }

  const chapters: ScreenplayChapterInput[] = [];

  for (const [index, chapter] of payload.chapters.entries()) {
    if (!isRecord(chapter)) {
      return { error: `chapters[${index}] must be a JSON object.` };
    }

    if (chapter.id !== undefined && typeof chapter.id !== "string") {
      return { error: `chapters[${index}].id must be a string if provided.` };
    }

    if (!hasText(chapter.title)) {
      return { error: `chapters[${index}].title is required.` };
    }

    if (!hasText(chapter.content)) {
      return { error: `chapters[${index}].content is required.` };
    }

    chapters.push({
      id: chapter.id,
      title: chapter.title,
      content: chapter.content,
    });
  }

  return {
    body: {
      title: payload.title,
      screenplayType: payload.screenplayType as ScreenplayType,
      chapters,
    },
  };
};

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const validation = validateConvertPayload(payload);

  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const mode = getConversionMode();

  if (mode === "mock") {
    return NextResponse.json({
      mode,
      screenplayYaml: buildMockScreenplayYaml(),
    });
  }

  try {
    const prompt = buildScreenplayPrompt(validation.body);
    const screenplayYaml = await callLLM(prompt);

    return NextResponse.json({
      mode,
      screenplayYaml,
    });
  } catch (error) {
    console.error(
      "LLM conversion failed:",
      error instanceof Error ? error.message : error,
    );

    return NextResponse.json(
      { error: "LLM conversion failed." },
      { status: 500 },
    );
  }
}

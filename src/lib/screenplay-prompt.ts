export type ScreenplayType =
  | "standard_film"
  | "commercial_short_drama"
  | "fantasy_animation"
  | "stage_play";

export type ScreenplayChapterInput = {
  id?: string;
  title: string;
  content: string;
};

export type BuildScreenplayPromptInput = {
  title: string;
  screenplayType: ScreenplayType;
  chapters: ScreenplayChapterInput[];
};

const screenplayStyleProfiles: Record<
  ScreenplayType,
  {
    label: string;
    suitableFor: string;
    traits: string;
    guidance: string[];
  }
> = {
  standard_film: {
    label: "标准影视剧本",
    suitableFor: "大多数小说",
    traits: "稳定、规范、可继续编辑",
    guidance: [
      "采用规范影视剧本节奏，动作与对白保持均衡。",
      "场景推进清晰，人物动机明确，方便后续继续编辑和扩写。",
      "不要过度追求反转或诗意，优先保证可拍摄、可阅读、结构稳定。",
    ],
  },
  commercial_short_drama: {
    label: "爆款短剧剧本",
    suitableFor: "爽文、言情、都市、复仇",
    traits: "冲突强、节奏快、钩子多",
    guidance: [
      "每个场景都要尽快进入冲突，减少铺垫和长段环境描写。",
      "强化爽点、反转、误会、压迫感和结尾钩子。",
      "对白要短、直接、有情绪张力，场景动作服务于推进冲突。",
    ],
  },
  fantasy_animation: {
    label: "奇幻动画剧本",
    suitableFor: "奇幻、科幻、轻小说、校园、冒险类小说",
    traits: "想象力强、画面夸张、镜头感强、节奏明快",
    guidance: [
      "动作块要突出角色表情、运动轨迹、镜头变化、色彩、声音和夸张的画面表现。",
      "可以强化奇观、魔法、幻想设定和视觉冲击，但不要新增 YAML block 类型。",
      "用 action 承载动画镜头式画面描述，用 dialogue 承载对白，保持儿童或轻小说读者也能理解的清晰节奏。",
    ],
  },
  stage_play: {
    label: "舞台话剧剧本",
    suitableFor: "家庭、伦理、人物冲突强的文本",
    traits: "场景集中、对白密集",
    guidance: [
      "尽量减少地点切换，让冲突集中发生在少数空间里。",
      "对白要更密集，强调人物立场、关系变化和舞台张力。",
      "动作块重点描述舞台调度、停顿、注视、走位和空间关系。",
    ],
  },
};

export function buildScreenplayPrompt(input: BuildScreenplayPromptInput) {
  const chaptersText = input.chapters
    .map((chapter, index) => {
      const sourceChapter = index + 1;

      return [
        `## Chapter ${sourceChapter}`,
        `source_chapter: ${sourceChapter}`,
        `id: ${chapter.id ?? `chapter_${String(sourceChapter).padStart(3, "0")}`}`,
        `title: ${chapter.title}`,
        "",
        chapter.content,
      ].join("\n");
    })
    .join("\n\n");

  const styleProfile = screenplayStyleProfiles[input.screenplayType];

  return `你是 Actory 的小说转剧本引擎。请把用户提供的小说章节转换为 Actory Screenplay YAML。

输出要求必须严格遵守：
- 只输出 YAML。
- 不要输出 Markdown 代码块。
- 不要用 \`\`\`yaml 或 \`\`\` 包裹结果。
- 顶层只包含 title、screenplay_type、characters、scenes。
- 不要输出 version、language、created_at、model_name、token_usage 等系统元数据。
- title 必须是剧本标题。
- screenplay_type 必须是 ${input.screenplayType}。
- characters 必须是数组。
- scenes 必须是线性数组，顺序就是剧本阅读顺序。
- 每个 scene 必须包含 id、number、source_chapter、heading、blocks。
- source_chapter 必须是单个数字，不要使用数组。
- heading 必须包含 space、location、time。
- heading.space 只能使用 interior 或 exterior。
- scene.blocks 必须是线性数组，顺序就是场景内部发生顺序。
- blocks 当前只允许 action 和 dialogue。
- action 表示动作、环境、声音、气氛、可视化描述。
- dialogue 表示人物对白。
- dialogue.character 必须引用 characters 中存在的 id。
- dialogue.line 必须是人物说出口的台词。
- 如需对白语气或动作提示，可以使用 dialogue.parenthetical。
- 不要把小说原文整段复制为单个 action，要拆成适合剧本阅读的动作和对白块。
- YAML 字符串值请使用双引号，避免格式歧义。

目标剧本类型：${styleProfile.label} (${input.screenplayType})
适用小说类型：${styleProfile.suitableFor}
风格特征：${styleProfile.traits}
风格生成要求：
${styleProfile.guidance.map((item) => `- ${item}`).join("\n")}

作品标题：${input.title}

请按以下结构输出：
title: "..."
screenplay_type: "${input.screenplayType}"
characters:
  - id: "char_001"
    name: "..."
    role: "protagonist"
    description: "..."
scenes:
  - id: "scene_001"
    number: 1
    source_chapter: 1
    heading:
      space: "interior"
      location: "..."
      time: "..."
    blocks:
      - type: "action"
        text: "..."
      - type: "dialogue"
        character: "char_001"
        parenthetical: "..."
        line: "..."

小说章节如下：

${chaptersText}`;
}

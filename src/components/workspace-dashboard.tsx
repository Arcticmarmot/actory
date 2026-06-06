import {
  IconBook,
  IconCircleCheck,
  IconClock,
  IconCodeDots,
  IconFileCode,
  IconFileText,
  IconSparkles,
  IconUpload,
  IconWand,
} from "@tabler/icons-react";

const overviewCards = [
  {
    label: "小说输入",
    value: "3+",
    hint: "章节改编门槛",
    icon: IconBook,
  },
  {
    label: "剧本格式",
    value: "YAML",
    hint: "结构化可编辑",
    icon: IconFileCode,
  },
  {
    label: "改编任务",
    value: "12",
    hint: "草稿和待处理",
    icon: IconSparkles,
  },
  {
    label: "平均进度",
    value: "68%",
    hint: "示例工作流状态",
    icon: IconCircleCheck,
  },
];

const conversionSteps = [
  {
    title: "导入章节",
    status: "已准备",
    description: "保留章节顺序、标题和来源索引。",
    icon: IconUpload,
  },
  {
    title: "结构拆解",
    status: "处理中",
    description: "抽取人物、地点、冲突和场景节拍。",
    icon: IconCodeDots,
  },
  {
    title: "剧本初稿",
    status: "待确认",
    description: "输出动作、对白、转场和作者备注。",
    icon: IconFileText,
  },
];

const recentProjects = [
  {
    title: "长夜来信",
    source: "5 个章节",
    target: "12 场戏",
    status: "草稿生成中",
  },
  {
    title: "雾港第三章",
    source: "3 个章节",
    target: "8 场戏",
    status: "待作者打磨",
  },
  {
    title: "银杏街事件",
    source: "7 个章节",
    target: "16 场戏",
    status: "YAML 已同步",
  },
];

const queueItems = [
  ["章节解析", "长夜来信 Chapter 1-5", "80%"],
  ["人物合并", "雾港第三章", "45%"],
  ["对白润色", "银杏街事件 Scene 04", "20%"],
];

const yamlPreview = `schema_version: "1.0"
script:
  format: "screenplay"
  acts:
    - title: "第一幕"
      scenes:
        - id: "scene_001"
          source_chapters: ["chapter_001"]
          location_id: "loc_001"
          characters: ["char_001"]
          action:
            - "雨声压低了街边的灯影。"
          dialogue:
            - speaker_id: "char_001"
              line: "我们必须在天亮前离开。"`;

const actionButtonClass =
  "inline-flex h-9 items-center gap-2 rounded-lg border border-primary/15 bg-primary/10 px-3.5 text-[13px] font-medium text-primary shadow-sm shadow-primary/5 backdrop-blur transition hover:border-primary/25 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function WorkspaceDashboard() {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <IconSparkles className="size-3.5 text-primary" />
              AI 辅助剧本创作
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              将小说章节转成可编辑剧本工作流
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              首页聚合导入、结构拆解、剧本初稿和 YAML 预览，后续功能可以按模块逐步接入。
            </p>
          </div>
          <div className="flex gap-2">
            <button className={actionButtonClass} type="button">
              <IconUpload className="size-4" />
              导入章节
            </button>
            <button className={actionButtonClass} type="button">
              <IconWand className="size-4" />
              生成初稿
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <div className="flex size-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="size-4" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-semibold">{card.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{card.hint}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-lg border bg-card p-4 shadow-sm md:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">改编工作台</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  从章节输入到 YAML 初稿的主要路径。
                </p>
              </div>
              <span className="rounded-md border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                screenplay.yaml
              </span>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {conversionSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div key={step.title} className="rounded-md border bg-background p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                        <Icon className="size-4" />
                      </div>
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        {step.status}
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-lg border bg-card p-4 shadow-sm md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">YAML 预览</h2>
                <p className="mt-1 text-sm text-muted-foreground">结构字段示例</p>
              </div>
              <IconFileCode className="size-5 text-primary" />
            </div>
            <pre className="mt-4 max-h-[300px] overflow-auto rounded-md border bg-muted p-4 text-xs leading-6 text-foreground">
              <code>{yamlPreview}</code>
            </pre>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-lg border bg-card p-4 shadow-sm md:p-5">
            <h2 className="text-base font-semibold">近期项目</h2>
            <div className="mt-4 divide-y">
              {recentProjects.map((project) => (
                <div
                  key={project.title}
                  className="grid gap-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{project.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {project.source}
                      {" -> "}
                      {project.target}
                    </p>
                  </div>
                  <span className="w-fit rounded-md border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border bg-card p-4 shadow-sm md:p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">今日队列</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  布局阶段使用静态任务展示页面密度。
                </p>
              </div>
              <IconClock className="size-5 text-muted-foreground" />
            </div>
            <div className="mt-5 space-y-3">
              {queueItems.map(([title, description, progress]) => (
                <div key={title} className="rounded-md border bg-background p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {progress}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: progress }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

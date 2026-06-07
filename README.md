<div align="center">

# Actory

**小说转剧本创作工作台** · Act the Story

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![七牛云](https://img.shields.io/badge/七牛云-LLM-00AAFF)](https://www.qiniu.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](./LICENSE)


</div>

---

## 目录

[引言](#引言) · [核心能力](#核心能力) · [体验路径](#体验路径) · [LLM 配置](#llm-配置) · [剧本 YAML 格式设计](#剧本-yaml-格式设计) · [技术栈](#技术栈) · [本地运行](#本地运行) · [工程质量](#工程质量) · [License](#license)

---

## 引言

小说改编成剧本时，作者往往需要先整理章节、选择剧本类型、拆人物与场景，再把动作、对白和场景头统一成可继续编辑的结构。手工处理不仅慢，也容易让文本在小说段落和剧本格式之间不断切换

Actory 把这条链收进一个本地优先的创作工作台：输入小说章节后使用 LLM 生成剧本结构；生成结果不是一段无法修改的文本，而是可以继续查看、解锁、编辑和保存的剧本草稿

🎬 Demo 视频（3 分钟）：https://www.bilibili.com/video/BV1rLEh6ME36/?vd_source=0278f04d912eb16e525c3ee97c71e149

---

## 核心能力

| 能力 | 说明                                                                         |
|---|----------------------------------------------------------------------------|
| **小说章节输入** | 创作中心默认 3 章，最多 10 章；每章包含标题与正文，支持锁定避免误触                                      |
| **剧本风格选择** | 支持标准影视、商业短剧、奇幻动画、舞台话剧 4 种风格，并将风格写入转换请求                                     |
| **mock / LLM 转换** | `/api/convert` 支持 `CONVERSION_MODE=mock` 和 `CONVERSION_MODE=llm`，可先打通链路，再接入真实模型 |
| **固定 YAML Schema** | Prompt 明确约束模型只输出 `title / screenplay_type / characters / scenes`，场景和 block 均为线性数组 |
| **中文化剧本展示** | 前端解析 YAML 后展示标题、风格、人物、场景、动作和对白，不直接展示 YAML                                  |
| **本地草稿管理** | 使用 localStorage 管理 我的小说 和 我的剧本 ，支持查看、编辑、删除和保存确认                            |
| **数据看板** | 统计本地小说数、章节数、剧本数、场景数，展示剧本风格占比和最近剧本入口                                        |

---

## 体验路径

1. 进入 **创作中心**，填写作品标题、选择剧本风格
2. 点击 **示例** 下拉，选择示例 1 / 2 / 3，快速填入小说章节
3. 点击 **转换**，右侧生成剧本结构；mock 模式返回内置 YAML，llm 模式调用模型生成
4. 在右侧查看人物列表和场景列表；解锁后可编辑除 ID 外的剧本字段
5. 点击右侧 **保存**，剧本进入 **我的剧本**；左侧小说也可保存到 **我的小说**
6. 进入 **数据看板**，查看本地创作数据，并从最近剧本直接跳转到剧本详情

---

当前设计重点是把“小说章节输入 -> 转换接口 -> 剧本 YAML -> 结构化展示 -> 本地管理”这条链跑通。数据库、文件上传、故事中心 / 剧本中心后端 CRUD 暂未接入。

---

## LLM 配置

项目使用 OpenAI-compatible chat completions 格式调用模型，默认适配七牛云 AI 推理接口。

复制环境变量示例：

```bash
cp .env.example .env.local
```

`.env.local` 示例：

```bash
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://api.qnaigc.com/v1
LLM_MODEL=deepseek-v3
CONVERSION_MODE=llm
```

模式说明：

| 模式 | 说明 |
|---|---|
| `mock` | 不需要 API Key，返回内置示例 YAML，用于前端链路调试。 |
| `llm` | 调用真实模型生成剧本 YAML，需要配置 `LLM_API_KEY / LLM_BASE_URL / LLM_MODEL`。 |

接口会请求：

```text
{LLM_BASE_URL}/chat/completions
```

---

## 剧本 YAML 格式设计

Actory 的剧本输出使用固定 YAML Schema，核心字段包括 `title`、`screenplay_type`、`characters` 和 `scenes`。

该格式强调线性剧本阅读体验：`scenes` 表示场景顺序，`scene.blocks` 表示单个场景内动作和对白的发生顺序。当前 block 只保留 `action` 和 `dialogue`，方便 LLM 稳定生成，也方便作者后续继续编辑。

完整设计目标、字段说明和 YAML 示例见 [`docs/screenplay-yaml-schema.md`](./docs/screenplay-yaml-schema.md)。

---

## 技术栈

| 依赖 | 版本 | 用途 |
|---|---:|---|
| `next` | 16.2.7 | App Router 与 Route Handler |
| `react` / `react-dom` | 19.2.4 | UI |
| `typescript` | ^5 | 类型约束 |
| `tailwindcss` / `@tailwindcss/postcss` | ^4 | 样式系统 |
| `@tabler/icons-react` | ^3.44 | 工作台图标 |
| `eslint` / `eslint-config-next` | ^9 / 16.2.7 | 代码规范 |

---

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

访问：

```text
http://localhost:3000
```

---

## 工程质量

- **本地优先**：小说、剧本和统计数据先使用 localStorage，方便 MVP 阶段快速验证交互
- **接口边界清晰**：转换接口只负责校验输入、选择 mock / llm 模式、返回 screenplay YAML
- **Prompt 约束明确**：限制顶层字段、场景结构、block 类型和角色引用，减少模型输出漂移
- **UI 模块拆分**：创作中心、我的小说、我的剧本、数据看板分别独立组件

---

## License

[MIT](./LICENSE)

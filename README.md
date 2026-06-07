Actory(Act the Story) 是一款能够让你的文字变成剧本的产品。

## Conversion API 配置

项目提供 `/api/convert` 接口，用于将小说章节转换为 Actory Screenplay YAML。

当前接口支持两种模式：

- `mock`：返回内置示例 YAML，用于前端链路调试。
- `llm`：调用 OpenAI-compatible chat completions 接口，返回模型生成的 YAML。

### 配置 `.env.local`

复制 `.env.example`：

```bash
cp .env.example .env.local
```

按需要填写：

```bash
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://api.qnaigc.com/v1
LLM_MODEL=deepseek-v3
CONVERSION_MODE=mock
```

不要提交 `.env.local`。第三方模型 API Key 由用户自行配置。

### 使用 mock 模式

mock 模式不需要配置模型密钥：

```bash
CONVERSION_MODE=mock
```

启动项目后，`POST /api/convert` 会返回固定示例 YAML。

### 使用 llm 模式

llm 模式会调用 OpenAI-compatible chat completions 接口：

```bash
CONVERSION_MODE=llm
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://api.qnaigc.com/v1
LLM_MODEL=deepseek-v3
```

当前七牛云 AI 大模型推理的 OpenAI-compatible 接入点是：

```text
https://api.qnaigc.com/v1
```

代码会请求：

```text
{LLM_BASE_URL}/chat/completions
```

因此七牛云默认会请求：

```text
https://api.qnaigc.com/v1/chat/completions
```

如果第三方服务直接提供完整 chat completions 地址，也可以将 `LLM_BASE_URL` 配置为以 `/chat/completions` 结尾的完整地址。若七牛云地址只填写到 `https://api.qnaigc.com`，代码会自动补全为 `/v1/chat/completions`。

### 接口请求体

```json
{
  "title": "作品标题",
  "screenplayType": "standard_film",
  "chapters": [
    {
      "id": "chapter-1",
      "title": "第一章",
      "content": "章节内容"
    }
  ]
}
```

`screenplayType` 当前支持：

- `standard_film`
- `commercial_short_drama`
- `fantasy_animation`
- `stage_play`

### 接口响应

```json
{
  "mode": "mock",
  "screenplayYaml": "title: \"...\""
}
```

llm 模式响应中的 `mode` 为 `"llm"`。

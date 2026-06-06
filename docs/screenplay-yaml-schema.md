# Actory 剧本 YAML Schema

本文档定义 Actory 将三章以上小说文本转换为剧本初稿时使用的 YAML 结构。该 Schema 面向作者继续编辑，因此优先保证可读、可定位、可增量修改，而不是追求影视工业制片阶段的完整字段。

## 顶层结构

```yaml
schema_version: "1.0"
metadata:
  title: "作品标题"
  author: "作者名"
  language: "zh-CN"
  source_type: "novel"
  created_at: "2026-06-06T00:00:00+08:00"

source:
  chapter_count: 3
  chapters:
    - id: "chapter_001"
      title: "第一章"
      order: 1
      summary: "本章主要情节摘要"

characters:
  - id: "char_001"
    name: "角色名"
    role: "protagonist"
    description: "角色定位和关键特征"

locations:
  - id: "loc_001"
    name: "场景地点"
    description: "地点氛围和叙事用途"

script:
  format: "screenplay"
  logline: "一句话故事梗概"
  acts:
    - id: "act_001"
      title: "第一幕"
      purpose: "建立人物、冲突或转折"
      scenes:
        - id: "scene_001"
          source_chapters: ["chapter_001"]
          location_id: "loc_001"
          time_of_day: "night"
          characters: ["char_001"]
          summary: "本场戏的戏剧目标"
          beats:
            - "关键动作或情绪节拍"
          action:
            - "舞台/镜头动作描述"
          dialogue:
            - speaker_id: "char_001"
              line: "对白内容"
              emotion: "克制"
              subtext: "没有明说的真实意图"
          transition: "cut"
          notes: "作者后续打磨备注"
```

## 字段说明

`schema_version` 标识当前 Schema 版本，便于后续兼容升级。

`metadata` 保存作品级信息，包括标题、作者、语言、来源类型和创建时间。

`source` 保存小说输入来源。`chapter_count` 必须大于等于 3，`chapters` 用稳定 `id` 和 `order` 保留原文顺序，方便追溯剧本场景来自哪一章。

`characters` 保存角色清单。角色在场景和对白中通过 `id` 引用，避免角色改名后需要批量改动所有对白。

`locations` 保存地点清单。地点同样通过 `id` 引用，便于后续做场景统计、分场调整和拍摄空间归并。

`script` 是剧本主体。`acts` 用于组织戏剧结构，`scenes` 是最小可编辑单元。每个场景包含来源章节、地点、出场人物、剧情摘要、节拍、动作、对白、转场和备注。

## 设计原因

该 Schema 将小说来源、角色、地点和剧本正文分开，是为了让 AI 生成结果既能被作者直接阅读，也能被界面拆成独立编辑区。

`source_chapters` 保留小说到剧本的映射，解决改编时最常见的追溯问题：作者可以知道某场戏由哪些章节转化而来。

角色和地点使用独立列表加 `id` 引用，是为了降低重复文本带来的不一致风险。后续如果需要改角色名、合并地点或统计出场频次，只需要处理稳定标识。

`beats`、`action` 和 `dialogue` 分开，是为了区分戏剧节奏、画面行动和角色语言。这样既适合作者打磨，也适合后续扩展到分镜、对白优化或导出其他剧本格式。

`notes` 字段保留人工创作空间。Actory 的目标不是一次性替代作者，而是提供可编辑、可进一步打磨的剧本初稿。

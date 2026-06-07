# Actory Screenplay YAML Schema

本文档定义 Actory 小说转剧本功能使用的 YAML 输出结构。

Actory 的目标是帮助小说作者将小说文本转换为结构化、可编辑、可继续打磨的剧本初稿。因此，本 Schema 不追求完整替代专业编剧软件，而是聚焦于小说改编场景中最重要的剧本结构：**场景、动作、对白和线性叙事顺序**。

## 1. 设计目标

Actory Screenplay YAML Schema 主要服务以下目标：

1. **保留剧本的线性阅读体验**

   剧本不是人物、动作、对白的分类堆叠，而是按时间顺序推进的文本。因此本 Schema 使用 `scenes` 表示场景顺序，使用 `blocks` 表示单个场景内部动作和对白的发生顺序。

2. **让小说作者容易编辑**

   YAML 文件应该像剧本初稿一样可以被作者直接阅读和修改，而不是变成难以理解的数据结构。

3. **服务 AI 稳定生成**

   Schema 字段保持克制，避免过度复杂的嵌套结构，降低 LLM 输出格式错误的概率。


## 2. 完整 YAML 示例

下面是一个完整的 Actory Screenplay YAML 示例。

这个示例展示了 Actory 剧本 YAML 的核心设计方式：

* `scenes` 数组表示剧本场景的线性顺序。
* 每个 `scene` 内部的 `blocks` 数组表示该场景内动作和对白的线性顺序。
* 环境描写、人物动作、声音、气氛都统一写成 `action`。
* 人物说出口的台词写成 `dialogue`。
* YAML 中只保存剧本内容，不保存后端系统元数据。

```yaml
# 剧本标题，属于作品内容，可以写入 YAML
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
        line: "有些东西不是停了，只是在等人回来。"
```

## 3. 顶层结构

一个完整的 Actory 剧本 YAML 文件应包含以下顶层字段：

```yaml
title: "雨中的钟表店"
screenplay_type: "standard_film"
characters: []
scenes: []
```

| 字段                | 类型     | 必填 | 说明                                        |
| ----------------- | ------ | -- | ----------------------------------------- |
| `title`           | string | 是  | 剧本标题                                      |
| `screenplay_type` | string | 是  | 剧本类型，例如 `standard_film`、`commercial_short_drama`、`fantasy_animation`、`stage_play` |
| `characters`      | array  | 是  | 人物列表                                      |
| `scenes`          | array  | 是  | 线性场景列表                                    |

设计原因：

* `title` 和 `screenplay_type` 属于作品内容，适合写入 YAML。
* `characters` 独立存放，方便对白块通过人物 ID 引用。
* `scenes` 是剧本主体，数组顺序就是剧本阅读顺序。
* 不在 YAML 中保存系统级元数据，例如用户 ID、模型名称、生成时间等。

## 4. screenplay_type

`screenplay_type` 用于标记剧本初稿类型。

推荐值：

| 值                         | 说明       |
| -------------------------- | ---------- |
| `standard_film`            | 标准影视剧本 |
| `commercial_short_drama`   | 商业短剧剧本 |
| `fantasy_animation`        | 奇幻动画剧本 |
| `stage_play`               | 舞台话剧剧本 |

示例：

```yaml
screenplay_type: "standard_film"
```

设计原因：

* 不同剧本风格在节奏、场景组织、对白密度和画面呈现上存在差异。
* 当前版本只通过 `screenplay_type` 标记类型，不为每种类型设计完全不同的结构。
* 后续接入 LLM 时，可以根据 `screenplay_type` 调整 prompt，而不破坏 YAML 基础结构。

## 5. characters

`characters` 用于记录剧本中的人物。

示例：

```yaml
characters:
  - id: "char_001"
    name: "林舟"
    role: "protagonist"
    description: "年轻的修表匠，沉默敏感，对父亲的离去始终无法释怀。"

  - id: "char_002"
    name: "沈青"
    role: "supporting"
    description: "林舟旧识，冷静克制，知道怀表背后的秘密。"
```

| 字段            | 类型     | 必填 | 说明                                              |
| ------------- | ------ | -- | ----------------------------------------------- |
| `id`          | string | 是  | 人物唯一标识                                          |
| `name`        | string | 是  | 人物名称                                            |
| `role`        | string | 否  | 人物角色，例如 `protagonist`、`supporting`、`antagonist` |
| `description` | string | 否  | 人物简介                                            |

设计原因：

* 人物信息独立出来，避免每句对白都重复保存人物介绍。
* 对白块使用 `character` 引用人物 ID，便于后续统一修改人物姓名或信息。
* `description` 只保存简要人物信息，不承担完整人物小传功能。

## 6. scenes

`scenes` 是剧本主体，表示场景的线性顺序。

示例：

```yaml
scenes:
  - id: "scene_001"
    number: 1
    source_chapter: 1
    heading:
      space: "interior"
      location: "老钟表店"
      time: "夜"
    blocks: []
```

| 字段               | 类型     | 必填 | 说明             |
| ---------------- | ------ | -- | -------------- |
| `id`             | string | 是  | 场景唯一标识         |
| `number`         | number | 是  | 场景序号，从 1 开始    |
| `source_chapter` | number | 是  | 该场景主要来源的小说章节序号 |
| `heading`        | object | 是  | 场景头            |
| `blocks`         | array  | 是  | 场景内部的线性内容块     |

设计原因：

* `scenes` 数组顺序就是剧本场景顺序。
* `source_chapter` 使用单个数字，表示当前场景主要改编自哪一章小说。
* 如果后续一个场景确实融合多个章节，可以在应用层处理，不在 MVP Schema 中增加复杂度。
* `blocks` 负责表达场景内部动作和对白的发生顺序。

## 7. heading

`heading` 用于描述场景头，即场景发生的空间、地点和时间。

示例：

```yaml
heading:
  space: "interior"
  location: "老钟表店"
  time: "夜"
```

| 字段         | 类型     | 必填 | 说明                                                  |
| ---------- | ------ | -- | --------------------------------------------------- |
| `space`    | string | 是  | 空间类型，推荐值为 `interior`、`exterior`、`interior_exterior` |
| `location` | string | 是  | 场景地点                                                |
| `time`     | string | 否  | 场景时间，例如 `日`、`夜`、`黄昏`、`清晨`                           |

推荐值：

| 字段      | 推荐值                                       |
| ------- | ----------------------------------------- |
| `space` | `interior`、`exterior`、`interior_exterior` |

设计原因：

* 影视剧本通常使用场景头说明内外景、地点和时间。
* 使用结构化字段可以让前端渲染成不同格式，例如：

    * 中文：`内景 / 老钟表店 / 夜`
    * 英文：`INT. OLD CLOCK SHOP - NIGHT`
* `space` 使用字符串而不是布尔值，是为了比 `interior: true` 更直观，也方便表达 `interior_exterior` 这类特殊场景。

## 8. blocks

`blocks` 是本 Schema 的核心。

一个场景内部的所有动作和对白，都按真实发生顺序写入 `blocks` 数组。

示例：

```yaml
blocks:
  - type: "action"
    text: "雨水拍打着玻璃窗。墙上的老钟一只接一只停在不同的时间。"

  - type: "dialogue"
    character: "char_001"
    line: "你又把它拿出来了？"

  - type: "action"
    text: "沈青没有回答。她把怀表放在灯下，表盖上映出一圈昏黄的光。"

  - type: "dialogue"
    character: "char_002"
    parenthetical: "低声"
    line: "它今天走了三分钟。"
```

当前 MVP 推荐的 `type` 取值：

| type       | 说明             |
| ---------- | -------------- |
| `action`   | 动作、环境、声音、可视化描述 |
| `dialogue` | 人物对白           |

设计原因：

* 剧本是线性的，动作和对白必须保留真实先后顺序。
* `action` 不只表示人物动作，也包括观众能看到或听到的环境描写，例如海浪、雨声、灯光、房间状态。
* `dialogue` 表示人物说出口的台词。
* 后续如果需要支持更专业的剧本格式，可以在不破坏现有结构的基础上扩展新的 block type。

### 8.1 action block

`action` 用于描述观众可以看到或听到的内容，包括人物动作、环境变化、声音、气氛和关键物件。

示例：

```yaml
- type: "action"
  text: "海浪一下一下拍在黑色礁石上。远处的灯塔还没有亮，天空低得像要压到海面。"
```

再例如：

```yaml
- type: "action"
  text: "林舟站在护栏边，手里攥着一封被雨水打湿的信。"
```

| 字段     | 类型     | 必填 | 说明            |
| ------ | ------ | -- | ------------- |
| `type` | string | 是  | 固定为 `action`  |
| `text` | string | 是  | 动作、环境、声音或画面描述 |

设计原因：

* 专业剧本中的 action / description 通常描述观众能看见或听见的内容。
* 如果动作和环境连续发生，可以拆成多个 `action` block，以保留节奏和阅读感。

### 8.2 dialogue block

`dialogue` 用于记录人物对白。

示例：

```yaml
- type: "dialogue"
  character: "char_001"
  line: "你还是来了。"
```

带表演提示的对白：

```yaml
- type: "dialogue"
  character: "char_002"
  parenthetical: "停顿"
  line: "我只是想把话说完。"
```

| 字段              | 类型     | 必填 | 说明             |
| --------------- | ------ | -- | -------------- |
| `type`          | string | 是  | 固定为 `dialogue` |
| `character`     | string | 是  | 说话人物 ID        |
| `parenthetical` | string | 否  | 简短表演提示         |
| `line`          | string | 是  | 台词内容           |

设计原因：

* `character` 使用人物 ID，而不是直接写人物姓名，方便统一维护人物信息。
* `parenthetical` 对应剧本中括号内的表演提示，例如“低声”“停顿”“没有看他”。
* `parenthetical` 应保持简短，不应承载长动作描写。
* 较长的动作应单独写成 `action` block。

例如，不推荐：

```yaml
- type: "dialogue"
  character: "char_002"
  parenthetical: "她转过身，走到窗边，看着雨水沿玻璃往下流，过了很久才开口"
  line: "我只是想把话说完。"
```

推荐写法：

```yaml
- type: "action"
  text: "沈青转过身，走到窗边，看着雨水沿玻璃往下流。"

- type: "dialogue"
  character: "char_002"
  parenthetical: "过了很久"
  line: "我只是想把话说完。"
```


## 9. MVP 设计边界

当前 MVP 版本只保留以下核心结构：

```yaml
title: string
screenplay_type: string
characters: array
scenes: array
```

每个 `scene` 只保留：

```yaml
id: string
number: number
source_chapter: number
heading: object
blocks: array
```

每个 `block` 当前只支持：

```yaml
type: "action"
text: string
```

或：

```yaml
type: "dialogue"
character: string
parenthetical: string
line: string
```

## 10. 设计总结

Actory Screenplay YAML Schema 的核心思想是：

用 `scenes` 保留剧本的场景顺序，用 `blocks` 保留场景内部的动作和对白顺序。

这种结构既接近真实剧本的阅读方式，也适合小说改编场景中的 AI 生成、人工修改和后续导出。

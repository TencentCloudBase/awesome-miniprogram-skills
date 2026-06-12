# AI Skill Atomic Design Spec

## DESIGN SPECIFICATION

### 1. Purpose Statement

这套规范服务于 `text-gen-skill`、`image-gen-skill`、`image-edit-skill` 三类 AI 能力卡片，目标不是做“更花”的演示，而是建立一套能长期复用的、信息密度更高的原子组件语言。它需要同时满足微信原子组件约束、当前项目的咖啡品牌底色，以及你给的参考图那种更像“编辑排版系统”而不是“圆角卡片堆叠”的质感。

当前项目里的多数卡片问题不在功能，而在视觉结构：圆角过大、按钮语气过重、阴影和渐变过于模板化、信息没有主次节奏。新规范的核心是把 AI 结果卡片做成“内容面板 + 侧向标识 + 精简动作”的组合，而不是传统电商卡片的复制体。

### 2. Aesthetic Direction

`Editorial/magazine`，并显式继承项目现有咖啡品牌色作为窄范围品牌覆盖。

关键词：纸面感、窄边框、栏目式排版、标签化元信息、克制的暖棕色强调、低阴影、非居中构图。

### 3. Color Palette

- `#5C3A21`：品牌主色，用于标题强调、主按钮、分隔标识
- `#EFE4D6`：暖米色底，用于卡片浅底块、次级按钮底
- `#F8F5F1`：页面与组件主背景，替代纯白满屏反差
- `#1F1813`：主文本色，正文与标题统一基准黑棕
- `#A06F43`：辅助强调色，用于模型标签、状态线、图像提示条
- `#D9C7B4`：细边框和分割线颜色

### 4. Typography

- 标题字体：`Source Han Serif SC`
- 正文字体：`PingFang SC`
- 数字与模型标签：`DIN Alternate`

说明：这是一个品牌覆盖场景。小程序实现阶段如果自定义字体加载成本过高，可以保留 `PingFang SC` 作为运行时兜底，但设计稿和字号节奏仍按这套字体关系执行。

### 5. Layout Strategy

采用“左窄右宽”的非对称信息骨架：左侧为场景标签、状态刻度或模型标记，右侧为主要内容区。卡片内部不使用简单居中堆叠，而使用纵向栏目感布局，顶部保留一条细分隔线或标签带，底部动作区压缩为单行，确保视觉重心在内容结果本身而不是按钮。

---

## Why Current Cards Feel Weak

- 大圆角和大阴影太像通用组件库，不像内容型 AI 卡片。
- 渐变按钮用得太满，主次动作没有区别，所有操作都在抢注意力。
- 版式基本都是“标题 + 内容 + 按钮”居中堆叠，信息节奏单一。
- 缺少稳定的元信息区，模型、风格、生成时间、结果状态没有形成统一语言。
- 颜色虽然沿用了咖啡主题，但没有沉淀成可复用 token，导致不同 skill 很难看起来像同一套系统。

---

## Core Principles

### 1. Content First

AI 组件首先是“结果容器”，不是营销卡片。视觉焦点应落在文本内容、图片内容、编辑对比结果，按钮只能排第二。

### 2. Use Structure Instead Of Decoration

优先使用边框、留白、分栏、浅底块、标题基线和标签系统建立层级，避免依赖大面积渐变、发光、悬浮阴影制造“精致感”。

### 3. Keep The Brand Warm But Dry

沿用 `app.json` 里的棕咖色，但处理方式要更克制。主色只出现在关键标题、分隔条、主动作和少量标签，不铺满整张卡。

### 4. Build A Unified Metadata Rail

每张卡都要有固定的元信息区，用来容纳 `scene`、`model`、`style`、`size`、`expiresIn` 之类的系统信息。元信息必须可扫描，不能散落在正文里。

### 5. One Primary Action Only

每张卡最多一个视觉主按钮，其他动作降级为描边或文字按钮。这样用户能直接判断“下一步最合理的动作”。

---

## Design Tokens

### Spacing

- 外边距：`12px`
- 卡片内边距：`12px`
- 内容主区块间距：`8px`
- 元信息与正文间距：`6px`
- 动作区顶部间距：`10px`

### Radius

- 全部卡片统一：`4px`
- 标签与小底块：`4px`
- 按钮：`4px`

### Border And Shadow

- 主边框：`1px solid #D9C7B4`
- 分隔线：`1px solid rgba(31, 24, 19, 0.08)`
- 阴影：仅允许 `0 4px 16px rgba(31, 24, 19, 0.06)` 级别的弱阴影

### Text Hierarchy

- 标题：`17px / 600 / #1F1813`
- 正文：`15px / 400 / rgba(31, 24, 19, 0.90)`
- 次信息：`12px / 400 / rgba(31, 24, 19, 0.45)`
- 辅助信息：`12px / 400 / rgba(31, 24, 19, 0.30)`

### Button System

- 高度：`48px`
- 主按钮底色：`#5C3A21`
- 主按钮文字：`#F8F5F1`
- 次按钮底色：`#EFE4D6`
- 次按钮文字：`#5C3A21`
- 文字按钮：透明底，仅保留 `#5C3A21` 文案和左侧 2px 竖线提示

---

## Shared Layout Grammar

### Card Skeleton

每张 AI 卡片统一拆成 4 个层级：

1. `meta-rail`：顶部或左侧的标签带，展示场景、模型、风格、状态。
2. `hero-content`：主要输出区域，文本或图片必须占据卡片视觉中心。
3. `annotation`：系统说明，如“图片链接 24 小时有效”“编辑结果非像素级精修”。
4. `action-row`：底部动作区，最多 3 个动作，且只有 1 个主按钮。

### Composition Rules

- 纵向内容区始终左对齐，不使用居中段落。
- 元信息标签默认贴上沿排列，不放到底部。
- 图片类卡片允许局部满宽，但底部必须有信息带，不做“纯图 + 浮动按钮”。
- 文本类卡片正文区域使用窄栏排版，长文本默认折叠为 `6-8` 行，并提供“展开全文”。
- 动作区总是与正文通过细分隔线分开，避免内容和按钮糊成一块。

---

## Component Specs

### A. `text-result-card`

#### Ratio

`4:3`

#### Visual Structure

- 左上角放场景标签，如 `写作`、`翻译`、`问答`
- 右上角放模型标签，如 `CloudBase`、`DeepSeek v4`
- 标题区不是大标题，而是“结果摘要”或首句提炼
- 正文区使用单栏文本，行高偏松，底部配渐隐遮罩表示可展开
- 底部注释区展示 `temperature`、`maxTokens`、`usage`

#### Style Notes

- 文本区使用浅底块 `#F8F5F1`，不是纯白贴底
- 可以在左侧加一条 `2px` 深棕竖线，像编辑标注，不用大色块标题栏
- “复制结果”是唯一主按钮
- “重新生成”和“换模型”降级为次按钮或文字按钮

#### Interaction

- 默认收起：正文最多 `8` 行
- 点击 `展开全文` 后正文完整展开，按钮文案切换为 `收起内容`
- `重新生成` 触发 follow-up message，并沿用原参数
- `换模型` 不直接拉起 picker，而是通过 follow-up 让 agent 续跑并携带 `model`

### B. `image-result-card`

#### Ratio

`1:1`

#### Visual Structure

- 图片区占卡片高度约 `72%`
- 下方信息带占约 `28%`
- 信息带左侧放 `style` 和 `size`，右侧放 `n/有效期`
- 多图时采用横向滚动，但每张图保持统一信息带结构

#### Style Notes

- 图片容器边缘只保留 `4px` 圆角，不额外套大圆角白卡
- 信息带背景用 `#F8F5F1`，边框用 `#D9C7B4`
- “保存到相册”是唯一主按钮
- “重新生成”与“换风格”降级为次按钮
- `revisedPrompt` 只显示首行，作为图注，不侵入主图区域

#### Interaction

- 点击图片：`wx.previewMedia`
- 长按或按钮保存：`wx.saveImageToPhotosAlbum`
- 链接有效期提示固定展示：`24 小时内有效`

### C. `image-edit-card`

#### Ratio

`1:1`

#### Visual Structure

- 左右双栏对比，比例 `48 / 4 / 48`
- 中间是细分隔带，不使用粗箭头或大面积 Before/After 水印
- 左栏顶部标 `原图`，右栏顶部标 `编辑后`
- 底部单独一行展示 `editDescription`

#### Style Notes

- 原图栏保持低饱和边框，编辑后栏使用深棕描边强调结果完成态
- 结果说明区使用整行浅底块，避免文字直接压在图片下方显得杂乱
- “保存结果”是主按钮
- “重新编辑”是次按钮

#### Interaction

- 点击任一图片进入预览
- `editDescription` 支持两行截断，超出以省略表示
- 明示限制：`该结果为 AI 重生成效果，非像素级精修`

---

## Motion And State

### Loading State

- 使用浅底骨架屏，不使用闪烁强烈的骨架动画
- 文本卡片加载时先出现 `meta-rail` 和 `3-4` 行正文骨架
- 图片卡片加载时先出现正方形图框骨架和底部信息带骨架

### Result Transition

- 仅允许 `180ms - 240ms` 淡入
- 不使用缩放弹跳和卡片上浮动效
- 多图滚动时保持稳定，不做自动轮播

### Error State

- 错误卡片复用同一版式，只把主色切到低饱和棕红
- 错误信息区要明确给出 `失败原因 + 可重试动作`
- 不弹 `toast`，错误仍然走 `content/structuredContent`

---

## Dark Mode

### Dark Tokens

- 背景：`#171310`
- 卡片底：`#211A15`
- 主文本：`rgba(255, 248, 241, 0.92)`
- 次文本：`rgba(255, 248, 241, 0.52)`
- 边框：`rgba(239, 228, 214, 0.16)`
- 主强调：`#C39A73`

### Dark Mode Rules

- 不反转为纯黑高对比，保留暖黑底色
- 图片信息带从浅米色切换为深棕黑半透明底
- 主按钮改为 `#C39A73` 底 + `#171310` 字，避免暗底上继续用深棕按钮

---

## Compliance Mapping

### Atomic Component Constraints

- 宽高比仍严格使用白名单档位：文本 `4:3`，图片 `1:1`
- 圆角统一保持 `4px`
- 字号继续遵循 `17 / 15 / 12`
- 按钮文案维持动宾结构且不超过 `8` 字
- 交互只使用 `tap`
- 组件侧不直接调用 `wx.cloud.*`，仅用白名单交互 API

### MCP And Skill Consistency

- `mcp.json` 的组件声明不需要因视觉规范变更而重构协议
- `structuredContent` 应补足统一元信息字段，至少包括 `scene`、`model`、`status`
- 图片类建议增加 `expiresIn` 或 `expiresAt` 字段，支撑统一注释区

---

## Implementation Guidance

### Shared Style Layer

建议新增一个 AI 共享样式层，至少沉淀以下内容：

- `ai-card`
- `ai-meta-rail`
- `ai-tag`
- `ai-title`
- `ai-body`
- `ai-note`
- `ai-action-row`
- `ai-btn-primary`
- `ai-btn-secondary`

### Recommended File Strategy

- 共享 token：`skills/_shared/ai-design-tokens.wxss` 或同级公共样式文件
- 三个组件各自只保留布局差异，不重复定义颜色和按钮系统
- 所有 AI skill 的 `seed.js` 结构都应补足统一字段，便于预览模式完全复用同一 UI 语言

### Implementation Priority

1. 先重做 `text-result-card`，因为它最能验证排版体系是否成立。
2. 再做 `image-result-card`，统一图像信息带和动作区。
3. 最后做 `image-edit-card`，复用图片卡片样式并补充对比结构。

---

## Concrete Differences From The Current v3 Draft

- 保留你原方案里的合规参数，不动宽高比、按钮数、交互方式这些硬约束。
- 推翻“浅底 + 大圆角 + 渐变主按钮”的默认 demo 风格，改成编辑化排版。
- 把“模型、风格、有效期、usage”统一收进元信息带，不再散落在正文附近。
- 把文本卡片做成内容面板，而不是普通说明卡。
- 把图片卡片做成“图像 + 图注 + 动作”的三段式，而不是一张图下面堆按钮。

---

## Recommendation

这份规范适合作为 AI skill 的视觉基线，后续直接替换你 v3 方案里三张原子组件的“设计项”章节。功能设计不需要大改，但视觉语言应该整体换掉，不然实现出来还是会停留在现有 demo 质感。

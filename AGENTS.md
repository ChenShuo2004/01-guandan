# AGENTS.md

本项目当前是移动端优先的掼蛋训练原型。当前开放功能是开场页、记牌训练入口和记牌训练实例；牌局引擎作为记牌训练的内部实现使用。

当前产品不是完整课程平台、Daily Training App 或在线棋牌游戏大厅。后续规划不能写成当前已实现功能。

## Product Principles

1. 训练优先：当前页面优先展示牌局、关键牌和测试，而不是课程目录。
2. 记牌训练是当前唯一开放的用户训练流程。
3. 牌局由前端牌组件和规则引擎渲染，不能用图片替代准确牌面。
4. 内容、牌局状态和 UI 分离，练习案例放在 content/data。
5. 用户从开场页进入记牌训练，不默认进入 Daily Training。
6. 训练反馈必须短、清楚，并与当前牌局或记忆测试相关。
7. 未开放的课程、评估、路径和成长页面不得出现在当前入口和验收标准中。
8. AI Coach 当前是规则驱动的牌局提示能力，不是真实模型。

## Product Experience Rules

1. `docs/PRODUCT_EXPERIENCE_RULES.md` 是产品体验判断标准。
2. `docs/VISUAL_SYSTEM.md` 是视觉和 UI 组件判断标准。
3. 当页面设计与功能入口冲突时，优先保证 /practice 记牌训练闭环。
4. 当信息完整性与移动端行动效率冲突时，优先行动效率。
5. 当前使用规则驱动 Coach 体验，不接真实模型。

## Architecture Rules

1. 页面路由放在 `app`。
2. 页面文件只负责结构、数据读取和组件组合。
3. 复杂业务逻辑放入 `features`、`hooks` 或 `lib`。
4. 通用组件放在 `components`。
5. 课程、残局、专题和题目放在 `content` 或 `data`。
6. 类型定义放在 `types`。
7. AI、动画、素材、存储、校验等服务能力放在 `lib`。
8. 不要把课程文案、题目、素材路径和动画逻辑硬编码在页面中。

## Mobile First

1. 所有页面优先适配 `390px` 到 `430px` 手机宽度。
2. 桌面端只做响应式扩展，不改变核心移动端体验。
3. 页面布局以单列、卡片、底部导航和横向滑动区域为主。
4. 文案保持短句，避免大段连续文字。

## Poker Card Rules

1. 所有扑克牌牌面必须由 `PokerCard` 组件渲染。
2. 不允许使用 AI 图片生成准确牌面。
3. `PokerHand` 负责手牌排列、重叠和选中状态。
4. `CardTable` 负责四家位置和牌局布局。
5. 牌局动画必须操作前端牌组件，避免使用固定截图替代可控牌局。

## Content Rules

1. 课程使用 `Lesson` 和 `LessonStep` 数据结构。
2. 练习题使用 `Quiz` 或残局题结构。
3. 每个知识点控制在一分钟内完成。
4. AI 教练文案必须短、清楚、可控。
5. 课程短视频由用户后续自行提供，不进入自动生成流程。

## Asset Rules

1. 所有素材通过 `assetId` 引用。
2. 页面中禁止散落硬编码文件路径。
3. 生成素材必须登记到 Manifest。
4. 图片中的说明文字尽量由前端渲染，避免 AI 图片文字错误。
5. 原始 PNG 保留，网页端优先使用压缩后的 WebP。
6. V1 阶段所有图片和动画位置先使用占位资源。

## AI And Database Rules

1. V1 不接数据库、登录和真实 AI 接口。
2. 第一版学习进度、收藏和答题记录使用 `localStorage`。
3. 为 Supabase、AI 教练、图片识别和牌局分析预留 service 层。
4. AI 教练未来必须返回结构化结果，不允许直接输出无法控制的大段文本。

## Skill Usage Rules

1. V1 暂时不要调用图片生成 Skill。
2. V1 暂时不要调用动画 Skill。
3. 后续静态图片优先使用 GPT Image 2 Skill / image2skill。
4. 页面微交互使用 Framer Motion。
5. 复杂牌局时间轴后续再使用 GSAP。
6. 角色循环动作后续使用 Lottie 或 SVG。

## Git Workflow

1. 每完成一个独立功能后，检查项目是否可以正常运行。
2. 执行 lint、typecheck、build。
3. 如果全部通过，则生成一个清晰的 Git Commit。
4. Commit Message 使用 Conventional Commits：

```txt
feat: 新功能
fix: 修复 Bug
refactor: 重构
style: UI 调整
docs: 文档
chore: 配置修改
```

不要在存在编译错误时生成 Commit。--- project-doc ---

# 当前项目功能基线

本项目当前是移动端优先的掼蛋训练原型，当前开放功能以代码和可访问路由为准。

## 当前开放功能

1. /：OpeningScene 开场页，主按钮进入 /practice。
2. /practice：记牌训练入口。
3. /practice/[practiceId]：具体记牌训练，包含自动牌局、关键牌追踪和记牌测试。
4. 牌局引擎：由 MemoryTrainingExperience 以 observerMode 内部调用，不是独立开放路由。

## 当前产品定位

当前产品是两个独立训练模式：

- 记牌训练：训练用户观察和记忆关键牌。
- AI 牌局训练：训练用户的出牌判断和牌局操作。

当前不是完整课程平台、Daily Training App、在线棋牌游戏大厅或用户成长系统。

## 当前未开放能力

以下页面文件可能存在，但 middleware 会重定向到 /practice，因此不能视为当前可用功能：

- /assessment/*
- /coach
- /complete
- /growth-report/*
- /history
- /learning-path
- /lessons/*
- /paths
- /profile
- /design-system

当前也没有正式数据库、登录、云端同步、真实 AI API、在线多人对战、支付和完整训练历史。

## 架构规则

1. 页面路由放在 app。
2. 页面文件只负责结构、数据读取和组件组合。
3. 复杂业务逻辑放入 features、hooks 或 lib。
4. 通用组件放在 components。
5. 课程、题目、练习和训练内容放在 content 或 data。
6. AI 牌局使用 store/gameStore.ts 和 lib/guandan 规则模块。
7. 所有准确牌面必须由牌组件渲染，不使用 AI 图片生成牌面。
8. V1 的 Coach 使用规则驱动逻辑，不接真实模型。
9. 新功能必须先明确路由、入口、数据来源、状态管理和验收标准。
10. 不要把预留页面或规划能力写成已经实现。

## 修改前必须确认

处理新需求时，先判断它是否影响以下当前主流程：

~~~text
/ → /practice → /practice/[practiceId]
/practice/[practiceId] → GameArena observerMode → 记牌测试
~~~

每个独立功能完成后执行：

~~~bash
pnpm typecheck
pnpm lint
pnpm build
~~~

只有验证通过后，才创建 Conventional Commit。

# AGENTS.md

本项目是移动端优先的掼蛋 AI 学习平台。目标不是做文章站，而是做一个由 AI 教练、图片讲解、动态互动、学习路径和残局训练组成的学习工具。

## Product Principles

1. 图片优先：课程主体是牌局图、对比图、流程图和可控动画，文字只做必要解释。
2. 一个页面只讲一个知识点：标题、一句口诀、核心图解、错误示范、正确示范、小练习。
3. 学习路径代替文章目录：用等级和路径组织内容，而不是博客分类。
4. 内容、图片、动画和代码分离：课程内容必须由统一数据结构驱动。

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

不要在存在编译错误时生成 Commit。

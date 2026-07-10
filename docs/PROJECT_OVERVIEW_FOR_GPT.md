# 掼蛋 AI 成长训练 App：项目总体说明

> 本文档用于让 GPT、Claude 或其他 AI 编程助手快速理解本项目。
>
> 以当前代码为准。产品规划不等于已经实现的功能；规划与代码不一致时，优先相信代码和“当前状态”说明。

## 1. 项目定位

这是一个移动端优先的 AI 掼蛋成长训练 App，帮助用户通过每日短训练、牌局判断、残局练习、即时反馈和成长记录提升掼蛋能力。

它不是文章站、视频课程站、普通棋牌游戏大厅，也不是后台系统。

核心闭环：

~~~text
今日目标 → AI Coach 提示 → 学一个判断 → 完成牌局训练
→ 即时反馈 → XP / 等级 / 能力变化 → 下一次训练
~~~

产品原则：

- 图片和牌局优先，文字只解释必要信息。
- 一个页面尽量只讲一个知识点。
- 用学习路径和等级组织内容。
- 首页最终应是今日训练入口，而不是功能入口集合。
- 每次训练形成“学习 → 判断 → 反馈 → 成长”闭环。
- AI Coach 是核心引导者，不是装饰头像。
- V1 使用规则驱动 Coach，不接真实大模型。
- 准确牌面必须由前端牌组件渲染，不能依赖 AI 图片。
- 移动端优先，重点适配 390px 到 430px。
- 用户打开页面 5 秒内应知道今天做什么、为什么做、点击哪里开始。

## 2. 技术栈与运行方式

~~~text
框架：Next.js 14.2.23，App Router
语言：TypeScript 5.7.3
前端：React 18.3.1
样式：Tailwind CSS 3.4.17 + globals.css + CSS Modules
状态：React hooks、useReducer、自定义 hooks、localStorage
动画：Framer Motion、GSAP、@gsap/react、OGL
包管理：pnpm
前端：http://localhost:3000
后端：http://localhost:8000
数据库：V1 未接入真实数据库
真实 AI：V1 未接入模型 API
~~~

常用命令：

~~~bash
pnpm dev
pnpm dev:frontend
pnpm dev:backend
pnpm typecheck
pnpm lint
pnpm build
~~~

前端启动脚本会检查 3000 端口；端口被占用或 Next.js 尝试换端口时会主动退出。

## 3. 当前产品实现

项目有两条主要训练链路，尚未完全合并。

### 3.1 Daily Training：结构化学习闭环

~~~text
DailyTrainingPlan → 首页/训练推荐 → LessonExperience
→ PracticeExperience → Coach 反馈 → localStorage 进度
→ DailyTrainingResult
~~~

主要代码：

- content/daily-training/7-day-plan.ts：7 天训练计划。
- features/daily-training/daily-training.ts：今日训练、状态、完成、下一项逻辑。
- features/daily-training/DailyTrainingDashboard.tsx：每日训练展示。
- features/daily-training/DailyTrainingResult.tsx：完成结果。
- features/learning/LessonExperience.tsx：课程步骤体验。
- features/practice/PracticeExperience.tsx：轻量练习体验。
- lib/storage/progress-storage.ts：本地进度结构和合并逻辑。

当前状态：

- 已有 Daily Training 类型和 7 天计划。
- 已有课程、题目、练习的关联字段。
- 已有 XP、等级、连续训练、已完成内容、错题和薄弱能力字段。
- 主要使用 localStorage，未接登录、数据库或云同步。
- 这是最符合产品方向的主线，但首页入口、统一训练会话和完整复盘仍需完善。

### 3.2 Training Arena：可操作牌局训练场

~~~text
创建初始牌局 → 用户选牌/出牌/不出 → AI 自动行动
→ 规则校验 → Coach 即时提示 → 继续下一轮或结束
~~~

主要代码：

- app/training/page.tsx：训练场路由入口。
- features/training/TrainingArena.tsx：训练场功能包装。
- components/game/GameArena.tsx：训练场主要 UI 和交互。
- store/gameStore.ts：useReducer 牌局状态和动作。
- lib/guandan/：掼蛋牌、牌型、比较、牌局状态、引擎和回合管理。
- lib/ai/：规则型 AI 出牌策略。
- lib/coach/：Coach 提示、分析、错误检测和反馈类型。
- components/game/：牌桌、手牌、玩家位置、操作栏、AI 思考和反馈。

当前状态：

- 可以渲染牌局、手牌和玩家位置。
- 用户可以选牌、整理手牌、出牌、不出、请求提示和查看方案。
- AI 可以自动行动。
- 牌型合法性和出牌比较由代码处理。
- Coach 会根据牌局和用户动作给出规则驱动反馈。
- 牌局完成后还没有完全接入统一的 TrainingSession、Review 和成长记录链路。

### 3.3 两条链路的差异

~~~text
Daily Training：课程、题目、进度、结果闭环较清晰，适合 MVP 主产品
Training Arena：可操作牌局能力较强，但 session、复盘、成长写入不完整
~~~

后续应让两者共享统一训练会话模型，而不是继续维护两套互不关联的完成逻辑。

## 4. 当前路由

| 路由 | 用途 | 当前状态 |
|---|---|---|
| / | OpeningScene / 首屏入口 | 已有入口场景 |
| /practice | 训练首页/训练营入口 | 当前主要可见入口 |
| /practice/[practiceId] | 具体练习 | 需继续结合练习数据 |
| /training | Training Arena | 已有可操作牌局 |
| /assessment/start | 能力测评开始 | 页面存在，被 middleware 隐藏 |
| /assessment/session/[id] | 能力测评答题 | 页面存在，被 middleware 隐藏 |
| /assessment/result/[id] | 测评结果 | 页面存在，被 middleware 隐藏 |
| /growth-report/[id] | 成长报告 | 页面存在，被 middleware 隐藏 |
| /learning-path | 学习路径 | 页面存在，被 middleware 隐藏 |
| /paths | 路径页 | 页面存在，被 middleware 隐藏 |
| /lessons/[lessonId] | 课程体验 | 页面存在，被 middleware 隐藏 |
| /complete | 每日训练完成页 | 页面存在，被 middleware 隐藏 |
| /coach | Coach/能力测评入口 | 页面存在，被 middleware 隐藏 |
| /profile | 能力画像和成长数据 | 页面存在，被 middleware 隐藏 |
| /history | 训练历史 | 当前偏静态 |
| /design-system | 设计系统展示 | 开发辅助页面 |

重要：middleware.ts 会把以下前缀重定向到 /practice：

~~~text
/assessment /coach /complete /design-system /growth-report
/history /learning-path /lessons /paths /profile
~~~

页面文件存在，不代表运行时能直接访问。调试这些页面前先检查 middleware.ts。

## 5. 目录职责

~~~text
app/                 Next.js App Router 路由和页面组合
components/          通用 UI、布局、Coach、牌、牌桌和动效
features/            按业务域组织的页面级功能
lib/                 规则、AI、Coach、训练规划、成长分析、资源和存储
store/               主要是 Training Arena 的 gameStore
types/               跨模块 TypeScript 类型
content/             手写课程、题目、案例、训练计划和 Coach 内容
data/                结构化 JSON 数据
public/assets/       浏览器可访问的图片、牌面和训练素材
assets/manifests/    图片/动画资源清单
database/            数据库预留目录
backend/             极简 Node 后端占位服务
scripts/             数据同步、内容构建和启动脚本
docs/                产品、视觉、架构、Coach 和内容文档
~~~

架构约束：

- 路由放 app。
- 页面只负责结构、取数和组件组合。
- 复杂业务逻辑放 features、hooks 或 lib。
- 课程、题目、案例和训练计划放 content 或 data。
- 牌面必须由 PokerCard、PokerHand 等组件渲染。
- 页面不要散落硬编码图片路径，优先使用 assetId 和 Manifest。
- 新功能保持数据、UI、业务逻辑分离。

## 6. 核心数据模型

### Lesson

定义在 types/lesson.ts，字段包括：

~~~text
id, title, category, level, pathId, coverAssetId,
slogan, duration, experience, tags, steps, quiz
~~~

LessonStep 支持 coach、image、poker-case、comparison、quiz。

### Quiz

定义在 types/quiz.ts，字段包括：

~~~text
id, question, options, correctOptionId, coachFeedback
~~~

正确和错误反馈都是结构化 CoachResponse，前端负责渲染。

### Daily Training

定义在 types/DailyTraining.ts：

~~~text
id, day, theme, title, lessonId, practiceId,
rewardExperience, ability, coachTip
~~~

状态包括 locked、available、completed。

### 用户进度

定义在 types/progress.ts 和 types/UserState.ts，包括：

- 等级、经验和连续训练天数。
- 已完成课程、练习和 Daily Training。
- 收藏课程和练习。
- 错题 ID。
- 今日训练状态和最近学习记录。
- 薄弱能力。

### Training Arena 状态

由 lib/guandan/gameState.ts 定义、store/gameStore.ts 通过 reducer 管理，包括：

- 玩家及其手牌。
- 当前回合和出牌权。
- 已出的牌和当前轮牌型。
- 用户选中的牌。
- 牌局状态和训练阶段。
- Coach 反馈、提示、计时和动画状态。

## 7. AI Coach 与牌局引擎

V1 的 AI Coach 是规则驱动，不调用模型 API。

主要模块：

~~~text
lib/coach/coachTypes.ts       类型和反馈协议
lib/coach/CoachAnalyzer.ts    牌局提示和建议
lib/coach/DecisionEngine.ts   决策逻辑
lib/coach/MistakeDetector.ts  用户错误检测
components/coach/*            通用 Coach UI
components/game/Coach*        牌局内 Coach UI
~~~

Coach 当前负责：

- 推荐今日训练。
- 解释当前知识点。
- 检测高风险或低效率动作。
- 根据牌局状态推荐出牌。
- 对正确、错误、提示、复盘和完成状态给出短反馈。

推荐输出结构：

~~~text
先给判断
再说明原因
最后给下一步
~~~

未来接真实 AI 时，应返回结构化结果，例如：

~~~text
{ type, level, message, reason, suggestion, recommendedCards }
~~~

不要让 AI 直接生成牌面，也不要让前端直接渲染不受约束的长文本。

掼蛋引擎位于 lib/guandan/：

~~~text
card.ts          牌、花色、点数、排序
deck.ts          牌堆、洗牌、发牌
cardRule.ts      牌型识别和合法性
cardCompare.ts   牌型比较和压制判断
gameState.ts     牌局状态模型
gameEngine.ts    出牌、不出、回合推进
turnManager.ts   下一个行动玩家
player.ts        玩家模型
catalog.ts       牌型或内容目录
~~~

准确牌面必须复用：

~~~text
components/cards/PokerCard.tsx
components/cards/PokerHand.tsx
components/cards/CardSelector.tsx
components/game/GameTable.tsx
components/game/HandCards.tsx
~~~

## 8. 内容、资源和存储

主要内容目录：

~~~text
content/lessons/          示例课程
content/quizzes/          示例题目
content/cases/            练习案例
content/daily-training/   7 天训练计划
content/assessment/       能力测评案例
content/paths/            学习路径
content/guandan-system/   掼蛋知识库和同步内容
data/guandan/             courses/questions/path/assets JSON
~~~

素材规则：

- 页面尽量通过 assetId 引用素材。
- 原始 PNG 保留，网页优先使用 WebP。
- 新增素材登记到 Manifest。
- 图片说明文字尽量由前端渲染。
- V1 暂不调用图片生成和动画生成 Skill。
- 课程短视频由用户后续自行提供，不自动生成。

V1 进度主要保存到浏览器 localStorage，核心 key：

~~~text
guandan-ai-coach-progress
guandan-training-arena-settings
assessment store
intro visited state
~~~

当前没有登录、云端同步、正式数据库、真实 AI API 或完整后端业务 API。backend/server.mjs 当前只提供：

~~~text
GET /health → { status: "ok" }
~~~

## 9. 已知问题和架构风险

1. 两套训练模型尚未统一。Daily Training 使用 lessonId、practiceId 和用户进度；Training Arena 使用自己的 game reducer。
2. Training Arena 缺少正式复盘链路：TrainingSession → Review → GrowthReport → Progress。
3. middleware 会隐藏很多已有页面。
4. content/guandan-system、content/lessons、data/guandan 有相近内容，需要明确原始源和生成产物。
5. components/cards 与 components/game 存在牌组件职责重叠；Coach 也有通用版和 game 版。
6. 测试覆盖不足，优先补牌型识别、牌型比较、回合推进、AI 合法性、Coach 错误检测、streak 和 localStorage 合并。
7. 部分历史文档或文案存在中文乱码迹象；新文件统一使用 UTF-8，避免批量重写旧文件。

## 10. 推荐开发优先级

1. 明确并修复主入口和 middleware 路由策略。
2. 把 Daily Training 做成可完整体验的 MVP 主线。
3. 统一 TrainingSession，让课程练习和 Training Arena 都能记录训练事件。
4. 增加统一 Review 页面，把动作、错误、Coach 反馈和成长写入进度。
5. 将首页、Lesson、Practice、Result、Profile 串成稳定闭环。
6. 补充牌局规则、训练逻辑和进度逻辑的自动化测试。
7. 再考虑真实 AI、数据库、登录和云同步。

基础问题未解决前，不要优先做复杂动画、支付或大规模内容扩展。

## 11. 给 GPT 的协作规则

1. 先读取 AGENTS.md、本文件和相关领域文档。
2. 判断请求属于产品、页面、内容、牌局规则、Coach、进度还是基础设施。
3. 修改前定位真实代码和调用链，不要只根据文件名猜。
4. 做最小改动，不要无理由重构全项目。
5. 新增课程或题目优先改数据，不要把文案硬编码到页面。
6. 新增牌面优先复用牌组件，不要生成图片牌面。
7. 新增 Coach 反馈优先复用结构化反馈类型。
8. 不要在 V1 擅自接入真实数据库、登录、模型 API 或图片生成。
9. 完成后运行：

~~~bash
pnpm typecheck
pnpm lint
pnpm build
~~~

10. 只有检查通过后才创建 Conventional Commit，例如 feat:、fix:、refactor:、docs:。

## 12. 可直接发给新 GPT 的开场提示词

~~~text
你现在要协助我开发一个“掼蛋 AI 成长训练 App”。

请先阅读项目中的 AGENTS.md 和 docs/PROJECT_OVERVIEW_FOR_GPT.md，再开始回答或修改代码。

项目技术栈是 Next.js 14 App Router、React 18、TypeScript、Tailwind CSS。产品是移动端优先的 AI Coach 掼蛋训练工具，不是文章站或普通棋牌游戏大厅。V1 不接真实 AI、数据库、登录和图片生成；进度使用 localStorage，Coach 使用规则驱动逻辑。

请始终区分：
1. 当前代码已经实现的能力；
2. 产品文档中的规划；
3. 这次任务需要新增的能力。

修改代码前请先定位实际调用链，遵循最小改动和数据驱动原则。课程和题目放在 content/data，业务逻辑放在 features/lib，通用组件放在 components，牌面必须由牌组件渲染。完成后运行 pnpm typecheck、pnpm lint、pnpm build，并说明验证结果。
~~~

## 13. 相关文档

- AGENTS.md：项目协作、产品和编码总规则。
- docs/ARCHITECTURE.md：原有架构分析和风险记录。
- docs/PRODUCT_EXPERIENCE_RULES.md：产品体验判断标准。
- docs/VISUAL_SYSTEM.md：视觉系统和 UI 规范。
- docs/CONTENT_PIPELINE.md：内容和素材流水线。
- docs/SKILL_ROUTING.md：图片、动画和其他 Skill 的使用边界。
- docs/coach/：AI Coach 的设计、角色和 UI 规则。
- docs/design/：训练场、游戏 UI 和视觉设计文档。


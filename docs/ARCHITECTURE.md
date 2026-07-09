# AI 掼蛋训练项目架构

## 1. 项目介绍

本项目是一个移动端优先的 AI 掼蛋训练产品，当前形态已经从课程站雏形升级为训练 App 雏形。

真实代码中存在两条主要产品线：

1. Daily Training 闭环：首页推荐今日训练，进入 Lesson，完成 Practice，写入本地进度，进入完成页。
2. Training Arena 闭环：进入实时牌桌训练场，用户选牌、出牌、过牌，AI 玩家自动行动，Ace Coach 基于规则给出反馈。

当前项目可以继续开发，但两条训练线还没有完全合并。Daily Training 使用结构化内容和 localStorage，Training Arena 使用独立 reducer 和随机牌局，二者之间的 trainingId、practiceId、lessonId 还没有形成统一的训练会话模型。

## 2. 技术栈

```txt
Framework: Next.js 14.2.23 App Router
Language: TypeScript 5.7.3
UI: React 18.3.1
Styling: Tailwind CSS 3.4.17 + 全局 CSS + 局部 CSS module
State: React hooks、useReducer、自定义 hooks、本地 localStorage
Data: 本地 TS/JSON 内容、public/assets 静态资源、localStorage 进度
Animation: Framer Motion、GSAP、@gsap/react、OGL
Build: pnpm + next build
Deployment: 已有 Vercel 配置痕迹，当前未发现正式部署配置文档
Backend: backend/server.mjs 轻量 Node 服务脚本，V1 主流程未依赖真实后端
```

验证结果：

```txt
pnpm typecheck: passed
pnpm build: passed
```

## 3. 项目目录结构

```txt
app/
  Next.js App Router 页面。页面整体较薄，多数页面负责引入 feature 或 AppShell。

components/
  通用 UI、布局、Coach、扑克牌、游戏牌桌、特效组件。当前包含通用组件和业务组件混合。

features/
  按业务域组织的页面级功能，包括 assessment、daily-training、learning、practice、progress、training。

lib/
  核心业务能力和服务能力，包括 guandan 规则、AI 玩家、Coach 规则、训练规划、评估、资源映射、存储。

store/
  当前只有 gameStore.ts，使用 useReducer 管理 Training Arena 状态。

types/
  跨模块类型定义，包括 lesson、practice、progress、coach、poker、assessment、training-session。

content/
  课程、题目、Daily Training、资产引用等结构化内容。

data/
  从掼蛋资料生成的 JSON 数据，包括 courses、questions、learning-path、assets。

public/
  前端可直接访问的静态资源，包括 Coach、训练场、牌面 SVG、课程图片、PDF 页面导出图。

assets/
  源素材 manifest，主要用于素材登记。

docs/
  产品、视觉、Coach、训练场、内容管线等文档。当前文档内容有明显中文编码损坏。

backend/
  轻量后端脚本，当前不是主产品闭环的核心依赖。

database/
  本地训练记录草稿，当前未接真实数据库。
```

目录职责总体清晰，但存在三类扩展风险：

1. `components/game` 与 `components/cards` 都有 PlayingCard/CardHand 类组件，命名和职责容易重复。
2. `content/guandan-system` 与 `data/guandan` 内容来源相近，后续需要明确谁是源数据、谁是生成产物。
3. `training/` 顶层目录与 `features/training`、`lib/training` 并存，未来容易混淆训练业务、训练页面和训练会话模型。

## 4. 页面架构

当前主要页面：

```txt
/
  OpeningHero + AppShell + DailyTrainingDashboard

/assessment/start
  AssessmentStart

/assessment/session/[id]
  AssessmentSessionView

/assessment/result/[id]
  AssessmentResultView

/growth-report/[id]
  GrowthReportView

/learning-path
  GuandanLearningPath

/paths
  LearningPathView

/lessons/[lessonId]
  GuandanCourseDetail 或 LessonExperience

/practice
  TrainingCampLanding

/practice/[practiceId]
  GameArena

/training
  GameArena

/complete
  DailyTrainingResult

/coach
  AssessmentStart

/history
  静态训练记录 UI

/profile
  静态/规则驱动能力画像 UI

/design-system
  设计系统展示页
```

当前真实用户流程：

```txt
Home
 |
 |-- 未测评用户 --> Assessment Start --> Assessment Session --> Assessment Result --> Growth Report --> Learning Path
 |
 |-- 今日训练 --> Lesson --> PracticeExperience --> Complete
 |
 |-- 直接训练 --> Practice Landing --> Training Arena
 |
 |-- 专项训练 --> Training Arena
```

目标闭环与实际差异：

```txt
目标：进入产品 -> 选择训练 -> 开始训练 -> AI反馈 -> 复盘 -> 成长

现状：
进入产品 -> Daily Training -> Lesson -> Practice -> Coach反馈 -> Progress -> Complete
进入产品 -> Training Arena -> 出牌/AI行动 -> Coach反馈 -> 当前缺少正式 Review/Growth 写入
```

当前缺少独立的 `/review/[sessionId]` 或统一复盘页面。`/history` 是静态 UI，`/complete` 是 Daily Training 结果页，Training Arena 完成后没有把完整 session 写入成长系统。

## 5. 组件架构

通用组件：

| 组件 | 现状 | 风险 | 建议 |
| --- | --- | --- | --- |
| Button | 已有基础封装，支持 href/onClick/variant | 视觉体系与部分页面手写按钮不统一 | 后续逐步收敛页面内手写按钮 |
| Card/GlowCard | 有基础卡片和强化卡片 | 页面大量直接写 Tailwind 卡片 | 保留轻量封装，避免过早复杂设计系统 |
| Badge/Progress | 已有 Badge、AnimatedProgress、ProgressBar | 进度组件分散 | 明确 XP、能力、任务三类 Progress 用法 |
| AppShell/BottomNavigation | 已有布局骨架 | 部分页面绕过 AppShell，如 Training Arena | Training Arena 可以例外，但普通页面应统一 |

业务组件：

| 组件 | 问题 | 风险 | 建议 |
| --- | --- | --- | --- |
| GameArena | 组件超过 26KB，包含布局、计时器、设置、弹窗、训练等级、Coach 展示 | 后续加复盘、规则集、session 会继续膨胀 | 拆出 `ArenaController`、`ArenaPanels`、`ArenaSettings` |
| store/gameStore | reducer 已集中核心交互，但文案、Coach反馈和状态变更混在一起 | AI Coach 结构化升级时迁移成本高 | 保留 reducer，逐步把 Coach 文案规则迁出 action 分支 |
| PokerCard/PokerHand | 符合牌面组件化原则 | 与 components/game/PlayingCard 有重复 | 统一扑克牌渲染入口，避免两套牌面规范 |
| CoachBubble/CoachAvatar | 已分 coach 与 game 两套组件 | Coach 状态语义不统一 | 统一到 `CoachMessage` 或 `CoachFeedback` 协议 |
| PracticeExperience | Daily Training 闭环清晰 | 与 GameArena 是两套练习体验 | 保留作为轻量题型，后续由 TrainingSession 编排 |
| DailyTrainingDashboard | 首页目标明确 | 依赖 assessment、progress、daily-training 多处状态 | 后续用 `TrainingRecommendation` 聚合状态 |

## 6. 数据流设计

当前数据来源：

```txt
content/daily-training
  7 天训练计划

content/lessons
  手写 sample lessons

content/cases
  手写 sample practice

data/guandan
  课程、题目、路径、资源 JSON

public/assets
  图片、牌面 SVG、训练场资源

localStorage
  guandan-ai-coach-progress
  guandan-training-arena-settings
  assessment store
  intro visited state
```

Daily Training 数据流：

```txt
content/daily-training
 -> features/daily-training/daily-training.ts
 -> DailyTrainingDashboard
 -> LessonExperience
 -> PracticeExperience
 -> useProgress
 -> localStorage
 -> DailyTrainingResult
```

Training Arena 数据流：

```txt
createInitialGameState
 -> useGameStore reducer
 -> GameArena
 -> GameTable / HandCards / ActionToolbar
 -> lib/guandan playCards/passTurn
 -> lib/ai AIPlayer
 -> lib/coach CoachAnalyzer/MistakeDetector
 -> UI feedback
```

主要问题是两条数据流没有共享 TrainingSession。`/practice/[practiceId]` 当前没有读取 practiceId，直接进入 GameArena；`/training?level=beginner` 的 level 参数也没有真正驱动初始牌局或题目。

## 7. AI Coach 架构

当前 AI Coach 是规则驱动，没有接真实模型，符合 V1 边界。

已存在模块：

```txt
lib/coach/coachTypes.ts
lib/coach/CoachAnalyzer.ts
lib/coach/DecisionEngine.ts
lib/coach/MistakeDetector.ts
components/coach/*
components/game/Coach*
```

当前 Coach 能力：

1. 根据当前牌局状态生成提示。
2. 根据用户选择检测早炸、忽略危险玩家、低效率出牌。
3. 根据手牌和上一手牌推荐出牌。
4. 在完成/复盘相关模块中生成静态成长反馈。

主要风险：

1. Coach 文案和规则逻辑耦合在 reducer 与 analyzer 中。
2. `CoachFeedback` 还不是未来真实 AI 可复用的统一结构。
3. `state/action/placement/source` 等字段在文档中提出，但代码尚未统一落地。

建议方向：

```txt
用户行为
 -> TrainingSession event
 -> GameEngine state
 -> CoachRuleEngine
 -> CoachMessage
 -> UI renderer
```

## 8. 掼蛋训练系统架构

已具备的牌局能力：

1. `lib/guandan/card.ts`：牌、花色、点数、排序、展示标签。
2. `lib/guandan/deck.ts`：创建牌堆、洗牌、发牌。
3. `lib/guandan/cardRule.ts`：牌型判断。
4. `lib/guandan/cardCompare.ts`：是否能压过上一手。
5. `lib/guandan/gameState.ts`：训练场状态模型。
6. `lib/guandan/gameEngine.ts`：选牌、出牌、过牌、回合推进。
7. `lib/guandan/turnManager.ts`：下一个行动玩家。
8. `lib/ai/*`：简单 AI 出牌策略。

当前还不足的能力：

1. 没有 ruleset 层，掼蛋规则版本不可配置。
2. 没有 TrainingSession 实例持久化，训练完成后无法完整复盘。
3. 没有题目 case 到牌局 state 的统一转换器。
4. 没有正式 Review 页面消费 game history。
5. 没有自动测试覆盖牌型、比较、回合推进、Coach 规则。

训练系统现状：

```txt
DailyTrainingPlan: 已有
Lesson: 已有
PracticeCase: 已有
Assessment: 已有
GameArena: 已有
ReviewSession: 缺失
TrainingSession: 类型有雏形，但未成为核心编排层
DifficultyAdjuster/TrainingPlanner: 有规则模块，但接入有限
```

## 9. 资源管理

当前资源包括：

```txt
public/assets/poker-cards
public/assets/coach
public/assets/arena
public/assets/learning-path
public/assets/training-camp
public/assets/guandan
assets/manifests
content/assets
lib/assets/image-assets.ts
lib/cards/cardAssets.ts
```

优点：

1. 扑克牌牌面已有 SVG 资源和 `PokerCard`/`PokerHand` 组件。
2. Coach、Arena、Learning Path 已有静态图片资源。
3. 已有 manifest 思路，符合文档中的素材登记方向。

风险：

1. 页面中仍存在较多硬编码图片路径。
2. `assetId` 并未覆盖所有资源引用。
3. `public/assets/pdf/guandan-160/pages` 体量很大，后续需要明确是否属于源素材、内容素材还是构建产物。

## 10. 当前限制

1. 中文内容和文档存在明显编码损坏，影响产品展示、SEO、文档可信度和后续内容维护。
2. 构建可通过，但用户可见文案大量乱码。
3. 训练场是可交互 Demo，但还不是由具体训练任务驱动的训练系统。
4. Daily Training 与 Training Arena 是并行体验，还没有统一会话模型。
5. 评估、成长报告、学习路径已有页面，但真实数据持久化仍偏本地和静态。
6. 后端脚本存在，但主流程未形成 API/service/repository 边界。
7. 缺少测试体系，尤其是牌型规则、出牌比较、回合推进和 Coach 规则。
8. UI 视觉存在两套方向：浅色 Daily Training 页面与深色/蓝色 Training Arena 并存。

## 11. 后续扩展方向

优先级建议：

1. 修复中文编码和用户可见文案，这是产品可信度问题。
2. 建立统一 `TrainingSession` 模型，串起 Daily Training、Practice、GameArena、Review、Progress。
3. 让 `/practice/[practiceId]` 真正读取 practiceId，并把 case 转成训练场初始状态。
4. 新增 Review/Growth 写入链路，让 Training Arena 结束后进入复盘和成长。
5. 抽出 CoachMessage 协议，区分规则来源、AI 来源、静态内容来源。
6. 为 `lib/guandan` 增加单元测试，先覆盖牌型、比较和回合推进。
7. 收敛扑克牌组件和 Coach 组件，减少重复实现。
8. 继续保持 V1 不接真实 AI、不接数据库、不做重动画，先把训练闭环做扎实。

当前不建议投入的方向：

1. 不要先做 Supabase、登录、付费。
2. 不要先做真实 AI 大模型分析。
3. 不要先做复杂 3D、Lottie 或大型动画。
4. 不要先大规模重构视觉系统。
5. 不要为了架构洁癖拆太多抽象，先围绕训练闭环补关键边界。

# 项目审计报告

> 审计日期：2026-07-10  
> 审计范围：仓库目录、App Router 页面、组件、features、hooks、utils、services（仓库中无独立 `services/`）、lib、store、content/data、assets/public、styles、docs、脚本、配置、环境变量文件名与本地 Git 配置。  
> 审计方式：静态文件与引用关系扫描、路由和 middleware 核查、配置与清单核查、Git 跟踪文件大小核查。按授权未清理、未重构、未安装依赖、未构建、未修复、未提交，也未执行 GitHub/Vercel 写操作。  
> 结论边界：本报告中的“可以删除”是下一阶段候选，不代表本阶段已删除。凡存在产品规划、生成脚本、清单、动态资源路径或预留路由依赖的项目均放入“待确认”。

## 审计摘要

- 当前产品基线与 `AGENTS.md` 一致：公开闭环只有 `/ → /practice → /practice/[practiceId]`；具体训练由 `MemoryTrainingExperience` 以 `observerMode` 嵌入 `GameArena`。
- middleware 明确拦截 assessment、coach、complete、design-system、growth-report、history、learning-path、lessons、paths、profile。它们是可编译但不可访问的预留页面，不能算当前开放功能。
- 当前核心链路结构清楚，但仓库同时保留了课程平台、Daily Training、测评、成长系统、旧训练场和旧 UI 等多代实现，静态引用图中存在一批无入边组件。
- 最高优先级风险是 `.env.local` 中存在真实格式的 Vercel OIDC token。文件已被 `.gitignore` 忽略、未被 Git 跟踪，但该凭据已经落盘，应立即在 Vercel 侧撤销/轮换，不能仅依赖忽略规则。
- 记忆训练存在一个需尽快验证的计数问题：`calculateCorrectAnswers` 对“小王”和“大王”分别返回“所有已见王的总数”，而不是分别按 rank 计数，可能导致两个答案永远相同。
- 工作区在审计开始前已有大量修改、删除和未跟踪产物。本阶段只新增本报告，没有处理或覆盖这些既有改动。

## 当前项目结构

### 技术栈

- Next.js 14.2 App Router、React 18、TypeScript 5.7，严格模式开启。
- Tailwind CSS 3 + `app/globals.css`；PostCSS + Autoprefixer。
- 动画：Framer Motion；开场文字使用 GSAP、`@gsap/react`、ScrollTrigger/SplitText。
- WebGL：`ogl`，但仅出现在当前无入边的 `CircularGallery` 和 `SideRays`。
- 状态：核心牌局使用 React `useReducer` 封装为 `store/gameStore.ts`；训练流程在 `MemoryTrainingExperience` 内使用 React state/ref；无 Zustand/Redux。
- 持久化：当前公开链路只保存 `guandan-training-arena-settings` 到 localStorage；训练成绩和记忆训练会话未持久化。预留 assessment/progress 功能另有 localStorage hook。
- 后端：`backend/server.mjs` 是 Node HTTP 健康检查占位服务，仅 `/health`，由 `dev:backend` 脚本显式引用；当前前端公开链路没有 API 调用。
- 测试：仅 `lib/memory/ObserverMemoryTraining.test.ts`，由 `test:memory` 脚本显式引用；没有 Jest/Vitest/Playwright 配置。
- 包管理：pnpm，workspace 仅包含根目录。

### 目录职责

- `app/`：App Router 页面、布局和全局样式。
- `components/`：牌面、牌桌、记忆训练面板、场景、布局和旧 UI 组件。
- `features/practice/`：当前训练入口与记忆训练编排。
- `features/assessment|daily-training|learning|progress/`：被 middleware 拦截的预留产品功能。
- `store/gameStore.ts`：牌局 reducer、用户出牌、AI 行动、规则驱动 Coach。
- `lib/guandan/`：牌、牌组、发牌、牌型、比较、回合推进和牌局状态核心。
- `lib/ai/`、`lib/coach/`：规则驱动 AI 玩家和 Coach，不是真实模型。
- `lib/memory/`：当前 observer 记忆训练及一套较早的 CardTracker/Question/Report 管线。
- `content/`、`data/`：练习、课程、测评、Daily Training、学习路径和生成内容。
- `assets/manifests/`、`public/assets/`：素材清单和公开静态资源。
- `training/`、`knowledge/`、`mistakes/`、`database/`：领域预留或旧训练数据结构。
- `scripts/`：前端开发服务和掼蛋课程数据构建/同步脚本。
- `docs/`：架构、产品体验、原型和代码说明；`AGENTS.md` 所称 `docs/VISUAL_SYSTEM.md` 实际不存在。

### 当前开放页面/路由

1. `/`
   - `app/page.tsx` → `components/scene/OpeningScene.tsx`
   - 主入口链接到 `/practice`。
2. `/practice`
   - `app/practice/page.tsx` → `features/practice/PracticeHome.tsx`
   - 当前只有一个入口，链接固定训练 id `practice-when-to-bomb-001`。
3. `/practice/[practiceId]`
   - 通过 `content/cases/sample-practice.ts` 校验 id 并生成静态参数。
   - 所有合法 id 最终都渲染同一个 `MemoryTrainingExperience`，没有把对应 `PracticeCase` 传入体验组件。

### middleware 拦截的预留页面

以下页面文件存在且会参与类型检查/构建，但请求会重定向到 `/practice`：

- `/assessment/start`
- `/assessment/session/[id]`
- `/assessment/result/[id]`
- `/coach`
- `/complete`
- `/design-system`
- `/growth-report/[id]`
- `/history`
- `/learning-path`
- `/lessons/[lessonId]`
- `/paths`
- `/profile`

这些页面及其依赖不能仅以“用户访问不到”为由直接删除；应先决定是永久下线还是保留规划，再成组处理。

### 核心模块与数据流

```text
OpeningScene
  → /practice
  → PracticeHome
  → /practice/[practiceId]
  → MemoryTrainingExperience
      ├─ GameArena(observerMode)
      │   └─ useGameStore
      │       ├─ createInitialGameState
      │       ├─ gameEngine / cardRule / cardCompare / turnManager
      │       ├─ AIPlayer / strategy
      │       └─ CoachAnalyzer / MistakeDetector / DecisionEngine
      └─ ObserverMemoryTraining
          ├─ 目标牌生成与观察阶段
          ├─ 监听 GameEngineState.history
          ├─ checkpoint 触发与判分
          ├─ 错误事件反馈
          └─ 局末难度调整与会话总结
```

- `GameArena` 负责 UI 编排、发牌动画、横竖屏/全屏、AI 倒计时、牌桌、手牌与操作条。
- `store/gameStore.ts` 是牌局状态变更中心；用户和 AI 最终都调用 `playCards`/`passTurn`。
- `GameTable` → `PlayerSeat`/`PlayerInfo` + `PlayedCards`；`HandCards` → `CardHand`/`CardGroup` → `components/cards/PlayingCard`。
- 已出牌使用 `components/game/PlayingCard`，手牌使用 `components/cards/PlayingCard`；二者最终都围绕 `PokerCard`/牌图资源工作，形成重复实现。
- `PokerCard` 通过 `lib/cards/cardAssets.ts` 生成确定性图片路径，符合“牌面必须由前端牌组件渲染”的规则。
- `MemoryTrainingExperience` 读取牌局 history，维护目标牌、可见牌、checkpoint、反馈和总结；结果当前只存在内存中。

## 可以删除（文件/路径/原因，并标注证据与置信度）

以下均为候选，尚未删除。

### 生成/诊断产物

1. `.next-dev/`
   - 原因：Next.js 开发构建缓存，`next.config.mjs` 明确将开发 distDir 指向此目录。
   - 证据：被 `.gitignore` 和 `.vercelignore` 忽略；不属于源码输入。
   - 置信度：高。
2. `.cursor/debug-1218cb.log`
   - 原因：IDE 调试日志。
   - 证据：匹配 `*.log` ignore 规则；无源码/配置引用。
   - 置信度：高。
3. `build_output.txt`、`lint_output.txt`、`typecheck_output.txt`
   - 原因：未跟踪的命令输出快照。
   - 证据：不在 Git 索引；全仓静态引用未发现消费者。
   - 置信度：高。
4. `artifacts/`
   - 原因：未跟踪审计/运行产物目录。
   - 证据：不在 Git 索引；没有源代码引用。
   - 置信度：高，但删除前仍应人工确认目录内没有要留存的截图或验收证据。

### 无入边 UI/效果组件

下列文件在 TS/TSX/JS/MJS、路由、配置、JSON 和文档的静态搜索中没有调用方；相关 CSS 只被同组组件自身引用：

- `components/effects/CircularGallery.tsx`
- `components/effects/CircularGallery.module.css`
- `components/effects/SideRays.tsx`
- `components/effects/SideRays.css`
- `components/practice/LanyardCard.tsx`
- `components/cards/CardSelector.tsx`
- `components/ui/MagicBento.tsx`
- `components/ui/MasonryAnimation.tsx`
- `components/ui/RankFrame.tsx`
- `components/ui/ShinyText.tsx`
- `components/game/AIThinking.tsx`
- `components/game/ActionButtons.tsx`
- `components/game/CardSort.tsx`
- `components/game/CoachAvatar.tsx`
- `components/game/CoachBubble.tsx`
- `components/game/CoachFeedback.tsx`
- `components/game/ScorePanel.tsx`
- `components/game/TurnTimer.tsx`

证据：

- 没有静态 import/export/require/dynamic import 指向这些模块。
- 没有 App Router 页面、middleware、Tailwind content 配置、package script 或素材清单按模块名引用。
- 仓库为 private 应用而非对外发布组件包，没有公开 package exports。

置信度：高（静态引用层面）。如果未来通过外部脚本复制源码、Storybook（当前不存在）或未提交分支消费，则需在删除前复查。

### 整组旧开场组件

- `components/intro/OpeningHero.tsx`
- `components/intro/CoachReveal.tsx`
- `components/intro/IntroTitle.tsx`

原因：当前 `/` 使用 `components/scene/OpeningScene.tsx`；`OpeningHero` 无入边，另外两个文件只被 `OpeningHero` 内部引用。  
证据：路由和全仓 import 图中不存在到 `OpeningHero` 的入边；`OpeningScene` 直接使用 `SplitText` 和 `SceneBackground`。  
置信度：高。

### 条件性依赖候选

- `ogl`
  - 原因：只由上述无入边的 `CircularGallery` 和 `SideRays` 引用。
  - 证据：全仓第三方 import 扫描未发现其他 `ogl` 使用。
  - 置信度：高，但必须与两个效果组件同一阶段移除，不能单独先删依赖。

## 建议合并（文件/原因）

1. `components/cards/PlayingCard.tsx` 与 `components/game/PlayingCard.tsx`
   - 两者都负责把 `lib/guandan` 的 `Card` 转为可视牌面；当前一个服务手牌，一个服务桌面已出牌。
   - 建议以 `PokerCard` 为唯一牌面内核，通过 variant/interaction props 合并外层状态与动画，避免手牌和已出牌的级牌、禁用态、尺寸规则漂移。
   - 两者均在当前核心链路中，禁止直接删任一文件。
2. `components/coach/CoachAvatar.tsx` 与 `components/game/CoachAvatar.tsx`
   - game 版本只是对 coach 版本的包装，但 game 版本当前无入边。
   - 若未来恢复旧训练 UI，应统一到通用 coach 组件；否则 game 包装可按“可以删除”处理。
3. `components/coach/CoachBubble.tsx` 与 `components/game/CoachBubble.tsx`、`components/game/CoachFeedback.tsx`
   - 都表达规则驱动 Coach 反馈，数据模型却分别使用 `types/coach`、`lib/coach/coachTypes`、`types/training-session`。
   - 建议先统一反馈 DTO，再保留一个显示组件；当前公开 GameArena 内又内联了一套 Coach panel。
4. `content/guandan-system/*.json` 与 `data/guandan/*.json`
   - assets/courses/learning-path/questions 四类数据结构和职责高度重叠，但 hash 与大小均不同，不是可直接去重的相同副本。
   - `lib/guandan/catalog.ts` 当前读取 `data/guandan`，生成脚本同时维护 content/data。建议明确“生成源”和“前端产物”，只允许单向同步。
5. `lib/memory/CardTracker.ts` + `MemoryQuestionGenerator.ts` + `MemoryReport.ts` 与 `ObserverMemoryTraining.ts`
   - 前者是较早的通用追踪/问题/报告管线，当前公开训练直接在 `ObserverMemoryTraining` 与 `MemoryTrainingExperience` 中实现同类职责。
   - 文档仍把前者描述为架构组成，不能直接删；建议决定统一到一套模型并补迁移测试。
6. `lib/cards/smartSort.ts` 与 `lib/cards/cardSort.ts`
   - 两者都做手牌排序/分组；当前核心链路使用 `cardSort.ts`，`smartSort.ts` 无静态调用。
   - 先核对旧训练需求后，将算法能力收敛到一个模块。
7. `utils/cardRule.ts` 与 `lib/guandan/cardRule.ts`
   - 前者仅 re-export 后者，当前无消费者。
   - 若无兼容入口需求，可删除 re-export；若外部工具依赖该路径则保留并明确兼容层。

## 存在风险（文件/问题）

### P0：敏感信息

1. `.env.local`
   - 包含真实格式的 `VERCEL_OIDC_TOKEN`，而不是示例占位值。
   - 文件已被 `.gitignore` 忽略且不在 `git ls-files` 中，历史扫描范围内未发现其被跟踪；但“未提交”不等于安全。
   - 建议立即在 Vercel 撤销/轮换该 token，检查终端日志、聊天记录、云同步和备份是否复制过该值。报告不记录 token 内容。
2. Git 配置
   - `remote.origin.url` 是普通 GitHub HTTPS URL，没有内嵌用户名、token 或密码。
   - 本地 Git config 未发现凭据字段。

### P1：核心训练正确性

1. `lib/memory/ObserverMemoryTraining.ts`
   - `calculateCorrectAnswers` 先计算 `visibleJokerCount`，随后对 rank 16 和 17 都返回这个合计值。
   - 风险：小王和大王两个 checkpoint 答案可能错误地相同，应分别按 `card.rank === rank` 计数。
2. `app/practice/[practiceId]/page.tsx`
   - `getPracticeById` 只用于真假校验，实际 case 没有传给 `MemoryTrainingExperience`。
   - 风险：7 个不同静态 id 显示完全相同的记忆训练；内容数据与路由语义脱节。
3. `features/practice/PracticeHome.tsx`
   - 唯一入口硬编码到“什么时候该炸”的旧 case id，但进入后却是通用记忆训练。
   - 风险：命名和实际体验不一致，后续改内容 id 会使入口 404。
4. `features/practice/MemoryTrainingExperience.tsx`
   - 60 分钟会话、checkpoint、难度和总结只存在组件内存；刷新/退出会丢失。
   - 风险：与“用户训练数据”目标不匹配；当前没有正式训练记录持久化。
5. `GameArena.tsx`
   - 单文件约 42 KB、超过 1200 行，包含状态调度、计时器、横竖屏、全屏、桌面 UI、Coach UI、设置和大量内联子组件。
   - 风险：核心出牌交互和 observer 模式强耦合，任何 UI 修改都容易影响记忆训练。后续只应在有测试保护时拆分。
6. 测试覆盖
   - 仅有一份 memory 单元测试；牌型比较、回合推进、AI fallback、observer 自动行动、移动横屏交互和 localStorage 无自动测试。
   - 本阶段按授权未运行测试、lint、typecheck 或 build。

### P1：资源与仓库体积

- Git pack 约 109.80 MiB。
- 多个 PNG 单文件约 1.1–4.3 MB；最大已核查项包括：
  - `public/assets/audio/training-camp-circuit-smiles.mp3`：约 4.28 MB。
  - `public/assets/background/training-world-bg.png`：约 4.08 MB。
  - 多张 coach/arena/training-camp PNG：约 1.4–2.9 MB。
  - `joker-big.png`：约 1.31 MB；牌背约 1.81 MB。
- `public/assets/pdf/guandan-160/pages/` 有 162 张页面 WebP；另有 basic/advanced/endgame/expert 选图，Git blob hash 显示部分内容重复。
- 风险：仓库和部署上传体积偏大；但课程路由虽被拦截，生成数据仍引用 PDF 页面，不能直接判定资源无用。

### P2：依赖与配置

1. `next` 14.2.23、React 18、ESLint 8 均是固定旧主线版本；是否升级需单独项目，不属于清理审计。
2. `ogl` 当前只服务无入边效果组件，是条件性无用依赖。
3. `@gsap/react`、`gsap` 由当前开场 `SplitText` 使用；不能删。
4. `framer-motion` 被当前开场、训练入口、牌桌、卡牌和动画广泛使用；不能删。
5. `.env.example` 声明 `NEXT_PUBLIC_API_BASE_URL`，但 `lib/api/config.ts` 无调用；`FRONTEND_ORIGIN` 仅被占位 backend 使用。
6. `assets/manifests/animation-manifest.json` 无运行时代码消费者，仅有文档引用。
7. `public/assets/poker-cards/manifest.json` 没有运行时 import，但牌面路径由 `cardAssets.ts` 动态拼接；牌图不能因 manifest 未引用而删除。
8. `AGENTS.md` 指定的 `docs/VISUAL_SYSTEM.md` 缺失，视觉判定规则不完整。
9. 根目录没有独立 `src/`、`pages/`、`router/`、`services/`、`styles/` 目录；对应职责分别由根级 app/lib 和 `app/globals.css` 承担，不是缺失错误。

### P2：文档和产品基线漂移

- `docs/ARCHITECTURE.md`、`docs/PROJECT_OVERVIEW_FOR_GPT.md`、`docs/CODE_WIKI.md` 仍描述 backend、CardTracker/Question/Report、课程/成长等较大范围能力。
- `app/design-system/page.tsx` 文案仍称 “Daily Mission”“AI 掼蛋成长训练 App”。
- 这些内容不应被当成当前已开放功能；后续文档应明确“当前公开”“预留”“旧实现”三种状态。

### P2：现有工作区状态

- 审计开始前已有大量 tracked 修改和删除，涉及核心 GameArena、牌组件、memory、globals.css、package.json、tsconfig 等。
- 还存在未跟踪源码、文档、测试和生成产物。
- 风险：后续清理必须建立在当前工作树归属清晰的前提下，避免把用户正在开发的改动误判为废弃代码。

## 待确认

### 预留产品功能是否永久下线

以下应作为一个产品决策包确认，不能逐文件直接删：

- `app/assessment/**` + `features/assessment/**` + `content/assessment/**` + `types/assessment.ts` + `lib/assessment/**`
- `app/coach/**`
- `app/complete/**` + `features/daily-training/**` + `content/daily-training/**` + `types/DailyTraining.ts`
- `app/growth-report/**`
- `app/history/**`
- `app/learning-path/**` + `app/lessons/**` + `features/learning/**`
- `app/paths/**` + `content/paths/**`
- `app/profile/**` + `features/progress/**` + `lib/player/**` + `lib/profile/**` + `lib/training/**`
- `app/design-system/**` 及其仅由预留页面使用的 UI 组件

静态证据证明这些入口被 middleware 拦截，但页面之间仍有完整 import/data 依赖。只有确认“不再恢复”后，才能从路由向下做可达性删除。

### 旧静态练习系统

- `features/practice/PracticeExperience.tsx`
- `components/practice/PokerTable.tsx`
- `components/cards/PokerHand.tsx`
- `content/cases/sample-practice.ts`
- `types/practice.ts`
- `types/coach.ts`

`PracticeExperience` 本身无入边，但 `sample-practice.ts` 仍被当前动态路由用于 id 校验和静态参数，不能整组直接删。需确认：

1. 当前 `/practice/[practiceId]` 是否应改为单一 memory id；
2. 旧残局判断练习是否未来恢复；
3. 若不恢复，先替换路由 id 数据源，再移除旧内容链。

### 领域预留/旧模型

以下模块没有当前公开链路调用，或只在预留模块内部调用，但可能代表未来能力：

- `knowledge/**`
- `mistakes/index.ts`
- `database/trainingRecords.ts`
- `training/challenge.ts`、`training/index.ts`、`training/training-session.ts`
- `lib/replay/GrowthReport.ts`
- `lib/cards/smartSort.ts`
- `lib/memory/CardTracker.ts`、`MemoryQuestionGenerator.ts`、`MemoryReport.ts`
- `content/quizzes/sample-quizzes.ts`
- `types/UserState.ts`、`types/training-session.ts`、`types/quiz.ts`
- `utils/cardRule.ts`

待产品路线和外部脚本消费者确认后再决定删除或并入现有实现。

### 数据、脚本和大资源

1. `content/guandan-system/**` 与 `data/guandan/**`
   - 内容不同，且 `lib/guandan/catalog.ts` 使用 data 版本；构建/同步脚本可能以 content 为源。
   - 需先确定生成链路和 source of truth。
2. `public/assets/pdf/guandan-160/pages/**` 与 `public/assets/guandan/**`
   - 存在重复 blob，但当前课程数据引用它们。
   - 需先生成“资源 id → 页面/数据消费者”清单，再决定去重。
3. coach、learning-path、training-camp 大图
   - 多数服务被 middleware 拦截的预留页面或旧入口；素材 manifest 仍登记。
   - 需和预留功能去留一起处理，不能只按当前页面网络请求判断。
4. `backend/server.mjs`、`lib/api/config.ts`、`.env.example`
   - backend 有 package script，API config 无调用。
   - 需确认是否继续保留前后端占位契约。
5. `frontend-optimization-audit.md`、`design-qa.md`、`docs/*`
   - 可能是人工审计/设计记录，不属于可自动删除的构建产物。
   - 需由文档所有者确认归档、合并或删除。

## 保护清单

后续任何清理必须回归并保护：

- `lib/guandan/**`、`store/gameStore.ts` 的牌局规则与回合推进。
- `PokerCard`、两套当前在用的 `PlayingCard`、`HandCards`、`CardHand`、`CardGroup`、`PlayedCards`。
- `GameArena`、`GameTable`、出牌选择/不出/提示/AI fallback、observerMode。
- `features/practice/MemoryTrainingExperience.tsx`、`lib/memory/ObserverMemoryTraining.ts` 和 memory 面板。
- `CardCounter` 及牌数更新。
- localStorage 设置与未来训练数据迁移。
- 390–430 px 移动端入口体验，以及训练场横屏/全屏适配。
- Framer Motion、GSAP 开场和发牌/出牌动画。

## 建议的下一阶段顺序

1. 先轮换 `.env.local` 中的 Vercel OIDC token。
2. 为核心牌型、回合推进、observer 自动行动和王计数补测试，再修正确认的问题。
3. 由产品确认预留路由、旧静态练习和课程数据是否保留。
4. 先清理高置信度生成产物和无入边叶子组件，再移除 `ogl`。
5. 统一两套 PlayingCard/Coach/记忆管线前，做移动端与动画回归。
6. 最后处理大资源和 content/data 生成链，避免破坏素材清单与课程引用。

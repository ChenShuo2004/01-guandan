# 当前项目架构说明

> 本文档描述当前代码架构，不描述未来产品目标。
> 当前可用产品只有记牌训练；牌局引擎通过 observerMode 作为内部实现。

## 1. 当前运行架构

~~~text
Next.js App Router
  ├─ /                    OpeningScene
  ├─ /practice             PracticeHome / 记牌训练入口
  ├─ /practice/[id]        MemoryTrainingExperience
  └─ /practice/[id]        MemoryTrainingExperience + GameArena observerMode

middleware.ts
  └─ 未开放页面重定向到 /practice
~~~

前端使用 Next.js、React、TypeScript 和 Tailwind CSS。后端 backend/server.mjs 目前只是 localhost:8000 的健康检查服务。

## 2. 当前可用业务模块

### 记牌训练

入口：features/practice/PracticeHome.tsx。

具体训练：features/practice/MemoryTrainingExperience.tsx。

内容来源：

- content/cases/sample-practice.ts。
- 练习类型：types/practice.ts。
- 牌面组件：components/cards/*、components/practice/*。

当前职责：

- 自动推进牌局。
- 记录关键牌。
- 发起记忆测试。
- 展示测试结果。
- 完成一轮记牌训练。

### 记牌训练内部牌局引擎

入口：features/practice/MemoryTrainingExperience.tsx。

主要 UI：components/game/GameArena.tsx。

状态：store/gameStore.ts。

规则：

- lib/guandan/card.ts。
- lib/guandan/cardRule.ts。
- lib/guandan/cardCompare.ts。
- lib/guandan/gameState.ts。
- lib/guandan/gameEngine.ts。
- lib/guandan/turnManager.ts。

AI：

- lib/ai/AIPlayer.ts。
- lib/ai/strategy.ts。

Coach：

- lib/coach/CoachAnalyzer.ts。
- lib/coach/DecisionEngine.ts。
- lib/coach/MistakeDetector.ts。
- components/game/Coach*。

当前职责：

- 自动驱动 AI 牌局。
- 把牌局历史提供给 CardTracker。
- 到达检查点后暂停牌局并生成 MemoryQuestion。
- 测试完成后继续观察或生成 MemoryReport。

## 3. 当前数据流

### 记牌训练数据流

~~~text
/practice
  → samplePracticeCases
  → /practice/[practiceId]
  → MemoryTrainingExperience
  → 本地组件状态
  → 记牌测试结果
~~~

### 记牌训练内部牌局数据流

~~~text
createInitialGameState
  → useGameStore / gameReducer
  → GameArena
  → Card / Table / Action 组件
  → lib/guandan gameEngine
  → lib/ai
  → lib/coach
  → 即时 UI 反馈
~~~

当前没有统一 TrainingSession，也没有统一 Review 或成长写回。

## 4. 当前路由与 middleware

可用路由：

- /：OpeningScene。
- /practice：记牌训练入口。
- /practice/[practiceId]：记牌训练实例。
- /training：当前工作区已移除独立路由。

middleware.ts 当前将以下路径重定向到 /practice：

~~~text
/assessment
/coach
/complete
/design-system
/growth-report
/history
/learning-path
/lessons
/paths
/profile
~~~

这些页面可以存在于代码中，但属于预留或未开放功能。

## 5. 目录职责

~~~text
app/                 路由入口
components/          UI、牌、牌桌、Coach 和布局
features/practice/   记牌训练体验
features/practice/   记牌训练体验和牌局观察
lib/guandan/         掼蛋规则和牌局引擎
lib/ai/              AI 出牌策略
lib/coach/           规则型 Coach
store/               牌局 reducer
types/               共享类型
content/cases/       当前练习案例
public/assets/       静态素材
backend/             健康检查占位服务
middleware.ts        未开放路由控制
~~~

## 6. 当前状态边界

当前已实现：

- 一个记牌训练入口。
- 记牌训练交互。
- 牌局观察和记牌测试。
- 规则驱动的基础反馈。
- 本地组件状态和部分 localStorage。

当前未实现或未开放：

- Daily Training 主流程。
- 课程学习闭环。
- 统一训练会话。
- Review / GrowthReport。
- 用户账号和数据库。
- 真实 AI。
- 在线多人对战。
- 支付和会员。

## 7. 新代码的判断标准

任何新功能都必须先回答：

1. 属于记牌训练还是预留能力？
2. 使用哪个真实可访问路由？
3. 状态由哪个 store 或 hook 管理？
4. 是否破坏 /practice 和 /practice/[practiceId]？
5. 是否需要修改 middleware？
6. 验收标准是什么？

未回答清楚前，不要把新功能写进“当前已实现”。

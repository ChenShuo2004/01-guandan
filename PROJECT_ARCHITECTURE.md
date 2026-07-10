# 项目架构文档

> 描述当前代码架构、模块关系和数据流。以代码为准，不描述未来规划。

## 系统架构概览

```
Browser
  │
  ▼
Next.js App Router (SSR/SSG + Client Components)
  ├─ /                  → OpeningScene (CSR)
  ├─ /practice          → PracticeHome (CSR)
  └─ /practice/[id]     → MemoryTrainingExperience (CSR)
        │
        ├─ GameArena (observerMode)   ← store/gameStore (Zustand)
        │     └─ lib/guandan/         ← 规则引擎（纯函数）
        │     └─ lib/ai/              ← AI 出牌策略
        │     └─ lib/coach/           ← 教练提示（规则驱动）
        │
        └─ Memory UI Panels           ← lib/memory/ObserverMemoryTraining
              MemoryTargetPanel
              MemoryCheckpointPanel
              MemoryFeedbackPanel
              MemorySessionSummaryPanel
              MemoryAnswerHistoryPanel
```

## 页面结构

### `/` — 开场页

- 组件：`components/scene/OpeningScene`
- 依赖：`components/effects/SplitText`（GSAP 动画）、`components/scene/SceneBackground`
- 功能：全屏欢迎页，唯一 CTA 按钮跳转 `/practice`

### `/practice` — 训练入口

- 组件：`features/practice/PracticeHome`
- 依赖：`components/practice/TiltedCard`、`components/practice/MemoryLabFeatureCard`、`components/scene/SceneBackground`
- 功能：展示记牌训练入口卡片，点击进入具体训练

### `/practice/[practiceId]` — 训练实例

- 组件：`features/practice/MemoryTrainingExperience`
- 依赖：`components/game/GameArena`、`components/memory/*`、`lib/memory/ObserverMemoryTraining`
- 内容来源：`content/cases/sample-practice`（`generateStaticParams` 静态生成）
- 功能：完整记牌训练闭环

## 模块关系

### 牌局引擎（`lib/guandan/`）

纯函数模块，无副作用：

| 文件 | 职责 |
|------|------|
| `card.ts` | 卡牌类型、排序、点数标签 |
| `deck.ts` | 发牌、洗牌 |
| `gameEngine.ts` | 出牌、过牌、状态转换 |
| `gameState.ts` | 游戏状态类型定义 |
| `player.ts` | 玩家类型、位置 |
| `cardRule.ts` | 牌型判断（对子、顺子、炸弹等） |
| `cardCompare.ts` | 牌型大小比较 |
| `turnManager.ts` | 回合管理 |
| `catalog.ts` | 牌型目录 |

### 游戏状态（`store/gameStore.ts`）

Zustand store，管理完整牌局生命周期：
- 发牌、出牌、AI 决策、教练分析、得分
- 通过 `lib/guandan/gameEngine` 执行状态转换
- 通过 `lib/ai/AIPlayer` 调用 AI 出牌
- 通过 `lib/coach/CoachAnalyzer` 生成教练提示

### 记牌训练（`lib/memory/ObserverMemoryTraining.ts`）

状态机，管理记牌训练全流程：
- 目标牌追踪
- 检查点触发逻辑
- 答题评分
- 难度自适应（升降目标牌数量）
- 会话摘要生成

### AI 出牌（`lib/ai/`）

规则驱动，非真实模型：
- `AIPlayer.ts`：AI 决策入口，调用策略
- `strategy.ts`：出牌策略（跟牌、过牌逻辑）

### 教练系统（`lib/coach/`）

规则驱动，非真实模型：
- `CoachAnalyzer.ts`：分析当前局面，生成提示
- `MistakeDetector.ts`：检测出牌失误
- `coachTypes.ts`：教练反馈类型定义
- `DecisionEngine.ts`：决策评分（保留，扩展用）

## 数据流

### 记牌训练数据流

```
content/cases/sample-practice
    ↓ (静态内容)
MemoryTrainingExperience (React state)
    ↓ observerMode
GameArena → gameStore (Zustand)
    ↓ onObserverStateChange
MemoryTrainingExperience (更新 training state)
    ↓
Memory UI Panels (展示目标牌、检查点、反馈)
```

### 游戏引擎数据流

```
gameStore.startGame()
    → deck.ts 发牌
    → 各玩家初始手牌
    → 回合循环:
        玩家回合: 等待用户操作 / AI 自动出牌
        AI 回合: lib/ai/AIPlayer.getAIAction()
        出牌后: lib/coach/CoachAnalyzer.analyzeCoachTip()
        → 下一回合
    → 游戏结束: 计分
```

## 内容与数据

```
content/
  cases/
    sample-practice.ts   # 记牌训练案例列表（practiceId → PracticeCase）

data/                    # 静态配置数据（保留，扩展用）
```

## 中间件

`middleware.ts` 拦截以下路由并重定向到 `/practice`：
- `/assessment/*`、`/coach`、`/complete`、`/design-system`
- `/growth-report/*`、`/history`、`/learning-path`
- `/lessons/*`、`/paths`、`/profile`

这些路由对应尚未开放的功能模块，代码保留但用户不可访问。

## 后续扩展方式

1. **新训练模式**：在 `features/` 创建新模块，在 `app/` 增加路由，更新 `middleware.ts` 开放入口
2. **新内容**：在 `content/cases/` 增加训练案例
3. **数据库/登录**：在 `lib/storage/` 和 `lib/api/` 实现 service 层（已预留）
4. **真实 AI Coach**：替换 `lib/coach/CoachAnalyzer.ts` 实现，接口不变
5. **更多牌型规则**：扩展 `lib/guandan/cardRule.ts` 和 `cardCompare.ts`

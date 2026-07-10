# 掼蛋训练项目：当前产品功能说明

> 本文档描述当前代码已经实现并可运行的功能，不是未来产品规划。
>
> 当前功能是需求基线。任何新功能都必须另行标记为“待开发”，不能把规划写成已实现。

## 1. 当前产品定位

当前产品是一个移动端优先的掼蛋记牌训练原型，当前开放一个训练模式；牌局引擎只是该模式的内部实现：

1. 记牌训练模式：自动推进牌局，用户观察并记忆关键牌。
2. 牌局引擎内部能力：自动推进牌局，为记牌训练提供牌面、历史和测试节点。

当前产品重点是训练体验和牌局交互，不是完整的课程平台、用户系统或在线棋牌游戏。

## 2. 当前可用用户流程

### 2.1 首次进入

~~~text
/ → OpeningScene → 点击开始记牌训练 → /practice
~~~

首页 / 的职责是产品开场和进入训练，不是 Daily Training Dashboard。

### 2.2 记牌训练

~~~text
/practice
  → 进入记牌训练
/practice/[practiceId]
  → 自动推进牌局
  → 观察关键牌
  → 记忆测试
  → 完成当前训练
~~~

当前记牌训练的核心能力：

- 展示训练入口和训练说明。
- 使用示例练习案例。
- 自动推进牌局。
- 追踪关键牌出现情况。
- 在训练过程中发起记牌测试。
- 完成一轮记牌训练。

### 2.3 牌局引擎（记牌训练内部能力）

~~~text
记牌训练页面内部使用 GameArena observerMode：
  → AI 自动行动
  → 规则引擎推进牌局
  → 用户观察关键牌
  → 到达测试点后暂停并回答问题
~~~

当前牌局训练的核心能力：

- 掼蛋牌面和手牌渲染。
- 牌型识别和合法性判断。
- 牌型比较和压制判断。
- AI 自动推进牌局。
- 记牌训练观察关键牌。
- 测试点暂停牌局并收集回答。
- 测试反馈和训练结果。

## 3. 当前路由状态

| 路由 | 当前状态 | 说明 |
|---|---|---|
| / | 可用 | OpeningScene，进入 /practice |
| /practice | 可用 | 记牌训练入口 |
| /practice/[practiceId] | 可用 | 记牌训练实例 |
| /training | 不可用 | 当前工作区已移除独立路由；牌局引擎只作为记牌训练内部能力 |
| /assessment/* | 不可用 | middleware 重定向到 /practice |
| /coach | 不可用 | middleware 重定向到 /practice |
| /complete | 不可用 | middleware 重定向到 /practice |
| /growth-report/* | 不可用 | middleware 重定向到 /practice |
| /history | 不可用 | middleware 重定向到 /practice |
| /learning-path | 不可用 | middleware 重定向到 /practice |
| /lessons/* | 不可用 | middleware 重定向到 /practice |
| /paths | 不可用 | middleware 重定向到 /practice |
| /profile | 不可用 | middleware 重定向到 /practice |
| /design-system | 不可用 | middleware 重定向到 /practice |

页面文件存在但被 middleware 拦截的功能，统一视为“代码预留/未开放”，不能写成当前用户可用功能。

## 4. 当前技术实现

~~~text
Next.js 14 App Router
React 18
TypeScript
Tailwind CSS
Framer Motion
GSAP
React hooks / useReducer
localStorage
规则驱动 AI
~~~

前端运行在 localhost:3000。backend/server.mjs 目前只有 /health 健康检查，没有业务 API。

当前不包含：

- 登录和用户账号。
- 云端数据同步。
- 正式数据库。
- 真实大模型 API。
- 在线匹配、房间和多人对战。
- 付费系统。
- 完整课程学习路径。
- 正式训练历史和成长报告闭环。

## 5. 当前数据来源

- 记牌训练案例：content/cases/sample-practice.ts。
- 牌局规则：lib/guandan/。
- AI 行为：lib/ai/。
- Coach 规则：lib/coach/。
- 牌局状态：store/gameStore.ts 和 lib/guandan/gameState.ts。
- 静态牌面与训练素材：public/assets/。
- 部分进度能力已使用 localStorage，但 Training Arena 尚未完整写入统一训练记录。

## 6. 当前 UI 结构

当前主导航只有一个训练入口：

- 记牌训练：/practice。

当前 UI 风格：

- 深色训练场背景。
- 蓝色科技感。
- 黄色主行动按钮。
- 卡片、圆角、轻微阴影和移动端优先布局。
- 训练场优先展示牌桌、手牌和 Coach，不优先展示复杂资料信息。

## 7. 当前验收标准

### 记牌训练

- 用户能从 / 进入 /practice。
- 用户能从 /practice 进入至少一个练习。
- 牌局能自动推进。
- 关键牌能被追踪。
- 用户能完成记牌测试。

### 牌局引擎内部能力

- 记牌训练能看到自动推进的牌局。
- 关键牌数量和出现情况能被追踪。
- 牌局会在测试点暂停。
- 用户能回答记牌问题并立即看到反馈。
- 用户能继续观察或查看训练结果。

## 8. 后续功能必须如何记录

以后如果增加课程、Daily Training、能力测评、Profile、Review、数据库或真实 AI，必须：

1. 先新增独立需求章节。
2. 标注为“待开发”或“已实现”。
3. 同时更新路由状态表。
4. 同时更新项目总览。
5. 完成运行验证后再把状态改为“已实现”。

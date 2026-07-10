# 掼蛋训练项目：当前代码与功能总览

> 这是给 GPT 使用的当前项目事实文档。本文档以可运行功能为准，不把规划内容写成已实现能力。

## 1. 当前产品是什么

当前项目是一个移动端优先的掼蛋记牌训练原型，当前开放一个训练模式：

1. 记牌训练：自动推进牌局，用户观察并记忆关键牌。
2. 牌局引擎：作为记牌训练内部实现，自动推进牌局并提供牌局状态。

当前产品不是完整课程平台，也不是 Daily Training App。Daily Training、课程、评估、路径、Profile 等代码属于预留或未开放模块。

## 2. 当前可用流程

~~~text
/ → OpeningScene → /practice → /practice/[practiceId]
                                      ↘ 记牌训练

记牌训练页面内部 → GameArena observerMode
                 → 自动推进牌局 → 记牌测试
~~~

### / 的实际职责

app/page.tsx 只渲染 OpeningScene。它是开场页，不是 Dashboard。

### /practice 的实际职责

app/practice/page.tsx 渲染 PracticeHome。它是记牌训练入口。

### /practice/[practiceId] 的实际职责

动态路由校验练习 ID，然后渲染 MemoryTrainingExperience。它是具体记牌训练页面。

### 牌局引擎的实际职责

features/practice/MemoryTrainingExperience.tsx 以 observerMode 使用 GameArena。当前没有独立的 /training 路由。

## 3. 当前可用能力

### 记牌训练

- 自动牌局推进。
- 关键牌追踪。
- 记牌测试。
- 记忆训练结果展示。
- 示例练习案例。

### 牌局引擎内部能力

- 牌堆、发牌、牌局状态。
- 牌型识别。
- 牌型比较。
- AI 自动推进牌局。
- 记牌训练观察牌面。
- 记牌测试暂停牌局。
- 测试结果和训练报告。

## 4. 当前不可用或未开放能力

以下页面文件存在，但 middleware.ts 会将访问重定向到 /practice，因此当前不能作为开放功能：

~~~text
/assessment/*
/coach
/complete
/growth-report/*
/history
/learning-path
/lessons/*
/paths
/profile
/design-system
~~~

以下能力也不能视为当前已实现：

- Daily Training 首页闭环。
- 课程学习路径。
- 课程到练习的统一完成流程。
- Training Arena 到 Review / GrowthReport 的完整回写。
- 用户账号。
- 云端同步。
- 正式数据库。
- 真实 AI API。
- 在线多人对战。
- 支付和会员。
- 完整历史记录。

## 5. 技术栈

~~~text
Next.js 14.2.23 App Router
React 18.3.1
TypeScript 5.7.3
Tailwind CSS 3.4.17
Framer Motion
GSAP
React hooks / useReducer
localStorage
Node backend placeholder
~~~

命令：

~~~bash
pnpm dev
pnpm dev:frontend
pnpm dev:backend
pnpm typecheck
pnpm lint
pnpm build
~~~

## 6. 代码结构

~~~text
app/                 路由和页面入口
components/          UI、布局、Coach、牌和牌桌组件
features/            业务功能组件
lib/                 掼蛋规则、AI、Coach、资源和存储
store/gameStore.ts   AI 牌局训练状态
types/               共享类型
content/cases/       记牌和练习案例
content/lessons/     课程预留内容
content/daily-training/ Daily Training 预留内容
data/guandan/        结构化掼蛋内容
public/assets/       静态素材
middleware.ts        当前未开放路由的重定向
backend/server.mjs   /health 占位服务
~~~

关键模块：

~~~text
lib/guandan/          牌、牌型、比较、牌局引擎
lib/ai/               AI 出牌策略
lib/coach/            Coach 分析和错误检测
store/gameStore.ts    牌局 reducer
components/cards/     准确牌面组件
components/game/      牌桌和牌局 UI
features/practice/    记牌训练体验
~~~

## 7. 当前状态管理

- 牌局引擎主要使用 store/gameStore.ts 的 useReducer，并以 observerMode 被记牌训练调用。
- 记牌训练主要使用练习案例和本地组件状态。
- 部分进度能力使用 localStorage。
- 当前没有统一 TrainingSession。
- 当前没有统一 Review 记录。
- 当前没有后端业务接口。

## 8. AI Coach 当前边界

当前 Coach 是规则驱动，不调用真实模型。

可以做：

- 当前牌局提示。
- 合法性解释。
- 用户动作错误检测。
- 推荐出牌。
- 短反馈。

不能宣称已经具备：

- 截图识别。
- 长文本智能分析。
- 个性化历史总结。
- 自动生成学习路径。
- 真实模型对话。

## 9. 未来需求的记录方式

任何新功能都必须在文档中同时写明：

- 路由。
- 用户入口。
- 当前状态：预留 / 开发中 / 已实现。
- 数据来源。
- 状态管理方式。
- 验收标准。

只有代码可访问、主流程可操作、验收通过后，才可以标记为“已实现”。

## 10. 给 GPT 的提示词

~~~text
请把当前代码当作需求基线。当前开放功能只有：
1. / 开场页；
2. /practice 记牌训练入口；
3. /practice/[practiceId] 记牌训练。

不要把 Daily Training、课程、评估、学习路径、Profile、Review、数据库、真实 AI 或独立 /training 写成已经实现。它们目前属于预留、历史代码或未开放能力。

修改代码前先定位真实路由和调用链，优先保持记牌训练主流程稳定。完成后运行 pnpm typecheck、pnpm lint、pnpm build。
~~~

# 掼蛋记牌训练

移动端优先的掼蛋记牌能力训练工具。通过自动牌局和即时记忆测试，帮助玩家训练对关键牌的观察和记忆能力。

## 产品定位

当前产品是一个**记牌训练原型**，聚焦于：

- 训练玩家观察牌局中的关键牌
- 通过即时测试验证记忆准确率
- 自适应难度：根据表现自动调整目标牌数量

当前**不是**完整课程平台、每日训练 App、在线棋牌游戏大厅或用户成长系统。

## 核心功能

| 路由 | 功能 |
|------|------|
| `/` | 开场页，主按钮进入记牌训练 |
| `/practice` | 记牌训练入口 |
| `/practice/[practiceId]` | 记牌训练实例（自动牌局 + 记忆测试） |

训练实例内部流程：
1. 展示本局目标牌（K、Q 等指定点数）
2. 自动运行 AI 牌局（观察者模式）
3. 记忆检查点：答出已出现的目标牌数量
4. 即时反馈 + 错误回放
5. 多局累计，难度自适应升降

## 技术栈

- **框架**：Next.js 14 (App Router)
- **语言**：TypeScript 5
- **样式**：Tailwind CSS 3
- **动画**：Framer Motion 11、GSAP 3
- **3D 效果**：OGL
- **状态**：Zustand（游戏引擎）+ localStorage（进度）
- **运行时**：Node.js 22

## 项目结构

```
app/                    # 页面路由（App Router）
  layout.tsx            # 根布局
  page.tsx              # 开场页 (/)
  practice/
    page.tsx            # 训练入口 (/practice)
    [practiceId]/
      page.tsx          # 训练实例 (/practice/[id])

components/             # UI 组件
  cards/                # 扑克牌组件（PokerCard、PokerHand）
  game/                 # 牌局界面（GameArena、GameTable 等）
  memory/               # 记牌训练面板
  scene/                # 场景背景、开场组件
  effects/              # UI 特效（SplitText、SideRays 等）
  audio/                # 背景音乐

features/               # 功能模块
  practice/             # 记牌训练逻辑（PracticeHome、MemoryTrainingExperience）

lib/                    # 服务与工具
  guandan/              # 掼蛋规则引擎（card、deck、gameEngine 等）
  memory/               # 记牌训练状态机（ObserverMemoryTraining）
  ai/                   # AI 出牌策略
  coach/                # 教练提示（规则驱动）
  cards/                # 手牌排序工具

store/                  # 全局状态
  gameStore.ts          # 游戏引擎状态（Zustand）

content/                # 训练内容数据
data/                   # 静态数据

middleware.ts           # 路由守卫（未开放路由重定向到 /practice）
```

## 本地启动

```bash
# 安装依赖
npm install
# 或
pnpm install

# 开发模式（前端）
npm run dev

# 类型检查
npm run typecheck

# Lint
npm run lint
```

访问 http://localhost:3000

## 部署

本项目使用 Vercel 部署，详见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 地址（V1 未使用） | `http://localhost:8000` |

完整说明见 `.env.example`。

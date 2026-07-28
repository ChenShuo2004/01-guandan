# 掼蛋记牌训练

一个移动端优先的掼蛋记牌能力训练工具。产品通过自动运行的 AI 牌局、关键牌观察和即时记忆测试，帮助玩家把“会打牌”进一步拆解为可训练、可反馈的观察与记忆能力。

<p align="center">
  <a href="https://guandan-beta.vercel.app">在线体验</a> ·
  <a href="https://github.com/ChenShuo2004/01-guandan">GitHub</a> ·
  <a href="https://x.com/ChenshuoAI">关注作者</a>
</p>

<p align="center">
  <img src="./assets/product-preview.png" alt="掼蛋记牌训练产品预览" width="100%" />
</p>

> 当前版本是记牌训练原型，不是完整课程平台、在线棋牌游戏大厅或用户成长系统。

## 产品定位

掼蛋牌局的信息量很大，玩家需要在有限时间内观察关键牌、记住已出现的数量，并根据反馈不断调整注意力。本项目将这一过程拆成“目标牌 → AI 牌局 → 记忆检查 → 即时反馈 → 难度调整”的训练闭环。

## 核心功能

| 功能 | 说明 |
| --- | --- |
| 目标牌训练 | 开始牌局前明确需要观察和记忆的点数 |
| AI 牌局 | 自动运行牌局，模拟真实观察场景 |
| 记忆检查点 | 回答目标牌已经出现的数量 |
| 即时反馈 | 展示结果、错误回放和下一轮建议 |
| 自适应难度 | 根据表现动态调整目标牌数量与训练压力 |
| 移动端体验 | 适配手机屏幕和触控操作 |

## 训练流程

```text
选择训练 → 观察目标牌 → AI 牌局运行 → 记忆检查 → 查看反馈 → 进入下一局
```

## 技术栈

- Next.js 14 · React 18 · TypeScript
- Tailwind CSS
- Framer Motion · GSAP · OGL
- 自研掼蛋规则与牌局引擎
- Zustand / localStorage 状态管理
- Vercel 部署

## 本地运行

```bash
git clone https://github.com/ChenShuo2004/01-guandan.git
cd 01-guandan
npm install
npm run dev
```

访问终端提示的本地地址，默认通常为 `http://localhost:3000`。

常用命令：

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## 路由

| 路由 | 作用 |
| --- | --- |
| `/` | 开场页与训练入口 |
| `/practice` | 选择或开始记牌训练 |
| `/practice/[practiceId]` | 具体训练实例与记忆检查 |

## 项目结构

```text
app/          # 页面路由与布局
components/   # 扑克牌、牌局、训练和视觉效果组件
features/     # 训练流程与领域功能模块
lib/guandan/  # 牌、牌堆和游戏引擎
lib/memory/   # 记牌训练状态机
ai/           # AI 出牌策略与教练提示
store/        # 全局游戏状态
content/      # 训练内容
```

## 当前边界

- 聚焦记牌训练，不提供完整在线对战
- 不包含用户账号、会员、支付和成长体系
- AI 牌局用于训练场景，不等同于真实玩家策略

## 作者

由 [陈硕（KAI）](https://github.com/ChenShuo2004) 构建。

- X / Twitter：[@ChenshuoAI](https://x.com/ChenshuoAI)
- 在线产品：[guandan-beta.vercel.app](https://guandan-beta.vercel.app)

## 免责声明

本项目是牌类学习和记忆训练工具，不保证训练结果，也不构成任何竞技、博彩或财务建议。请遵守所在地区的法律法规，理性参与牌类活动。

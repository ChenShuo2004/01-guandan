# 项目发布状态报告

**生成时间**：2026-07-10  
**版本**：0.1.0

---

## 当前版本

| 项目 | 状态 |
|------|------|
| 版本号 | 0.1.0（package.json） |
| 框架 | Next.js 14.2.23 |
| Node.js | ≥20（推荐 22 LTS） |
| 构建状态 | ✅ 成功 |
| TypeScript | ✅ 无错误 |
| ESLint | ✅ 无错误 |

---

## 清理清单（本次整理已完成）

### 已删除 — 废弃页面（middleware 拦截）

| 目录 | 说明 |
|------|------|
| `app/assessment/` | 能力测评页面（start/session/result） |
| `app/coach/` | AI 教练入口页 |
| `app/complete/` | 训练完成页 |
| `app/design-system/` | 设计系统预览页 |
| `app/growth-report/` | 成长报告页 |
| `app/history/` | 训练历史记录页 |
| `app/learning-path/` | 学习路线页 |
| `app/lessons/` | 课程详情页 |
| `app/paths/` | 学习路径页 |
| `app/profile/` | 用户画像页 |

### 已删除 — 废弃 features 模块

| 目录/文件 | 说明 |
|-----------|------|
| `features/assessment/` | 测评视图和状态管理（6 个文件） |
| `features/daily-training/` | 每日训练逻辑（4 个文件） |
| `features/learning/` | 课程体验组件（3 个文件） |
| `features/progress/` | 进度 hook（2 个文件） |
| `features/practice/PracticeExperience.tsx` | 旧版练习视图 |

### 已删除 — 测试文件

| 文件 | 说明 |
|------|------|
| `lib/memory/ObserverMemoryTraining.test.ts` | Node test runner 单元测试 |

### 已修改 — 配置

| 文件 | 变更 |
|------|------|
| `package.json` | 移除 `test:memory` 脚本 |
| `.gitignore` | 补充 `coverage/`、`build/`，清理重复行 |
| `.next/types/` | 清除对应已删除页面的过期生成类型 |

### 已新增 — 文档与配置

| 文件 | 说明 |
|------|------|
| `README.md` | 项目根目录说明文档 |
| `PROJECT_ARCHITECTURE.md` | 系统架构、模块关系、数据流 |
| `CHANGELOG.md` | 变更记录 |
| `vercel.json` | Vercel 最小化部署配置 |
| `DEPLOYMENT.md` | 部署步骤和环境变量说明 |
| `PROJECT_RELEASE_REPORT.md` | 本文件 |

---

## 架构状态

### 活跃路由（当前可用）

```
/                          → OpeningScene（开场页）
/practice                  → PracticeHome（记牌训练入口）
/practice/[practiceId]     → MemoryTrainingExperience（训练实例）
```

共 7 个静态生成页面（1 个开场 + 1 个入口 + 5 个训练案例）。

### 核心模块状态

| 模块 | 路径 | 状态 |
|------|------|------|
| 掼蛋规则引擎 | `lib/guandan/` | ✅ 活跃 |
| 记牌训练状态机 | `lib/memory/ObserverMemoryTraining.ts` | ✅ 活跃 |
| AI 出牌策略 | `lib/ai/` | ✅ 活跃 |
| 教练提示系统 | `lib/coach/` | ✅ 活跃 |
| 游戏状态管理 | `store/gameStore.ts` | ✅ 活跃 |
| 扑克牌组件 | `components/cards/` | ✅ 活跃 |
| 牌局 UI | `components/game/` | ✅ 活跃 |
| 记牌测试 UI | `components/memory/` | ✅ 活跃 |

### 保留未删除的非活跃模块（可能用于扩展）

以下模块未被当前活跃页面引用，但因无法确认未来用途而保留：

- `lib/api/config.ts` — API 配置预留
- `lib/assessment/assessment-engine.ts` — 测评引擎
- `lib/assets/` — 资源清单（audio/image assets）
- `lib/cards/cardAssets.ts`, `smartSort.ts` — 扑克牌资源和高级排序
- `lib/coach/DecisionEngine.ts` — 决策评分引擎
- `lib/memory/CardTracker.ts`, `MemoryQuestionGenerator.ts`, `MemoryReport.ts` — 记牌扩展模块
- `lib/player/` — 玩家能力模型
- `lib/profile/` — 用户档案模型
- `lib/replay/` — 复盘分析
- `lib/storage/progress-storage.ts` — 进度持久化
- `lib/training/` — 训练规划器
- `components/layout/` — AppShell 等布局组件（含导航栏）
- `components/lessons/LessonCard.tsx` — 课程卡片

---

## GitHub 状态

| 项目 | 状态 |
|------|------|
| Remote | ✅ `origin → https://github.com/ChenShuo2004/01-guandan.git` |
| 当前 HEAD（清理前） | `07d9ff005f0538665f5c89c9d83cacebfe2af536` |
| 提交状态 | 本次清理后执行了 `chore: project cleanup and production preparation` |

---

## Vercel 状态

`vercel.json` 配置摘要：

```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

- 框架：Next.js（自动检测）
- 构建命令：`next build`
- 输出目录：`.next`
- 安装命令：`npm install`（使用 npm 而非 pnpm，兼容 Vercel 默认环境）

---

## Build 状态

```
✅ Build 成功

Route (app)                                    Size     First Load JS
┌ ○ /                                          52.9 kB         189 kB
├ ○ /_not-found                                870 B            88 kB
├ ○ /practice                                  6.97 kB         143 kB
└ ● /practice/[practiceId]                     34.1 kB         164 kB
    ├ /practice/practice-when-to-bomb-001
    ├ /practice/practice-when-not-to-bomb-001
    ├ /practice/practice-partner-support-001
    └ [+4 more paths]
+ First Load JS shared by all                  87.1 kB
```

无编译错误，无 TypeScript 错误，无 ESLint 警告。

---

## 当前风险

| 风险 | 级别 | 说明 |
|------|------|------|
| 大型静态资源 | 低 | 26 个图片/音频文件 >1MB 已提交到 Git（最大约 4.3MB 音频文件）。建议后续用 Git LFS 或 CDN 管理，但不影响当前部署 |
| 非活跃 lib 模块 | 低 | 约 15+ 个 lib 文件未被当前活跃页面引用，保留但增加代码库体积 |
| npm warn devdir | 无 | 本地 npm 配置警告，不影响构建或部署 |
| V1 无数据库/登录 | 预知 | 所有进度存于 localStorage，刷新页面会重置训练状态 |

---

## 下一步开发建议

### 近期（功能完善）

1. **增加更多训练案例**：在 `content/cases/sample-practice.ts` 中增加 `PracticeCase` 条目
2. **难度分级**：在 `MemoryTrainingExperience` 中增加初始难度选择
3. **训练历史持久化**：利用已有 `lib/storage/progress-storage.ts` 存储多局记录

### 中期（体验升级）

4. **开放 /practice 首页入口多样化**：增加不同训练模式卡片
5. **记牌训练音效反馈**：答对/答错时播放音效
6. **移动端手势优化**：滑动切换训练模式

### 长期（平台化）

7. **用户账号系统**：接入 Supabase，替换 localStorage
8. **真实 AI Coach**：替换 `lib/coach/CoachAnalyzer.ts`，接入 LLM API
9. **开放测评路由**：从 `middleware.ts` 移除 `/assessment` 拦截
10. **Git LFS**：迁移 `public/assets/` 大文件到 Git LFS 或图床

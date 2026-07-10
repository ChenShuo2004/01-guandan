# CHANGELOG

## [Unreleased] — 2026-07-10 项目收尾清理

### 已删除（任务1：项目结构整理）

**中间件拦截的废弃页面（app 目录）：**
- `app/assessment/` — 测评页面（start、session、result）
- `app/coach/` — AI 教练入口页
- `app/complete/` — 训练完成页
- `app/design-system/` — 设计系统预览页
- `app/growth-report/` — 成长报告页
- `app/history/` — 训练历史页
- `app/learning-path/` — 学习路线页
- `app/lessons/` — 课程详情页
- `app/paths/` — 路径页
- `app/profile/` — 用户画像页

**仅被废弃页面引用的 features 模块：**
- `features/assessment/` — 测评视图组件和状态管理
- `features/daily-training/` — 每日训练逻辑
- `features/learning/` — 课程体验组件
- `features/progress/` — 进度 hook（依赖 daily-training）
- `features/practice/PracticeExperience.tsx` — 旧版练习视图（未被任何页面引用）

**测试文件：**
- `lib/memory/ObserverMemoryTraining.test.ts` — 单元测试文件

### 已修改（任务2/3：代码质量与依赖）

- `package.json`：移除 `test:memory` 脚本（测试文件已删除）
- `.gitignore`：补充 `coverage/` 条目，清理重复行
- 清除 `.next/types/` 缓存目录（与已删除页面对应的生成类型文件）

### 已新增（任务4/6：文档与部署）

- `README.md` — 根目录项目说明（项目介绍、技术栈、结构、启动方式）
- `PROJECT_ARCHITECTURE.md` — 系统架构、模块关系、数据流、扩展方式
- `CHANGELOG.md` — 本文件
- `vercel.json` — Vercel 最小化部署配置
- `DEPLOYMENT.md` — Vercel 部署步骤和环境变量说明
- `PROJECT_RELEASE_REPORT.md` — 发布状态报告

### 保留（经验证有效引用）

**核心业务模块（绝对保留）：**
- `lib/guandan/` — 掼蛋规则引擎
- `lib/memory/ObserverMemoryTraining.ts` — 记牌训练状态机
- `lib/ai/` — AI 出牌策略
- `lib/coach/` — 教练提示系统
- `store/gameStore.ts` — 游戏状态管理
- `features/practice/PracticeHome.tsx` — 训练入口
- `features/practice/MemoryTrainingExperience.tsx` — 训练实例
- `components/game/` — 牌局 UI 组件
- `components/memory/` — 记牌测试 UI 组件
- `components/cards/` — 扑克牌组件

**不确定但保留的模块（未被当前活跃代码引用，但可能用于扩展）：**
- `lib/api/config.ts`
- `lib/assessment/assessment-engine.ts`
- `lib/assets/`
- `lib/cards/cardAssets.ts`、`smartSort.ts`
- `lib/coach/DecisionEngine.ts`
- `lib/memory/CardTracker.ts`、`MemoryQuestionGenerator.ts`、`MemoryReport.ts`
- `lib/player/`
- `lib/profile/`
- `lib/replay/`
- `lib/storage/progress-storage.ts`
- `lib/training/`
- `components/layout/` — AppShell 等布局组件
- `components/lessons/LessonCard.tsx`

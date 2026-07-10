# 前端优化体检报告

## 结论摘要

- 当前项目构建通过，问题重点不在编译稳定性，而在主链路页面的客户端负担和资源加载成本。
- 当前最值得优先优化的是 `/`、`/practice`、`/practice/[practiceId]`。
- 首屏路由 `/` 与 `/practice` 页面内容较轻，但 `First Load JS` 都达到 `139 kB`，说明动画和背景层把本应很轻的页面做重了。
- `/practice/[practiceId]` 的 `First Load JS` 为 `154 kB`，对训练场这种强交互页面还算可接受，但内部存在明显的全量重渲染点，继续堆功能后会很快变卡。

## 基线结果

执行了生产构建，结果如下：

- `/`：`3.93 kB`，`First Load JS 139 kB`
- `/practice`：`4.25 kB`，`First Load JS 139 kB`
- `/practice/[practiceId]`：`25.9 kB`，`First Load JS 154 kB`
- Shared JS：`87.1 kB`
- Middleware：`26.6 kB`

说明：

- 构建成功，类型检查与 lint 也未暴露项目级阻断问题。
- 共享包偏大，但更值得先动的是两个轻页面本身仍然需要大量客户端 JS。

## P0：最高优先级问题

### 1. 开场页和训练入口页过度客户端化

涉及文件：

- `app/page.tsx`
- `app/practice/page.tsx`
- `components/scene/OpeningScene.tsx`
- `features/practice/PracticeHome.tsx`
- `components/scene/SceneBackground.tsx`

问题：

- `/` 和 `/practice` 都是非常轻的营销/入口页，但使用了 `framer-motion` 和完整的客户端背景组件。
- `OpeningScene`、`PracticeHome`、`SceneBackground` 都是 `use client`，导致页面为了少量入场动画承担额外 JS。
- `SceneBackground` 里同一张背景图被渲染了两次，而且都设置了 `priority` 和 `quality={95}`，其中一层还带模糊，首屏图片解码和绘制成本偏高。

影响：

- 首屏下载、解析、Hydration 成本偏高。
- 手机端首屏更容易因为动画和大图导致进入速度变慢。

建议：

- 把 `/` 和 `/practice` 改回服务端页面，能用 CSS 完成的动效不要放到 `framer-motion`。
- 将 `SceneBackground` 拆成：
  - 纯静态背景层
  - 可选轻量动画层
- 去掉双 `priority` 大图，只保留一张主背景图，光效改为 CSS 渐变或伪元素。
- 降低背景图质量或按端上场景调低尺寸策略。

预期收益：

- 这是最有机会直接压低 `/` 和 `/practice` 首屏 JS 的一组改动。

### 2. `GameArena` 是训练页的单点重组件

涉及文件：

- `components/game/GameArena.tsx`
- `store/gameStore.ts`

问题：

- `GameArena` 集中处理了牌局展示、全屏、方向判断、AI 倒计时、用户倒计时、设置、弹层、牌桌、操作栏、提示区等多类职责。
- 组件内部有大量 `useState`、`useEffect` 和定时器逻辑，耦合度很高。
- AI 倒计时和用户倒计时每秒更新一次 `turnAction`，会驱动 `GameArena` 整体重新渲染。
- `useGameStore` 实际是页面级 `useReducer`，不是按片段订阅的外部 store，因此状态一变，整棵训练树容易一起刷新。

影响：

- 当前功能还能跑，但继续增加教学提示、动画或统计面板后，训练页会更容易出现掉帧和操作迟滞。

建议：

- 先把 `GameArena` 拆成“牌桌区、手牌区、顶部 HUD、弹层区、训练控制器”。
- 倒计时状态从主状态中剥离，尽量局部更新，不要每秒推动整个训练场重渲染。
- 对稳定子组件增加 `memo` 边界，尤其是：
  - `GameTable`
  - `HandCards`
  - `CardCounter`
  - 顶部栏与浮动工具

预期收益：

- 改善训练页在移动端和低性能设备上的流畅度。

### 3. 父子组件之间存在高频状态上抛

涉及文件：

- `features/practice/MemoryTrainingExperience.tsx`
- `components/game/GameArena.tsx`

问题：

- `GameArena` 通过 `onObserverStateChange` 把整份 `state` 持续回传给 `MemoryTrainingExperience`。
- `MemoryTrainingExperience` 再根据 `state?.history` 去做 `tracker.snapshot(...)` 和记牌题目判断。
- 这意味着训练场每次状态变化时，父组件也会同步参与渲染与计算。

影响：

- 记牌训练模式下，训练页不仅子树在更新，外层容器也被频繁带动。

建议：

- 不要把完整牌局状态持续上抛。
- 只在真正需要的节点上抛事件，例如：
  - 新增一个 checkpoint
  - 牌局结束
  - 触发记牌测试
- `tracker.snapshot(history)` 应只在 checkpoint 或提交答案时计算，而不是跟随所有状态变化重算。

预期收益：

- 直接降低观察模式下的重复渲染和无效计算。

## P1：中优先级问题

### 4. 根布局挂载背景音乐组件，增加全局共享负担

涉及文件：

- `app/layout.tsx`
- `components/audio/TrainingCampMusic.tsx`

问题：

- `TrainingCampMusic` 放在根布局中，意味着所有页面都会带上这段客户端逻辑。
- 虽然它只在 `/practice` 前缀下播放，但组件本身仍进入全局装载路径。

建议：

- 将音乐组件下沉到训练相关 layout 或训练页容器中。
- 只让需要声音的页面拥有这段客户端逻辑。

### 5. 存在大量 `use client` 组件

扫描结果：

- `app`、`components`、`features` 下共发现 `53` 个 `use client` 文件。

问题：

- 当前客户端边界偏宽，部分纯展示组件也被卷进客户端树。

建议：

- 逐步收紧 `use client` 边界。
- 页面文件保持服务端，真正需要交互的局部组件再下沉为客户端组件。

### 6. 多个入口页仍引用较重的动画依赖

问题：

- 项目内至少 `24` 处直接使用了 `framer-motion`。
- 对训练页这类高交互页面可以保留，但对于开场页、入口页、信息页应更克制。

建议：

- 页面入口动画优先 CSS。
- `framer-motion` 留给真正需要手势、布局动画、卡牌过渡的区域。

## P2：工程层优化

### 7. 被 middleware 隐藏的页面仍参与构建

涉及文件：

- `middleware.ts`
- `app/assessment/*`
- `app/coach/*`
- `app/learning-path/*`
- `app/profile/*`
- 其他被重定向页面

问题：

- 这些页面虽然线上会被重定向到 `/practice`，但在当前构建中仍被编译、生成和检查。
- 这更影响构建时间和维护复杂度，而不是直接影响用户首屏。

建议：

- 如果这些能力暂不开放，可以迁移到实验目录、特性开关或单独分支。
- 至少避免它们继续引入新的共享依赖。

### 8. 路由跳转存在整页刷新

涉及文件：

- `features/practice/MemoryTrainingExperience.tsx`

问题：

- 使用了 `window.location.assign("/practice")`。

建议：

- 改成 `router.push("/practice")`，避免不必要的整页刷新。

## 推荐实施顺序

### 第一批：立刻见效

1. 精简 `/` 与 `/practice` 的客户端逻辑
2. 重做 `SceneBackground`，去掉双重 `priority` 大图
3. 将 `TrainingCampMusic` 下沉到训练链路

### 第二批：训练页性能

1. 缩小 `GameArena` 职责
2. 将倒计时更新从整页状态里拆出来
3. 减少 `MemoryTrainingExperience` 的整状态上抛
4. 给稳定子组件加 `memo` 边界

### 第三批：工程收敛

1. 清理暂未开放页面的共享依赖
2. 逐步减少 `use client`
3. 将展示型动效从 `framer-motion` 改为 CSS

## 我建议你下一步直接做什么

如果要我直接开始改，最推荐先做下面这一组：

1. 优化 `/` 和 `/practice` 的首屏负担
2. 下沉 `TrainingCampMusic`
3. 第一轮拆分 `GameArena` 的倒计时与观察态上抛

这三项改完，通常就能同时得到：

- 更轻的首屏
- 更低的共享 JS 压力
- 更稳的训练页交互表现

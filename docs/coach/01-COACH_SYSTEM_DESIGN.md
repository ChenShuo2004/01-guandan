# AI Guandan Coach System Design

## 1. Coach 产品定位

AI 掼蛋教练不是聊天助手，也不是装饰头像，而是产品里的训练中枢。它负责把课程、残局、复盘和成长系统串成一个连续的学习体验，让用户每次打开都知道下一步该练什么、为什么这么出牌、错在哪里、如何变强。

教练服务的核心用户是想快速提升掼蛋实战判断的新手和进阶玩家。他们不需要长篇理论，更需要短、准、能马上用的出牌提示、错误纠正和复盘建议。

核心职责：

1. 引导用户进入今日训练。
2. 在课程中解释单个知识点。
3. 在残局中反馈出牌选择。
4. 在复盘中总结关键错误。
5. 在成长系统中强化进步感和持续练习。

关系定义：

- 课程：Coach 是讲解者，只讲一个知识点，配合牌面和图解。
- 残局：Coach 是陪练员，根据用户选择给结构化反馈。
- 复盘：Coach 是分析师，只指出最大收益点和下一次训练方向。
- 成长系统：Coach 是长期陪伴者，用等级、连续训练和错题回看推动留存。

## 2. Coach 状态系统

State 表示教练为什么出现，决定语义、语气和交互目标。

| State | 使用场景 | 触发条件 | 用户心理目标 | 推荐语气 | 推荐动作 |
| --- | --- | --- | --- | --- | --- |
| welcome | 首页、训练入口、首次打开 | 进入首页、开始训练、今日任务刷新 | 让用户知道现在该做什么 | 轻松、直接 | wave |
| teaching | 课程、知识点、牌面讲解 | 进入 LessonStep 或用户点开重点 | 让用户一秒理解规则和判断 | 专业、简短 | point |
| praise | 答对、完成训练、连续进步 | 选择正确、完成课程、达成 streak | 强化信心和继续练习 | 克制鼓励 | happy |
| correcting | 答错、高风险选择、误用炸弹 | 选择错误、触发风险提示 | 降低挫败，明确改法 | 冷静、坚定 | warning |
| thinking | 等待用户判断、轻提示、分析中 | 用户未选择、请求提示、AI 分析中 | 保留思考空间，不直接剧透 | 平静、启发 | thinking |
| review | 完成题目后的复盘、错题回看 | 答题结束、进入复盘页、训练总结 | 建立可迁移的实战经验 | 总结、聚焦 | point |

## 3. Coach 动作系统

State = 为什么出现。Action = 如何表现。

动作只表达前端状态，不承载业务判断。V1 使用占位头像和气泡表现，V2 再接动画资源。

| Action | 含义 | V1 表现 |
| --- | --- | --- |
| idle | 默认待机 | 圆形头像静止 |
| wave | 欢迎和引导 | 头像文案变化或轻微出现 |
| point | 指向重点 | 高亮提示牌面或文字 |
| happy | 正向反馈 | 成功色、短鼓励 |
| warning | 纠错和风险 | 警示色、短纠错 |
| thinking | 思考和等待 | 中性色、分析提示 |
| celebrate | 完成和升级 | 完成态、轻庆祝 |

State 到 Action 映射：

| State | 默认 Action | 可选 Action |
| --- | --- | --- |
| welcome | wave | idle |
| teaching | point | thinking |
| praise | happy | celebrate |
| correcting | warning | point |
| thinking | thinking | idle |
| review | point | thinking |

向后兼容规则：

- 旧 `correct` 可映射为 `state: praise, action: happy`。
- 旧 `wrong` 可映射为 `state: correcting, action: warning`。
- 旧 `celebrate` 可保留为 Action，用于完成态。
- 现有 `CoachBubble` 和 `CoachAvatar` 不需要立刻删除。

## 4. Coach 消息结构设计

未来统一结构建议：

```ts
type CoachState =
  | "welcome"
  | "teaching"
  | "praise"
  | "correcting"
  | "thinking"
  | "review";

type CoachAction =
  | "idle"
  | "wave"
  | "point"
  | "happy"
  | "warning"
  | "thinking"
  | "celebrate";

interface CoachMessage {
  id: string;
  state: CoachState;
  action: CoachAction;
  text: string;
  tone: "calm" | "encouraging" | "serious" | "celebrating";
  placement: "inline" | "floating" | "bottom-sheet" | "review";
  duration: "instant" | "short" | "until-action";
  reason?: string;
  nextAction?: string;
  source: "static" | "rule" | "ai";
}
```

真实 AI 接入时，AI 只能返回结构化 `CoachMessage` 或 `CoachResponse`，不能直接输出不可控长文本。前端根据 `state`、`action`、`placement` 渲染，而不是解析自然语言。

## 5. 教练出现规则

应该出现：

1. 用户进入首页，需要知道今日训练方向。
2. 课程出现关键牌理，需要一句话讲透。
3. 用户答题后，需要即时反馈。
4. 用户连续错误，需要降低挫败并给下一步。
5. 训练完成，需要总结和引导下一次练习。

应该隐藏：

1. 用户正在读牌面或选择答案时。
2. 牌桌空间不足且提示会遮挡手牌时。
3. 同一知识点已经提示过一次时。
4. 用户正在复盘步骤中主动滑动查看时。

主动提示：

- 用户停留超过设定时间仍未选择，可以给轻提示。
- 用户连续选错同类题，可以提示回到对应课程。
- 用户完成今日训练，可以推荐下一个最小训练动作。

等待用户思考：

- 残局出牌前不直接给答案。
- 提示只说判断方向，例如“先看队友剩几张”，不说“选 A”。
- 重要选择前最多出现一次轻提示。

## 6. 对话设计规范

句子规则：

- 单句尽量不超过 15 个汉字。
- 一次反馈最多 3 句。
- 先结论，再原因，再下一步。
- 不羞辱用户，不夸张吹捧。
- 不输出大段理论。

反馈结构：

```txt
判断。
原因。
下一步。
```

表扬方式：

```txt
这步不错。
你先看了牌权。
下一题练队友配合。
```

错误纠正方式：

```txt
这里别急着炸。
队友只剩 2 张。
先看他能不能接。
```

复盘方式：

```txt
这局最大问题是太早交炸。
炸弹要换牌权。
不是用来出气。
```

掼蛋场景案例：

- welcome：今天先练一题残局。重点看牌权。
- teaching：炸弹要改变局势，不是单纯压牌。
- praise：很好。你把主动权抢回来了。
- correcting：这里不该过。对手只剩 2 张。
- thinking：先别选。看队友还有几张。
- review：这题记住一句话：队友快走，先帮队友。

## 7. UI 交互设计

移动端优先，390px 到 430px 宽度为基准。

首页：

- 位置：内容流顶部或桌面端右侧栏。
- 作用：今日问候、推荐训练入口。
- 不使用全屏欢迎页。

学习页：

- 位置：课程步骤中的 inline CoachBubble。
- 作用：解释当前知识点。
- 原则：一个知识点只出现一次关键提示。

残局页：

- 位置：答题前隐藏或轻提示；答题后出现在选项下方。
- 作用：反馈选择结果。
- 原则：不遮挡手牌、牌桌和选项。

复盘页：

- 位置：复盘步骤顶部或每个关键步骤下方。
- 作用：总结错误、指出正确打法。
- 原则：只讲最大问题，不堆多个建议。

浮动教练：

- V1 不强制做全局右下角。
- 只有在不遮挡牌桌、手牌、选项时使用。
- 复杂牌桌页优先 inline 或 bottom-sheet。

## 8. V1 / V2 / V3 演进路线

V1：占位头像 + 气泡 + 简单状态。

- 保留现有 `CoachAvatar`、`CoachBubble`。
- 增加 `CoachState` 语义层。
- 统一课程、题目、残局的反馈结构。
- 使用本地静态数据和规则，不接真实 AI。
- 不生成角色图，不做复杂动画。

V2：动画角色。

- 接入轻量动作资源，例如 Lottie 或 SVG。
- 每个 State 配一组短动作。
- 增加牌面高亮、指向和轻反馈动画。
- 仍然避免复杂数字人和长视频。

V3：AI 个性化教练。

- 根据用户错题、等级、连续训练生成个性化提示。
- AI 返回结构化 `CoachMessage`。
- 支持不同教练风格，但共享同一套状态和动作协议。
- 引入学习路径推荐、错题复训和复盘摘要。

## 后续代码改造建议

1. 在 `types/coach.ts` 增加 `CoachState`，保留现有 `CoachAction`。
2. 给 `CoachResponse` 增加可选 `state` 字段，保证旧数据不报错。
3. 新增 `CoachMessage`，作为未来统一消息模型。
4. 建立 `stateToDefaultAction` 映射，减少页面手写 action。
5. 让课程、残局、题目逐步从 `action` 直连迁移到 `state + action`。
6. 后续再考虑 `CoachScene` 或 `CoachProvider`，不要 V1 过早复杂化。

## 当前项目保留与升级

必须保留：

- `CoachAvatar`：继续作为 V1 占位头像。
- `CoachBubble`：继续作为 V1 核心展示组件。
- `CoachResponse`：继续服务 quiz 和 practice。
- `LessonStep type: "coach"`：继续服务课程内容。
- 本地静态内容和 `localStorage` 进度方案。
- V1 不接真实 AI、不调用图片生成、不做复杂动画的边界。

需要升级：

- `CoachAction` 需要从“业务语义混合体”升级为纯表现动作。
- 新增 `CoachState` 表达欢迎、讲解、表扬、纠错、思考、复盘。
- 文档需要从单个角色圣经升级为 Coach Design System。
- 训练反馈需要统一成可被 AI、规则和静态内容共同生成的结构。
- UI 规则需要明确什么时候出现、什么时候隐藏，避免教练话太多。

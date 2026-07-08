# 内容生产流程

本文档定义课程、残局、题目和素材的生产流程。目标是让内容扩展主要通过数据和素材完成，而不是反复修改页面代码。

## 1. 内容结构

所有知识采用：

```txt
Category
└── Lesson
    └── LessonStep
        ├── CoachStep
        ├── ImageStep
        ├── AnimationStep
        ├── ComparisonStep
        ├── PokerCaseStep
        └── QuizStep
```

练习采用：

```txt
PracticeCase
├── Situation
├── Players
├── MyHand
├── Options
├── CorrectAnswer
├── CoachFeedback
└── ReplaySteps
```

## 2. 课程生产规则

每节课只讲一个知识点。

标准结构：

1. 标题
2. 一句口诀
3. AI 教练提示
4. 核心图解或动画
5. 一句解释
6. 错误示范
7. 正确示范
8. 小练习
9. 下一课

文字规则：

1. 不写长文章。
2. 不连续堆积大段文字。
3. 先给结论，再给原因。
4. 每一步只传达一个重点。

## 3. 数据驱动规则

课程内容必须放在：

```txt
content/lessons/
content/quizzes/
content/cases/
content/topics/
content/paths/
```

页面只负责：

1. 读取数据
2. 选择组件
3. 渲染结构
4. 触发交互

页面禁止：

1. 硬编码课程文案
2. 硬编码题目选项
3. 硬编码图片路径
4. 硬编码动画时间轴

## 4. 素材流程

静态素材后续流程：

1. 明确课程主题和目标用户。
2. 判断需要课程图、对比图、专题图还是角色图。
3. 生成图片提示词。
4. 使用图片生成 Skill 生成素材。
5. 保留原始 PNG。
6. 导出 WebP。
7. 写入 `image-manifest.json`。
8. 课程数据通过 `assetId` 引用。

V1 阶段不调用图片生成 Skill，只使用占位资源。

## 5. 扑克牌内容规则

准确牌面不进入图片生成流程。

扑克牌必须使用：

1. `PokerCard`
2. `PokerHand`
3. `CardTable`
4. `CardGroup`

原因：

1. AI 图片生成无法保证牌面准确。
2. 训练题需要可控交互。
3. 后续动画需要直接操作牌组件。

## 6. 视频规则

课程短视频由用户后续自行提供。

系统只预留：

1. 视频字段
2. 视频展示组件
3. 外部素材引用

不做：

1. 自动生成课程短视频
2. 自动剪辑视频
3. 调用视频生成 Skill

## 7. 内容验收标准

1. 新增课程不需要改页面结构。
2. 新增残局不需要改练习页面结构。
3. 课程数据字段完整。
4. 素材通过 Manifest 管理。
5. 扑克牌内容由组件渲染。
6. 教练反馈短句化、结构化。

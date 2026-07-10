# 项目文档索引与状态

本文件用于防止产品规划、历史设计和当前代码互相混淆。

## 当前需求真源

以下文件描述当前可运行功能，优先级最高：

1. docs/PRODUCT_PROTOTYPE_MVP_V1.md
2. docs/PRODUCT_EXPERIENCE_RULES.md
3. docs/ARCHITECTURE.md
4. docs/PROJECT_OVERVIEW_FOR_GPT.md
5. AGENTS.md 的“当前项目功能基线”章节
6. docs/CODE_WIKI.md（开发者代码导读，不作为产品需求真源）

当前开放功能只有：

- /：OpeningScene。
- /practice：记牌训练入口。
- /practice/[practiceId]：记牌训练。
- 记牌训练内部使用 GameArena observerMode；当前没有独立 /training 路由。

## 文档边界

当前仓库只保留当前功能文档。未来规划、历史设计和视觉实验不再作为项目文档维护。

## 状态标记规则

每一个新增功能必须标记为：

- 预留：代码可能存在，但用户入口不可访问。
- 开发中：有入口或部分实现，但未通过完整验收。
- 已实现：用户可访问、主流程可操作、验收通过。

只有“已实现”功能才能出现在当前产品首页、导航和当前验收标准中。

## 给 GPT 的阅读顺序

~~~text
AGENTS.md
→ docs/README.md
→ docs/PRODUCT_PROTOTYPE_MVP_V1.md
→ docs/PRODUCT_EXPERIENCE_RULES.md
→ docs/ARCHITECTURE.md
→ 与本次任务相关的代码
~~~

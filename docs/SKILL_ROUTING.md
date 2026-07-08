# Skill 路由规范

本文档定义什么时候使用图片、动画和其他生产 Skill。V1 阶段暂时不调用任何图片生成或动画 Skill，只建立路由规则。

## 1. V1 禁用范围

第一阶段不要调用：

1. 图片生成 Skill
2. 动画生成 Skill
3. 视频生成 Skill
4. AI 识图接口
5. AI 牌局分析接口

所有相关位置先使用占位资源和 service 预留。

## 2. 后续图片生成路由

适合使用 GPT Image 2 Skill / image2skill：

1. AI 教练角色图
2. AI 教练动作姿势
3. 课程知识图
4. 错误示范图
5. 正确示范图
6. 专题 Banner
7. 首页 Banner
8. 残局背景图

不适合使用图片生成：

1. 准确扑克牌牌面
2. 实时手牌交互
3. 可控出牌动画
4. 页面说明文字
5. 课程短视频

## 3. 后续动画路由

### 3.1 Framer Motion

用于：

1. 页面进入
2. 卡片切换
3. 按钮反馈
4. 进度条
5. 单张牌选中
6. 简单答题反馈

### 3.2 GSAP

用于：

1. 连续发牌
2. 多牌组合移动
3. 炸弹效果
4. 残局复盘时间轴

只有当 Framer Motion 不够表达复杂牌局顺序时，才引入 GSAP。

### 3.3 Lottie / SVG

用于：

1. AI 教练循环动作
2. 挥手
3. 点头
4. 思考
5. 庆祝

## 4. 素材保存规则

图片素材：

```txt
assets/source/
public/generated/
assets/manifests/image-manifest.json
```

动画素材：

```txt
public/animations/
assets/manifests/animation-manifest.json
```

规则：

1. 生成素材必须保存原始文件。
2. 网页使用压缩后的 WebP 或合适格式。
3. 所有素材必须写入 Manifest。
4. 页面只通过 `assetId` 或 `animationId` 引用。

## 5. Codex 执行流程

后续创建动态课程内容时，按以下顺序：

1. 读取课程主题、难度和目标用户。
2. 生成课程步骤结构。
3. 判断每一步需要文字、图片、牌组件还是动画。
4. 牌面内容使用前端牌组件。
5. 静态插图才进入图片生成。
6. 页面微交互使用 Framer Motion。
7. 复杂牌局时间轴才使用 GSAP。
8. 角色循环动作才使用 Lottie / SVG。
9. 保存素材并更新 Manifest。
10. 运行类型检查、lint 和 build。

## 6. 安全边界

1. 不自动生成课程短视频。
2. 不让图片生成承担准确牌面。
3. 不在页面中散落素材路径。
4. 不为了炫技引入复杂动画。
5. 不在 V1 直接接入数据库或 AI 接口。

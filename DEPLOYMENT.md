# 部署指南

## Vercel 部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

1. 登录 [vercel.com](https://vercel.com)
2. 点击 **Add New → Project**
3. 导入 GitHub 仓库 `ChenShuo2004/01-guandan`
4. Vercel 会自动检测 Next.js 框架，使用以下配置：
   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. 配置环境变量（见下方）
6. 点击 **Deploy**

### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 在项目根目录运行
vercel

# 首次部署会引导配置，后续直接运行 vercel --prod 部署生产环境
vercel --prod
```

## 环境变量配置

在 Vercel Dashboard → Project → Settings → Environment Variables 中配置：

| 变量名 | 说明 | 是否必填 | 示例值 |
|--------|------|----------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 地址（V1 前端独立运行，可留空或填占位值） | 否 | `https://api.example.com` |
| `FRONTEND_ORIGIN` | 后端 CORS 允许的前端地址（仅后端服务需要） | 否 | `https://your-app.vercel.app` |

> **注意**：V1 版本前端完全独立运行，不依赖后端 API。`NEXT_PUBLIC_API_BASE_URL` 在前端代码中已预留但当前未实际调用。

## Next.js 配置说明

项目 `next.config.mjs` 中配置了：
- 开发模式输出到 `.next-dev/`（避免与生产构建冲突）
- 生产构建输出到 `.next/`（Vercel 默认读取此目录）

Vercel 部署时 `NODE_ENV=production`，会正确使用 `.next/` 输出目录。

## 常见错误处理

### 构建失败：模块未找到

```
Error: Cannot find module '@/...'
```

检查 `tsconfig.json` 的 `paths` 配置，确保 `@/*` 指向项目根目录。

### 构建失败：TypeScript 错误

本地运行检查：
```bash
npm run typecheck
```

### 构建失败：ESLint 错误

本地运行检查：
```bash
npm run lint
```

### 页面路由问题

`middleware.ts` 会将未开放路由重定向到 `/practice`。如需开放新路由，从 `middleware.ts` 的 `hiddenProductPrefixes` 数组中移除对应前缀。

### 静态资源缺失

大型静态资源（图片、音频）位于 `public/assets/`，确保 Git 中已提交这些文件。

## Node.js 版本

建议使用 Node.js 20 或 22（LTS）。Vercel 默认使用 Node.js 20，可在 Project Settings → General → Node.js Version 中指定。

## 预览部署

每次推送到非主分支，Vercel 会自动创建预览部署，URL 格式为：
```
https://01-guandan-[branch-slug]-[team].vercel.app
```

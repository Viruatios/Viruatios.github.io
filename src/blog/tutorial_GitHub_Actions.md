---
title: "使用 GitHub Actions 部署 Astro 到 GitHub Pages"
pubDate: 2026-02-10
description: "配置 GitHub Actions 自动构建并部署 Astro 站点到 GitHub Pages。"
author: "GitHub Copilot"
image:
  url: "/GitHub_Invertocat_Black.svg"
  alt: "GitHub logo"
tags: ["GitHub Actions", "Astro", "GitHub Pages", "tutorial"]
---

本教程适用于：

- 使用 Astro 构建的静态站点
- 希望部署到 GitHub Pages
- 使用 GitHub Actions 自动构建与发布

---

## 1. 为什么需要 GitHub Actions？

Astro 不是“纯静态文件”，它需要 **先构建（build）** 才能生成可部署的 `dist/` 目录。  
GitHub Pages 默认只能发布静态文件，所以我们需要 Actions 来自动完成这一步：

**流程概览：**

1. 代码推送到 GitHub
2. Actions 自动执行 `npm install` 和 `npm run build`
3. 将构建产物 `dist/` 上传到 Pages
4. GitHub Pages 发布新内容

---

## 2. 创建部署 Workflow

在仓库根目录新建文件：

```
.github/workflows/deploy.yml
```

写入以下内容（手动根据GitHub Marketplace中的最新版本更新）：

```yaml
name: Deploy Astro to GitHub Pages

on:
  push:
    branches: ["main"] # 如果你用 master，请改成 master
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node.js environment
        uses: actions/setup-node@v6
        with:
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build with Astro
        run: npm run build

      - name: Upload GitHub Pages artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy GitHub Pages site
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 3. 在仓库设置里启用 Pages

进入仓库：

**Settings → Pages → Build and deployment**  
选择：**GitHub Actions**

这样 GitHub 就会使用你刚才配置的 workflow 来部署。

---

## 4. 提交并推送

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deploy workflow"
git push
```

推送后自动开始部署。  
部署完成后站点地址为：

```
https://<你的用户名>.github.io/
```

---

## 5. 常见问题

### Q1. 如果我的仓库不是 `<username>.github.io`？

比如仓库叫 `my-blog`，网址会是：

```
https://<username>.github.io/my-blog/
```

这时必须在 `astro.config.mjs` 加 base：

```js
import { defineConfig } from "astro/config";

export default defineConfig({
	base: "/my-blog/",
});
```

否则静态资源路径会错。

---

### Q2. 构建输出不是 dist/ 怎么办？

如果你在 `astro.config.mjs` 改过输出目录，例如：

```js
export default defineConfig({
	outDir: "build",
});
```

那 workflow 中 `Upload artifact` 的 `path` 也要改成：

```yaml
with:
  path: ./build
```

---

### Q3. Actions 失败怎么排查？

进入仓库 → **Actions**  
点击最新 workflow → 进入失败步骤 → 查看日志

常见错误：

- `npm ci` 失败：依赖损坏或 Node 版本问题
- `npm run build` 失败：某个组件代码错误
- `Upload artifact` 失败：输出目录不存在（可能是 build 没生成）

---

### Q4. 如何手动触发部署？

因为 workflow 里有 `workflow_dispatch`，你可以在 Actions 页面手动点击 **Run workflow**。

---

## 6. 推荐保持的目录结构

```
src/
  pages/        # 页面
  components/   # 组件
  layouts/      # 布局
public/         # 静态资源（图片/小游戏）
```

小游戏可放入：

```
public/games/<game-name>/
```

访问路径：

```
https://<username>.github.io/games/<game-name>/
```

---

## 7. 最小工作流总结

✅ 代码 push  
✅ Actions 自动 build  
✅ dist/ 自动发布

之后你每次 `git push`，站点都会自动更新。

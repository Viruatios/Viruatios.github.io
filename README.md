# Viruatios.github.io

[CuLoo's Homepage](https://viruatios.github.io/)

这是一个基于 Astro 的内容驱动站点，使用 React islands、GSAP 动画和 TypeScript。
项目在保留 Astro 教程学习路径的同时，持续演进为可维护的个人站点。

## 技术栈

- Astro 6
- React 19（通过 `@astrojs/react` 集成 islands）
- GSAP（SVG 吉祥物动画）
- TypeScript

## 目录说明

- `src/pages/`：页面路由
- `src/blog/`：博客 Markdown 内容
- `src/layouts/`：页面与文章布局
- `src/components/`：可复用组件（含吉祥物与导航）
- `src/scripts/`：浏览器侧脚本（菜单、导航下划线、主题、动画）
- `src/styles/`：全局样式与模块化样式

## 内容与路由约定

- 新文章必须放在 `src/blog/`，不要放在 `src/pages/`。
- 文章 frontmatter 需要满足 `src/content.config.ts` 中 `blog` 集合 schema。
- 博文详情页由 `src/pages/posts/[...slug].astro` 使用 `getCollection("blog")` 生成。
- 标签页由 `src/pages/tags/index.astro` 与 `src/pages/tags/[tag].astro` 基于 `post.data.tags` 生成。

## 本地开发

```bash
npm install
npm run dev
```

其他命令：

- `npm run build`：构建到 `dist/`
- `npm run preview`：本地预览构建产物

## 部署

- GitHub Pages 工作流见 `.github/workflows/deploy.yml`
- 核心流程：`npm ci` -> `npm run build` -> 上传 `dist` -> `actions/deploy-pages`

## Copilot 协作说明

- 项目级 Copilot 指令在 `.github/copilot-instructions.md`。
- 当目录结构、关键脚本或约定变化时，请同步更新：
  - `.github/copilot-instructions.md`
  - `README.md`
  - `src/blog/Copilot Instructions Guide.md`

相关学习资料：

- [Astro 文档：搭建博客教程](https://docs.astro.build/zh-cn/tutorial/0-introduction/)
- [通过 GitHub Pages 使用自定义工作流](https://docs.github.com/zh/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [本仓库部署说明（博客文章）](./src/blog/tutorial_GitHub_Actions.md)

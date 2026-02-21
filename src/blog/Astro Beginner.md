---
title: "My First Blog Post as an Astro Beginner"
pubDate: 2026-02-10
description: "This is my first post on my Astro blog."
author: "CuLoo"
image:
  url: "https://docs.astro.build/assets/rose.webp"
  alt: "The Astro logo on a dark background with a pink glow."
tags: ["Astro", "JavaScript", "Web Development", "Personal Journey"]
---

## 我做了什么

正如我在README.md中所说的，我正在尝试制作一个我的个人主页CuLoo's Homepage，Copilot将在最初的构思、框架选择、Astro入门、仓库建立与更新、GitHub Actions自动部署等方面全程参与，之后的编程工作、测试工作等也将尝试使用Copilot进行尽可能流程化的协助。

在之前，我已经完成了一个最小可用版本。在此基础上，我又增添了about页面，又增添了blog页面。现在，我正在编写这篇markdown文本，作为我的第一篇博客文章。

在第二天，在About CuLoo页面用上了Astro开头的JavaScript frontmatter。

在第三天，先在About CuLoo页面上试了试定义单页样式，然后用上了通过CSS定义的全局样式。学着重构了HeaderNavigation组件，新增而且调用了Header组件、Footer组件、Social组件等等。

在第四天，学着为HeaderNavigation组件添加了CSS响应式样式。写出了第一段用于交互的JavaScript脚本。

在第五天，将这段用于交互的脚本独立到了第一个JavaScript文件。学着重构了BaseLayout布局，给MarkDown文件也添加了新的布局。

在第六天，学着使用了Astro的import.meta.glob功能，获取posts目录下的所有md文件，并且在blog页面上动态生成列表。使用TypeScript动态读取所有文章的tags并创建数组，然后创建了一个标签索引页。用上了Astro Islands，编写了一个<span title = "client:load, visible, media, ... 指令告诉 Astro 在页面加载时将其 JavaScript 发送到客户端上并在某些条件下运行，使得组件可交互。这称为被注水的组件。" style="border-bottom:1px dotted; cursor:help;">被注水的组件</span>。实现了亮暗模式切换。将文章管理从原本的基于文件路由改为了使用内容集合。

到这里，Astro的入门教程就完成了。

## 我将做什么

首先，把Astro的入门教程完成。（在2026-02-15完成！）

接下来，也许我会尝试继续完善CuLoo's Homepage，增加更多的功能，并且阶段性地更新这篇博客，以此作为我的开发回顾和总结。

CuLoo's Homepage也许将不止是一个博客，我希望在这里学习实践一些很好玩的东西。未来，我也许会往页面添加很酷的动画，也许会做一些网页小游戏，也许会在这里实践我学习到的前端知识。

让我们继续吧。

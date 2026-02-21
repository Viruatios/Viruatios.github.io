---
title: "Copilot Instructions 让 AI 更了解你的项目"
pubDate: 2026-02-21
description: "一篇教程，讲 Copilot instructions 是什么、为什么要写、怎么写、何时更新。"
author: "GitHub Copilot"
image:
  url: "/GitHub_Invertocat_Black.svg"
  alt: "GitHub logo"
tags: ["Copilot instructions", "AI Coding", "tutorial"]
---

## 为什么需要 Copilot instructions

在使用 Copilot 的过程中，我遇到过两个问题：

1. 代码风格不一致。注释位置、命名方式、字符串引号风格经常和我已有代码不匹配。
2. 内容重复创建。AI 在补充或更新时，忽略已有文件，重新创建一份，导致新旧内容并存。

这两类问题在项目变复杂后会显著降低维护效率。于是我开始把“项目规则”写下来，让 AI 在生成前先读到。Copilot instructions 就是为此而生的。

## Copilot instructions 是什么

Copilot instructions 可以理解为“写给 AI 的项目导览和规则”。它不是需求文档，而是让 AI 在编码时立即了解：

- 项目结构的关键事实（例如内容在哪、路由如何生成）
- 必须遵循的约定（例如博客 frontmatter 字段）
- 真实的工作流程（例如本地开发和部署方式）
- 已存在的参考实现（例如某个组件如何做交互）

一句话：它让 AI 从“通用助手”变成“知道你项目习惯的协作者”。

## 它的作用和必要性

**1) 降低第一次回答的偏差**

没有指引时，AI 往往用“通用做法”来猜你的项目。只要项目有一点点个性化，这个猜测就容易错。Copilot instructions 把关键事实前置，提升第一次命中率。

**2) 强化一致性，减少返工**

例如我明确要求“先改已有文件而不是新建”，这会直接降低重复内容的概率。又比如“参考最近的文件风格”，能减少命名和注释风格不一致的问题。

**3) 提升长期维护效率**

项目越大，AI 的“上下文缺失”问题越明显。用 instructions 补齐关键上下文，是一种长期收益的投入。

## 一般来说应该如何编写

一个简单但有效的结构：

### 1) Project overview：项目大图

用 3 到 6 条描述项目结构和核心数据流。例如：

- 页面在哪个目录
- 内容集合如何生成路由
- 布局组件集中在哪

目的是让 AI 一眼看懂“项目怎么运作”。

### 2) Key patterns：必须遵循的约定

这是最关键的部分。要写“必须遵守”的事实，比如：

- 新文章必须放在哪个目录
- frontmatter 必须包含哪些字段
- 哪些布局必须使用
- 交互组件要不要 hydration

### 3) Dev workflows：真正可用的命令

把 dev/build/preview 的脚本写清楚，部署流程也要提一句，避免 AI 给出错误指令。

### 4) Integration points：跨模块连接

比如使用了 React islands，或者主题切换依赖某个 class，或静态资源存放在哪。

## 编写时要注意的问题

**1) 只写“已经存在的事实”**

不要写“将来会做”的计划，否则 AI 会把它当成事实来执行。

**2) 避免泛泛而谈**

“注意错误处理”“写测试”这种泛化建议对 AI 没用。必须写具体的项目规则。

**3) 控制篇幅，突出关键**

20 到 50 行是一个实践上最有效的长度。太长会稀释重点，太短又容易缺关键规则。

**4) 给出真实例子**

写上具体路径或文件名，让 AI 有可以参考的入口点。

## 什么时候应该更新

以下情况出现时，应更新 Copilot instructions：

- 项目结构改变（例如新增 pages、layouts、content collection）
- 新增关键工作流（例如 CI、部署方式变化）
- 关键约定变化（例如 frontmatter schema 增加字段）
- 引入新技术（例如从 Preact 改为 React islands）
- AI 反复犯同一类错误

一句话：当 AI 的回答频繁偏离你当前做法时，就是更新指引的信号。

## 结合 GitHub Actions 的实践提醒

我在配置 GitHub Pages 自动部署时写过一篇详细教程，并把关键点写进 instructions：

- 构建产物在 dist 目录
- Workflow 监听 main 分支
- 本地构建命令为 npm run build

这样 AI 在回答“如何部署”时会更准确，而不是给出和项目不一致的流程。

## 最后的小结

Copilot instructions 不是“写给 AI 的作文”，而是“写给未来自己的效率工具”。它降低了 AI 的误判成本，也减少了我们反复解释同一件事情的时间。

如果是第一次写，考虑从以下三件事开始：

1. 写清楚项目结构（在哪里放内容）
2. 写清楚必须遵守的约定（尤其是文件位置和格式）
3. 写清楚真实可用的命令（dev/build/deploy）

之后每当 AI 给出的答案“不像你的项目”，就把那条经验补进 instructions。坚持一段时间，会明显感受到 AI 输出质量的提升。

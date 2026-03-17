---
title: "网页动画：GSAP"
pubDate: 2026-03-17
description: "简要介绍 GSAP (GreenSock Animation Platform)，从核心概念到进阶应用。"
author: "Viruatios"
image:
  url: "/CuLooIcon StarVer.svg"
  alt: CuLoo404Mascot
tags: ["JavaScript", "Web Development", "Animation", "GSAP", "tutorial"]
---

在CuLoo's Homepage的开发中，当 CSS 动画或原生 Web Animations API 无法满足我的需求时，我选择求助于进阶的方案——**GSAP (GreenSock Animation Platform)**。

## 一、什么是 GSAP？它适合用在哪？

**GSAP** 是一个稳健、高性能且零依赖的 JavaScript 动画库。

可以把它理解成一个“动画引擎”：

- 你告诉它起点、终点、持续时间。
- 它负责中间每一帧怎么平滑变化。

它不只可以操作 DOM 元素，也能对**几乎所有 JavaScript 对象的数值属性**做补间（Tweening）运算。

### 适用场景：

1. **复杂的网页叙事与特效**：比如苹果官网那种丝滑的滚动视差效果、产品拆解动画。
2. **SVG 路径与图形动画**：复杂形态变化、描边动画，或像我的 404 页面中吉祥物的动态 3D 旋转。
3. **基于滚动的交互**：配合官方著名的 `ScrollTrigger` 插件，可以轻松将动画进度与页面滚动条百分百绑定。
4. **WebGL / Canvas 结合**：不操作 DOM 的情况下，使用 GSAP 去平滑插值 Three.js 或 Canvas 中的相机和多边形属性。

总而言之，当你觉得“`setTimeout` 套娃太多，或者 CSS `transition`/`keyframes` 难以管理复杂节奏”时，就是 GSAP 发挥价值的时候。

---

## 二、基础使用方法：快速入门

GSAP 极易上手。只要在项目中引入 `gsap` (可通过 `npm install gsap` 或 CDN)，就能调用它的核心补间方法：

### 1. 核心四大方法

- **`gsap.to()`**：从当前状态，动画**正向补间**到你指定的任意属性。这是最常用的一招。
- **`gsap.from()`**：假定目前元素的状态是“终点”，你想让它从你指定的另一个状态**反向回来**。常用于进场/滑入动画。
- **`gsap.fromTo()`**：完全无视元素的当前状态，强行控制起飞阶段与落地阶段的全部属性。
- **`gsap.set()`**：零动画持续时间（即瞬发赋值）。如果你想瞬间改变某些属性且不想要动画，用它最方便！

### 2. 基础示例

一组完整的示例，展现它们四个的经典用法和自带黑魔法：

```javascript
import gsap from "gsap";

// 【示例 1：使用 gsap.to() 做交互过渡】
// 意图：让这个按钮向右移动并变成圆形，带回弹缓冲
gsap.to(".btn-submit", {
	x: 200,
	duration: 1.5,
	borderRadius: "50%",
	ease: "bounce.out", // 内置的回弹物理算法
});

// 【示例 2：使用 gsap.from() 做元素加载出场】
// 意图：假设卡片本来就在中心位置，现在让它“从”很远的下方、透明度为 0 的状态飘上来
gsap.from(".card-item", {
	y: 100,
	opacity: 0,
	duration: 1,
	ease: "power2.out",
});

// 【示例 3：使用 gsap.fromTo() 做绝对掌控】
// 意图：不关心元素当前变成了啥样，直接强行将背景色从红色过渡到蓝色，并缩放
gsap.fromTo(
	".loading-circle",
	{ backgroundColor: "#ff0000", scale: 0.5 }, // 起点状态（不填写 duration）
	{
		backgroundColor: "#0000ff",
		scale: 1.5,
		duration: 2,
		repeat: -1, // 定义无限重播
		yoyo: true, // 像溜溜球一样原路倒放
	},
);

// 【示例 4：使用 gsap.set() 瞬发赋值】
// 当你想要初始化某些不受控样式时直接上这个，免去了手写 CSS 的烦恼
gsap.set(".hidden-element", { display: "block", opacity: 1 });
```

_提示：`x, y` 是 GSAP 对 CSS `transform: translate()` 的便捷写法。_

_桥接理解：`to/from/fromTo/set` 属于“补间层”，解决单段动画；`timeline` 属于“编排层”，负责把多段动画组织成完整节奏。_

---

## 三、GSAP 的核心哲学与设计原则

在使用 GSAP 设计动画时，最实用的思路是：先写清楚“时间节奏”，再填充“视觉表现”。

### 1. 核心哲学：一切皆是“补间 (Tween)”与“时间轴 (Timeline)”

在 GSAP 眼中，动画本质上是一个插值过程。它只关心：**起始值 -> 随时间/缓动变化 -> 结束值**。这个抽象非常强大，因为它不限制目标类型。你可以动画 DOM、SVG，也可以动画一个普通对象。

更伟大的突破是它的 **Timeline (时间轴)** 概念：

```javascript
const tl = gsap.timeline();
tl.to(".box1", { x: 100, duration: 1 })
	.to(".box2", { y: 50, duration: 0.5 }, "-=0.3") // 提前0.3秒插入
	.to(".box3", { rotation: 360 });
```

此时 `tl` 就相当于一个视频序列（Sequence），它可以被随时暂停 (`Pause`)、快进 (`Play`)、倒退 (`Reverse`)，甚至作为一个子片段加入到另一个更长的时间轴里。

### 2. 动画设计的原则角度

在制作网页动画时，应遵循以下思路：

- **解耦表现与时间控制**：不要在散乱的代码里随处调用动画。把局部复杂的动画封装成小的只读函数或专属 Timeline，然后在主控逻辑里把它们首尾相接拼起来。
- **参数抽离**：把最大角度、基础时间视为配置变量。由它们推导衍生出后续动画的变化，以确保修改时一呼百应。
- **周期运动优先连续函数**：对钟摆、呼吸灯这类循环效果，可以让 GSAP 驱动 `progress`，再用 `Math.sin()` 计算角度，通常比硬切多段更顺滑。

---

## 四、进阶用法

GSAP 的能量远不只是位移渐变。以下是一些可能用上的进阶特性：

### 1. ScrollTrigger (基于滚动的控制)

这是 GSAP 最常用的插件之一，可以把动画进度与某个元素的滚动位置精确绑定（即常说的 scrub）。

注意：在模块化项目中，你通常需要先注册插件。

```javascript
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

gsap.to(".hero-title", {
	scrollTrigger: {
		trigger: ".hero-section",
		start: "top center",
		end: "bottom top",
		scrub: true, // 开启擦洗，随着鼠标滚轮前后精密控制动画
	},
	y: 100,
	opacity: 0,
});
```

### 2. Proxy Animation (状态代理插值)

这是一种很实用的进阶技巧：先补间一个“代理对象”，再在 `onUpdate` 里把值映射到你真正想控制的内容。

```javascript
const proxy = { value: 0 };
// GSAP 不直接改 DOM，而是先改这个内存对象
gsap.to(proxy, {
	value: 100,
	duration: 1,
	onUpdate: () => {
		// 每次更新时拿到最新值，再决定如何渲染
		console.log(proxy.value);
	},
});
```

### 3. 交错序列 (Staggers)

当你需要让一组元素依次入场时，无须手写 `for` 循环叠加 delay，直接使用 `stagger`：

```javascript
gsap.to(".list-item", {
	y: 0,
	opacity: 1,
	stagger: 0.1, // 每个元素依次延迟 0.1s 执行入场
});
```

### 4. 工程实践：在框架里正确清理动画

在 React/Vue/Astro 这类组件化项目里，页面切换或组件卸载时，建议清理动画实例，避免重复绑定或内存残留。

下面是一个简化思路：

```javascript
const tween = gsap.to(".box", { x: 200, duration: 1 });

// 组件卸载时
tween.kill();
```

如果你在同一个元素上多次创建动画，也可以考虑使用 `gsap.context()` 管理作用域并统一 `revert()`。

## 结语

建议这样学习 GSAP：

1. 先熟练 `to/from/fromTo/set`，理解补间。
2. 再用 `timeline` 组织多段动画节奏。
3. 最后引入 `ScrollTrigger` 和代理对象，处理复杂交互。

GSAP 官方文档: https://gsap.com/docs/v3/

import gsap from "gsap";

// =========================
// 1) 状态机与全局阈值
// =========================
// IDLE: 可响应点击，允许待机眨眼
// PLAYING_VARIANT: 正在播放普通点击动画，忽略新点击
// RAGE_LOCKED: 正在播放高优先级动画，完全锁定点击
const MascotState = Object.freeze({
    IDLE: "IDLE",
    PLAYING_VARIANT: "PLAYING_VARIANT",
    RAGE_LOCKED: "RAGE_LOCKED",
});

const RAGE_CLICK_THRESHOLD = 4;
const RAGE_CLICK_WINDOW_MS = 1800;

const toArray = (list) => Array.from(list ?? []);

// =========================
// 2) 元素采集与合法性检查
// =========================
// 只要关键元素缺失就返回 null，避免后续 timeline 对空节点操作导致异常。
const getMascotParts = (mascot) => {
    const faceLayer = mascot.querySelector(".face-layer");
    const outerLayer = mascot.querySelector(".outer-layer");
    const orbit = mascot.querySelector(".orbit");
    const orbitPaths = toArray(mascot.querySelectorAll(".orbit path"));
    const hexagonBody = mascot.querySelector(".hexagon-body");
    const eyes = toArray(mascot.querySelectorAll(".eyes ellipse"));
    const mouth = mascot.querySelector(".mouth path");
    const blush = toArray(mascot.querySelectorAll(".blush ellipse"));

    if (
        !faceLayer ||
        !outerLayer ||
        !orbit ||
        !hexagonBody ||
        !eyes.length ||
        !mouth ||
        !blush.length
    ) {
        return null;
    }

    return {
        faceLayer,
        outerLayer,
        orbit,
        orbitPaths,
        hexagonBody,
        eyes,
        mouth,
        blush,
    };
};

// 收集所有会被动画改写的节点，便于统一 kill / reset。
const getAnimatableElements = (parts) => {
    return [
        parts.faceLayer,
        parts.outerLayer,
        parts.orbit,
        parts.hexagonBody,
        ...parts.eyes,
        parts.mouth,
        ...parts.blush,
        ...parts.orbitPaths,
    ];
};

// =========================
// 3) 基线重置（Baseline Reset）
// =========================
// 原理：任何新动画开始前都先回到统一初始姿态，避免属性残留叠加。
const resetToBaseline = (parts) => {
    const animatableElements = getAnimatableElements(parts);

    gsap.killTweensOf(animatableElements);

    gsap.set([parts.faceLayer, parts.outerLayer], {
        transformBox: "fill-box",
        transformOrigin: "center center",
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
    });

    gsap.set([parts.hexagonBody, parts.mouth, ...parts.eyes, ...parts.blush], {
        transformBox: "fill-box",
        transformOrigin: "center center",
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
    });

    gsap.set(parts.eyes, { attr: { ry: 0.28 } });

    gsap.set(parts.orbitPaths, {
        opacity: 1,
        stroke: "var(--mascot-color)",
    });
};

// =========================
// 4) 动画池（Registry）
// =========================
// 每个条目是“可构建的动画方案”：name / weight / cooldownMs / create。
const createVariantRegistry = () => {
    return [
        {
            name: "VariantA_FaceWobble",
            weight: 4,
            cooldownMs: 0,
            lastPlayedAt: -Infinity,
            create: ({ parts }) => {
                const tl = gsap.timeline({
                    paused: true,
                    defaults: { ease: "power2.inOut" },
                });

                tl.to(parts.faceLayer, { rotation: 8, duration: 0.16 })
                    .to(parts.faceLayer, { rotation: -8, duration: 0.24 })
                    .to(parts.faceLayer, { rotation: 0, duration: 0.16 });

                return tl;
            },
        },
        {
            name: "VariantB_OrbitPulse",
            weight: 3,
            cooldownMs: 250,
            lastPlayedAt: -Infinity,
            create: ({ parts }) => {
                const tl = gsap.timeline({
                    paused: true,
                    defaults: { ease: "power2.out" },
                });

                tl.to(parts.outerLayer, { rotation: 16, duration: 0.2 }, 0)
                    .to(
                        parts.orbitPaths,
                        { opacity: 0.55, duration: 0.12, stagger: 0.03 },
                        0,
                    )
                    .to(parts.outerLayer, {
                        rotation: 0,
                        duration: 0.36,
                        ease: "elastic.out(1, 0.45)",
                    })
                    .to(
                        parts.orbitPaths,
                        { opacity: 1, duration: 0.22, stagger: 0.03 },
                        "<",
                    );

                return tl;
            },
        },
        {
            name: "VariantC_BlushBounce",
            weight: 2,
            cooldownMs: 400,
            lastPlayedAt: -Infinity,
            create: ({ parts }) => {
                const tl = gsap.timeline({
                    paused: true,
                    defaults: { ease: "power2.inOut" },
                });

                tl.to(parts.blush, { scale: 1.2, duration: 0.14, yoyo: true, repeat: 1 }, 0)
                    .to(parts.eyes, { scaleY: 0.72, duration: 0.12, yoyo: true, repeat: 1 }, 0.02);

                return tl;
            },
        },
    ];
};

// =========================
// 5) 调度器：防重复 + 冷却 + 加权随机
// =========================
// 策略顺序：
// 1. 先过滤掉冷却中方案
// 2. 再尽量避开上一轮方案（防连续重复）
// 3. 对候选集按权重抽样
const pickNextVariant = (registry, lastPlayedName, now) => {
    const byCooldown = registry.filter((variant) => now - variant.lastPlayedAt >= variant.cooldownMs);
    const notLastPlayed = byCooldown.filter((variant) => variant.name !== lastPlayedName);
    const candidates = notLastPlayed.length ? notLastPlayed : byCooldown;

    if (!candidates.length) {
        return null;
    }

    const totalWeight = candidates.reduce((sum, variant) => sum + variant.weight, 0);
    let cursor = Math.random() * totalWeight;

    for (const variant of candidates) {
        cursor -= variant.weight;
        if (cursor <= 0) {
            return variant;
        }
    }

    return candidates[candidates.length - 1];
};

// 高优先级动画占位实现，后续可以替换为更复杂版本。
const createRageTimeline = ({ parts }) => {
    const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" },
    });

    // 先用占位版高优先级动画承载框架，后续可替换为更复杂表现。
    tl.to(parts.faceLayer, { scale: 0.86, duration: 0.12 })
        .to(parts.faceLayer, { scale: 1, duration: 0.22, ease: "elastic.out(1, 0.42)" })
        .to(parts.outerLayer, { rotation: 22, duration: 0.16 }, 0)
        .to(parts.outerLayer, { rotation: 0, duration: 0.28, ease: "power3.out" }, ">-0.04");

    return tl;
};

// 将状态同步到 data- 属性，方便调试与样式扩展。
const setState = (ctx, nextState) => {
    ctx.state = nextState;
    ctx.mascot.dataset.mascotState = nextState;
};

// =========================
// 6) 待机系统（眨眼）
// =========================
// stopBlink: 负责停止“待机定时器 + 待机时间轴”。
// 在点击动画触发前调用，实现“待机动画可被点击打断”。
const stopBlink = (ctx) => {
    clearTimeout(ctx.blinkTimer);
    if (ctx.blinkTimeline) {
        ctx.blinkTimeline.kill();
        ctx.blinkTimeline = null;
    }
};

// scheduleBlink: 使用 setTimeout 每 3 秒触发一次待机动作。
// onComplete 里再次调度，实现“递归式循环待机”。
const scheduleBlink = (ctx) => {
    stopBlink(ctx);
    ctx.blinkTimer = setTimeout(() => {
        if (ctx.state !== MascotState.IDLE) return;

        ctx.blinkTimeline = gsap.timeline({
            onComplete: () => scheduleBlink(ctx),
        });

        ctx.blinkTimeline.to(ctx.parts.eyes, {
            attr: { ry: 0.0 },      // 确保动画被打断时能正确复原
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
        });
    }, 3000);
};

// 只保留窗口期内的点击时间戳，用于判断是否触发 rage。
const pruneClickHistory = (ctx, now) => {
    ctx.clickHistory = ctx.clickHistory.filter((time) => now - time <= RAGE_CLICK_WINDOW_MS);
};

// =========================
// 7) 播放控制：普通动画 / rage
// =========================
// 播放顺序：先停待机 -> 基线重置 -> 状态切换 -> 播放 -> 完成后恢复 IDLE 并重启待机。
const playVariant = (ctx, variant, now) => {
    stopBlink(ctx);
    resetToBaseline(ctx.parts);
    setState(ctx, MascotState.PLAYING_VARIANT);

    const timeline = variant.create({ parts: ctx.parts, mascot: ctx.mascot });
    ctx.currentTimeline = timeline;
    ctx.lastPlayedName = variant.name;
    variant.lastPlayedAt = now;

    timeline.eventCallback("onComplete", () => {
        ctx.currentTimeline = null;
        resetToBaseline(ctx.parts);
        setState(ctx, MascotState.IDLE);
        scheduleBlink(ctx);
    });

    timeline.play(0);
};

const playRage = (ctx) => {
    stopBlink(ctx);
    resetToBaseline(ctx.parts);
    setState(ctx, MascotState.RAGE_LOCKED);

    const rageTimeline = createRageTimeline({ parts: ctx.parts, mascot: ctx.mascot });
    ctx.currentTimeline = rageTimeline;
    ctx.clickHistory = [];

    rageTimeline.eventCallback("onComplete", () => {
        ctx.currentTimeline = null;
        resetToBaseline(ctx.parts);
        setState(ctx, MascotState.IDLE);
        scheduleBlink(ctx);
    });

    rageTimeline.play(0);
};

// =========================
// 8) 点击入口（状态机守卫）
// =========================
// 仅 IDLE 可接收点击；播放期间直接 return，保证“不可打断”。
const handleMascotClick = (ctx) => {
    if (ctx.state !== MascotState.IDLE) {
        return;
    }

    const now = Date.now();
    pruneClickHistory(ctx, now);
    ctx.clickHistory.push(now);

    if (ctx.clickHistory.length >= RAGE_CLICK_THRESHOLD) {
        playRage(ctx);
        return;
    }

    const variant = pickNextVariant(ctx.variantRegistry, ctx.lastPlayedName, now);
    if (!variant) {
        return;
    }

    playVariant(ctx, variant, now);
};

// 单个 mascot 的初始化：防重复绑定、建立上下文、挂载点击、启动待机。
const initMascot = (mascot) => {
    if (mascot.dataset.culooMascotBound === "true") {
        return;
    }

    const parts = getMascotParts(mascot);
    if (!parts) {
        return;
    }

    const ctx = {
        mascot,
        parts,
        state: MascotState.IDLE,
        clickHistory: [],
        lastPlayedName: null,
        currentTimeline: null,
        variantRegistry: createVariantRegistry(),
        blinkTimer: null,
        blinkTimeline: null,
    };

    resetToBaseline(parts);
    setState(ctx, MascotState.IDLE);

    mascot.style.cursor = "pointer";
    mascot.dataset.culooMascotBound = "true";
    mascot.addEventListener("click", () => {
        handleMascotClick(ctx);
    });

    scheduleBlink(ctx);
};

// 批量初始化页面中的 mascot 实例。
const initCuLooMascots = () => {
    const mascots = document.querySelectorAll("[data-culoo-mascot]");
    mascots.forEach(initMascot);
};

// =========================
// 9) 启动入口
// =========================
// 通过全局标记避免脚本重复注册；兼容 Astro 首次加载与路由切换。
if (typeof window !== "undefined" && !window.__culooMascotFrameworkBootstrapped__) {
    window.__culooMascotFrameworkBootstrapped__ = true;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initCuLooMascots, { once: true });
    } else {
        initCuLooMascots();
    }

    document.addEventListener("astro:page-load", initCuLooMascots);
}

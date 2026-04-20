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
    const faceLayerRotate = mascot.querySelector(".face-layer-rotate");
    const faceLayerTranslate = mascot.querySelector(".face-layer-translate");
    const faceLayerScale = mascot.querySelector(".face-layer-scale");
    const outerLayer = mascot.querySelector(".outer-layer");
    const outerLayerRotate = mascot.querySelector(".outer-layer-rotate");
    const outerLayerTranslate = mascot.querySelector(".outer-layer-translate");
    const outerLayerScale = mascot.querySelector(".outer-layer-scale");
    const orbit = mascot.querySelector(".orbit");
    const orbitPaths = toArray(mascot.querySelectorAll(".orbit path"));
    const hexagonBody = mascot.querySelector(".hexagon-body");
    const normalEyes = toArray(mascot.querySelectorAll(".eye-normal"));
    const normalEyeEllipses = toArray(mascot.querySelectorAll(".eye-normal ellipse"));
    const crossEyes = toArray(mascot.querySelectorAll(".eye-cross"));
    const mouth = mascot.querySelector(".mouth path");
    const blush = toArray(mascot.querySelectorAll(".blush ellipse"));

    if (
        !faceLayer ||
        !faceLayerRotate ||
        !faceLayerTranslate ||
        !faceLayerScale ||
        !outerLayer ||
        !outerLayerRotate ||
        !outerLayerTranslate ||
        !outerLayerScale ||
        !orbit ||
        !hexagonBody ||
        !normalEyes.length ||
        !normalEyeEllipses.length ||
        !crossEyes.length ||
        !mouth ||
        !blush.length
    ) {
        return null;
    }

    return {
        faceLayer,
        faceLayerRotate,
        faceLayerTranslate,
        faceLayerScale,
        outerLayer,
        outerLayerRotate,
        outerLayerTranslate,
        outerLayerScale,
        orbit,
        orbitPaths,
        hexagonBody,
        normalEyes,
        normalEyeEllipses,
        crossEyes,
        mouth,
        blush,
    };
};

// 收集所有会被动画改写的节点，便于统一 kill / reset。
const getAnimatableElements = (parts) => {
    return [
        parts.faceLayer,
        parts.faceLayerRotate,
        parts.faceLayerTranslate,
        parts.faceLayerScale,
        parts.outerLayer,
        parts.outerLayerRotate,
        parts.outerLayerTranslate,
        parts.outerLayerScale,
        parts.orbit,
        parts.hexagonBody,
        ...parts.normalEyes,
        ...parts.normalEyeEllipses,
        ...parts.crossEyes,
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

    // 有动画使用 css.transform 字符串写入；这里先清空，避免动画被中断时残留矩阵影响下一轮中心点。
    gsap.set(parts.faceLayerRotate, {
        css: { transform: "none" },
    });
    gsap.set(parts.outerLayerRotate, {
        css: { transform: "none" },
    });

    gsap.set(parts.faceLayer, {
        transformBox: "fill-box",
        transformOrigin: "center center",
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
    });

    gsap.set(parts.faceLayerRotate, {
        transformBox: "fill-box",
        transformOrigin: "center center",
        x: 0,
        y: 0,
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
        transformPerspective: 0,
        scale: 1,
        opacity: 1,
    });

    gsap.set(parts.faceLayerTranslate, {
        transformBox: "fill-box",
        transformOrigin: "center center",
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
    });

    gsap.set(parts.faceLayerScale, {
        transformBox: "fill-box",
        transformOrigin: "center center",
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
    });

    gsap.set(parts.outerLayerRotate, {
        transformBox: "fill-box",
        transformOrigin: "center center",
        x: 0,
        y: 0,
        rotation: 0,
        rotationX: 0,
        rotationY: 0,
        transformPerspective: 0,
        scale: 1,
        opacity: 1,
    });

    gsap.set(parts.outerLayerTranslate, {
        transformBox: "fill-box",
        transformOrigin: "center center",
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
    });

    gsap.set(parts.outerLayerScale, {
        transformBox: "fill-box",
        transformOrigin: "center center",
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
    });

    gsap.set([parts.hexagonBody, parts.mouth, ...parts.normalEyes, ...parts.blush], {
        transformBox: "fill-box",
        transformOrigin: "center center",
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
    });

    gsap.set(parts.crossEyes, {
        opacity: 0,
        scale: 0.75,
        transformOrigin: "center center",
    });

    gsap.set(parts.normalEyeEllipses, { attr: { ry: 17.5 } });

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
        // VariantA: 害羞扭头 + 外层加速自转 + 眼睛切换
        {
            name: "VariantA_ShyFaceWobble",
            weight: 3,
            cooldownMs: 0,
            lastPlayedAt: -Infinity,
            create: ({ parts }) => {
                const tl = gsap.timeline({
                    paused: true,
                    defaults: { ease: "power2.inOut" },
                });

                const state = {
                    angle: 0,
                    tilt: 0,
                    shakeProgress: 0,
                };

                tl.set(parts.faceLayerRotate, {
                    transformBox: "fill-box",      // 对于3D, 百分比中心必须配合 fill-box，才能以当前 faceLayer 包围盒中心旋转。
                    transformOrigin: "50% 80%",     // 使用百分比来确保旋转轴在中间位置，即使元素大小发生变化
                    force3D: true,
                });

                tl.set(parts.outerLayerScale, {
                    // 把 outerLayerScale 的 pivot 也设成和 outerLayerRotate 完全一致（同为 view-box 圆心），否则会导致rotate偏移
                    transformBox: "view-box",
                    transformOrigin: "center center",
                });
                tl.set(parts.outerLayerRotate, {
                    transformBox: "view-box", // 对于2D, view-box确保外层圆环绕着真正的 SVG 圆心旋转，而不是子元素不规则包围盒的中心
                    transformOrigin: "center center",
                });


                const updateTransform = () => {
                    // 仍保留数学波形驱动，但最终变换交给 GSAP 属性写入
                    gsap.set(parts.faceLayerRotate, {
                        // 把 perspective 与 rotateX/rotateY 放在同一条 transform 字符串，避免 SVG 3D 解析分裂导致中心漂移。
                        // 使用CSS原生写入，避免GSAP对SVG的rotate3d解析问题，可能导致根本不旋转
                        css: {
                            transform: `perspective(800px) rotateX(${state.tilt}deg) rotateY(${state.angle}deg)`,
                        },
                    });
                };

                // 扭头的最大角度规定
                const shakeMaxAngle = 20;

                // --- 环形外层自转和动画持续时间参数配置 ---
                const V_MAX = 400; // 最大自转速度（度/秒）
                const duration1 = 0.4; // 阶段1：加速
                const duration2 = 1.5; // 阶段2：匀速
                const duration3 = 0.5; // 阶段3：减速与恢复
                const rot1 = (V_MAX * duration1) / 2;
                const rot2 = V_MAX * duration2;
                const rot3 = (V_MAX * duration3) / 2;

                // 1) 切换眼睛 & 缩进去低头 & 外层放大并开始加速旋转
                tl.to(parts.normalEyes, { opacity: 0, duration: 0.1 }, 0)
                    .to(parts.normalEyeEllipses, { attr: { ry: 0.05 }, duration: 0.1 }, 0)
                    .to(parts.crossEyes, { opacity: 1, scale: 1, duration: 0.15 }, 0)
                    .to(state, {
                        tilt: -30, // 表现为低下头
                        duration: duration1,
                        onUpdate: updateTransform,
                    }, 0)
                    .to(parts.outerLayerScale, {
                        scale: 1.1,
                        duration: duration1,
                    }, 0)
                    .to(parts.outerLayerRotate, {
                        rotation: `+=${rot1}`,
                        duration: duration1,
                        ease: "power1.in", // 平滑加速起步
                    }, 0);

                // 2) 摇头摆动 (快速摇晃几次表示害羞扭头) & 外层匀速旋转
                tl.to(state, {
                    shakeProgress: 1,
                    duration: duration2 + 0.2,
                    ease: "none",
                    onUpdate: () => {
                        // 用 Math.sin 进行平滑周期波动
                        state.angle = Math.sin(state.shakeProgress * Math.PI * 5.5) * shakeMaxAngle;
                        updateTransform();
                    },
                }, 0.2)
                    .to(parts.outerLayerRotate, {
                        rotation: `+=${rot2}`,
                        duration: duration2,
                        ease: "none", // 匀速维持
                    }, duration1);

                // 3) 恢复原状 & 外层减速闭合
                tl.to(state, {
                    tilt: 0,
                    angle: 0,
                    shakeProgress: 0,
                    duration: duration3,
                    onUpdate: updateTransform,
                }, ">")
                    .to(parts.crossEyes, { opacity: 0, scale: 0.75, duration: 0.15 }, "<0.1")
                    .to(parts.normalEyes, { opacity: 1, duration: 0.15 }, "<")
                    .to(parts.normalEyeEllipses, { attr: { ry: 17.5 }, duration: 0.15 }, "<")
                    .set(parts.faceLayerRotate, {
                        css: { transform: "none" },
                    })
                    .to(parts.outerLayerScale, {
                        scale: 1,
                        duration: 0.4,
                        ease: "elastic.out(1, 0.42)",
                    }, "<")
                    .to(parts.outerLayerRotate, {
                        rotation: `+=${rot3}`,
                        duration: duration3,
                        ease: "power1.out", // 平滑减速停下
                    }, duration1 + duration2);

                return tl;
            },
        },
        // VariantB: 兴奋转圈 + 眼神变化
        {
            name: "VariantB_ExcitedRotation",
            weight: 3,
            cooldownMs: 0,
            lastPlayedAt: -Infinity,
            create: ({ parts }) => {
                const tl = gsap.timeline({
                    paused: true,
                    defaults: { ease: "power2.out" },
                });

                const state = {
                    outerAngle: 0,
                    faceAngle: 0,
                    shakeProgress: 0,
                    outerProgress: 0,
                };

                tl.set(parts.faceLayerRotate, {
                    transformBox: "fill-box",
                    transformOrigin: "50% 50%",
                    force3D: true,
                });
                tl.set(parts.outerLayerRotate, {
                    transformBox: "fill-box",
                    transformOrigin: "50% 50%",
                    force3D: true,
                });

                const updateTransform = () => {
                    gsap.set(parts.faceLayerRotate, {
                        css: {
                            transform: `perspective(800px) rotateY(${state.faceAngle}deg)`,
                        },
                    });
                    gsap.set(parts.outerLayerRotate, {
                        css: {
                            transform: `perspective(800px) rotateY(${state.outerAngle}deg)`,
                        },
                    });
                };

                // 切换眼睛
                tl.to(parts.normalEyes, { opacity: 0, duration: 0.1 }, 0)
                    .to(parts.normalEyeEllipses, { attr: { ry: 0.05 }, duration: 0.1 }, 0)
                    .to(parts.crossEyes, { opacity: 1, scale: 1, duration: 0.15 }, 0);

                // 开始旋转，内外层反向，外层稍延后
                tl.to(state, {
                    shakeProgress: 1,
                    duration: 1.5,
                    ease: "none",
                    onUpdate: () => {
                        state.faceAngle = Math.sin(state.shakeProgress * Math.PI / 2) * 360; // 内层转一圈
                        updateTransform();
                    },
                }, 0.2)
                    .to(state, {
                        outerProgress: 1,
                        duration: 1.5,
                        ease: "none",
                        onUpdate: () => {
                            state.outerAngle = Math.sin(state.outerProgress * Math.PI / 2) * 360; // 外层转一圈
                            updateTransform();
                        },
                    }, 0.35);

                // 恢复原状
                tl.to(state, {
                    faceAngle: 0,
                    outerAngle: 0,
                    shakeProgress: 0,
                    outerProgress: 0,
                    duration: 0,
                    onUpdate: updateTransform,
                }, ">")
                    .to(parts.crossEyes, { opacity: 0, scale: 0.75, duration: 0.15 }, "<0.1")
                    .to(parts.normalEyes, { opacity: 1, duration: 0.15 }, "<")
                    .to(parts.normalEyeEllipses, { attr: { ry: 17.5 }, duration: 0.15 }, "<")
                    .set([parts.faceLayerRotate, parts.outerLayerRotate], {
                        css: { transform: "none" },
                    });

                return tl;
            },
        },
        // VariantC: 跳跃
        {
            name: "VariantC_Jump",
            weight: 3,
            cooldownMs: 0,
            lastPlayedAt: -Infinity,
            create: ({ parts }) => {
                const tl = gsap.timeline({
                    paused: true,
                });

                // 设置 transformOrigin 以便在底部进行变形（蓄力、落地缓冲）
                tl.set(parts.faceLayerScale, { transformOrigin: "50% 100%" });

                // 1. 蓄力：向下压缩，眼睛替换为 crossEyes
                tl.to(parts.faceLayerTranslate, {
                    y: 8,
                    duration: 0.15,
                    ease: "power2.inOut"
                }, "anticipate")
                    .to(parts.faceLayerScale, {
                        scaleY: 0.85,
                        scaleX: 1.05,
                        duration: 0.15,
                        ease: "power2.inOut"
                    }, "anticipate")
                    .to(parts.normalEyes, { opacity: 0, duration: 0.15 }, "anticipate")
                    .to(parts.normalEyeEllipses, { attr: { ry: 0.05 }, duration: 0.15 }, "anticipate")
                    .to(parts.crossEyes, { opacity: 1, scale: 1, duration: 0.15 }, "anticipate")
                    .to(parts.outerLayerTranslate, { y: -1.86, duration: 0.1, ease: "none" }, 0)
                    .to(parts.outerLayerScale, { scale: 1.08, duration: 0.1, ease: "none" }, 0)

                    // --- 第一次跳跃 ---
                    .to(parts.faceLayerTranslate, {
                        y: -20,
                        duration: 0.2,
                        ease: "power2.out"
                    }, "jump1")
                    .to(parts.faceLayerScale, {
                        scaleY: 1.0,
                        scaleX: 0.95,
                        duration: 0.2,
                        ease: "power2.out"
                    }, "jump1")
                    .to(parts.faceLayerTranslate, {
                        y: 5,
                        duration: 0.2,
                        ease: "power2.in"
                    }, "fall1")
                    .to(parts.faceLayerScale, {
                        scaleY: 0.85,
                        scaleX: 1.05,
                        duration: 0.2,
                        ease: "power2.in"
                    }, "fall1")

                    // --- 第二次跳跃（节奏稍微加快，高度略低） ---
                    .to(parts.faceLayerTranslate, {
                        y: -20,
                        duration: 0.2,
                        ease: "power2.out",
                        delay: 0.05,        // 在落地后稍作停顿再起跳，增加节奏感
                    }, "jump2")
                    .to(parts.faceLayerScale, {
                        scaleY: 1.0,
                        scaleX: 0.95,
                        duration: 0.2,
                        ease: "power2.out",
                        delay: 0.05,        // 在落地后稍作停顿再起跳，增加节奏感
                    }, "jump2")
                    .to(parts.faceLayerTranslate, {
                        y: 0,
                        duration: 0.2,
                        ease: "power2.in"
                    }, "fall2")
                    .to(parts.faceLayerScale, {
                        scaleY: 0.9,
                        scaleX: 1.05,
                        duration: 0.2,
                        ease: "power2.in"
                    }, "fall2")

                    // 落地缓冲：恢复原状，眼睛切回 normalEyes
                    .to(parts.faceLayerScale, {
                        scaleY: 1,
                        scaleX: 1,
                        duration: 0.2,
                        ease: "bounce.out"
                    }, "land")
                    .to(parts.crossEyes, { opacity: 0, scale: 0.75, duration: 0.15 }, "land")
                    .to(parts.normalEyes, { opacity: 1, duration: 0.15 }, "land")
                    .to(parts.normalEyeEllipses, { attr: { ry: 17.5 }, duration: 0.15 }, "land")
                    .to(parts.outerLayerTranslate, { y: 0, duration: 0.4, ease: "elastic.out(1, 0.42)" }, "land")
                    .to(parts.outerLayerScale, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.42)" }, "land");

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
    tl.to(parts.faceLayerScale, { scale: 0.86, duration: 0.12 })
        .to(parts.faceLayerScale, { scale: 1, duration: 0.22, ease: "elastic.out(1, 0.42)" })
        .to(parts.outerLayerRotate, { rotation: 22, duration: 0.16 }, 0)
        .to(parts.outerLayerRotate, { rotation: 0, duration: 0.28, ease: "power3.out" }, ">-0.04");

    return tl;
};

// 将状态同步到 data- 属性，方便调试与样式扩展。
const setState = (ctx, nextState) => {
    ctx.state = nextState;
    ctx.mascot.dataset.mascotState = nextState;
};

// =========================
// 6) 首次加载完成后的过渡显示动画
// =========================
// 在吉祥物加载完成前先隐藏，加载完了再显示，从而实现一个过渡，避免出现闪烁等显示错误
const revealMascot = (mascot) => {
    if (mascot.dataset.mascotReady === "true") {
        return;
    }

    gsap.killTweensOf(mascot);
    gsap.set(mascot, {
        visibility: "visible",
    });
    gsap.fromTo(
        mascot,
        {
            opacity: 0,
            scale: 0.985,
            transformOrigin: "center center",
        },
        {
            opacity: 1,
            scale: 1,
            duration: 0.26,
            ease: "power2.out",
            clearProps: "opacity,transform",
        },
    );

    mascot.dataset.mascotReady = "true";
};

// =========================
// 7) 待机系统（眨眼）
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

        ctx.blinkTimeline.to(ctx.parts.normalEyeEllipses, {
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
    let timeline = null;

    try {
        timeline = variant.create({ parts: ctx.parts, mascot: ctx.mascot });
    } catch (error) {
        // 防止单个方案构建失败把状态机锁死在非 IDLE。
        console.error("[CuLooMascot] Variant create failed:", variant.name, error);
        resetToBaseline(ctx.parts);
        setState(ctx, MascotState.IDLE);
        scheduleBlink(ctx);
        return;
    }

    setState(ctx, MascotState.PLAYING_VARIANT);
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
        revealMascot(mascot);
        return;
    }

    const parts = getMascotParts(mascot);
    if (!parts) {
        mascot.dataset.mascotReady = "true";
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
    revealMascot(mascot);

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

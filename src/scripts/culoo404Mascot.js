import gsap from "gsap";

const mascots = document.querySelectorAll("[data-culoo-404-mascot]");

// 吉祥物的初始加载完成后显示动画，通过这一过渡避免造成闪烁等显示错误
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

// 确保首次过渡动画只在第一次加载时执行，之后直接显示
mascots.forEach((mascot) => {
    if (mascot.dataset.culoo404MascotBound === "true") {
        revealMascot(mascot);
        return;
    }

    const normalEyes = mascot.querySelectorAll(".eye-normal");
    const crossEyes = mascot.querySelectorAll(".eye-cross");
    const exclamation = mascot.querySelector(".question-exclamation");
    const shakeLayer = mascot.querySelector(".shake-layer");
    const mascotScene = mascot.querySelector(".mascot-scene");
    const angerSymbol = mascot.querySelector(".anger-symbol");
    const angerPaths = mascot.querySelectorAll(".anger-symbol path");

    if (
        normalEyes.length &&
        crossEyes.length &&
        exclamation &&
        shakeLayer &&
        mascotScene &&
        angerSymbol &&
        angerPaths.length
    ) {
        mascot.dataset.culoo404MascotBound = "true";
        mascot.style.cursor = "pointer";
        let clickCount = 0;
        let isRageAnimating = false;

        gsap.set(crossEyes, {
            opacity: 0,
            scale: 0.75,
            transformOrigin: "center center",
        });

        gsap.set(exclamation, {
            opacity: 0,
            y: 10,
        });

        gsap.set(mascotScene, {
            transformOrigin: "center center",
            scale: 1,
            opacity: 1,
        });

        gsap.set(angerSymbol, {
            opacity: 0,
            scale: 1,
            transformOrigin: "center center",
        });

        // 初始化愤怒图标的路径
        angerPaths.forEach((path) => {
            // 通过设置 strokeDasharray 和 strokeDashoffset 来隐藏路径，并在动画中逐渐显示
            const pathLength = path.getTotalLength();
            gsap.set(path, {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
            });
        });

        revealMascot(mascot);

        // 用 Z-X-Z 分解定义轴线角度，避免 SVG 环境下 rotate3d(x,y,0,angle) 的轴解释偏差。
        // 使用变量值代入式子计算，避免手算带来的误差影响，同时使得后续修改更方便
        const center = { x: 100, y: 100 };
        const baseTiltDeg = 6;
        const axisPointA = { x: 100, y: 50 };
        const axisPointB = { x: 100, y: 150 };

        const rotateAround = (point, pivot, degrees) => {
            const rad = (degrees * Math.PI) / 180;
            const cos = Math.cos(rad);
            const sin = Math.sin(rad);
            const dx = point.x - pivot.x;
            const dy = point.y - pivot.y;

            return {
                x: pivot.x + dx * cos - dy * sin,
                y: pivot.y + dx * sin + dy * cos,
            };
        };

        const rotatedA = rotateAround(axisPointA, center, baseTiltDeg);
        const rotatedB = rotateAround(axisPointB, center, baseTiltDeg);
        const axisWorldAngleDeg =
            (Math.atan2(rotatedA.y - rotatedB.y, rotatedA.x - rotatedB.x) * 180) /
            Math.PI;
        const axisLocalAngleDeg = axisWorldAngleDeg - baseTiltDeg;

        const tl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            paused: true,
        });

        // 定义状态对象，将旋转动画分为明确的两个部分以解决只会一侧旋转的bug
        const state = { angle: 0 };
        const updateTransform = () => {
            // 加入 perspective 会让 SVG 在正负角度下呈现大小差异，从而真正区分两侧
            shakeLayer.style.transform = `translate(100px, 100px) perspective(800px) rotate(${axisLocalAngleDeg}deg) rotateX(${state.angle}deg) rotate(${-axisLocalAngleDeg}deg) translate(-100px, -100px)`;
        };

        // 将旋转角度的绝对值、持续时间等都提取为统一管理的变量
        const baseDuration = 3.2; // 整体动画总时长
        const shakeMaxAngle = 20; // 旋转角度绝对值
        const shakeDuration = 0.4; // 单次旋转持续时间（1/4个周期）
        const changeDuration = 0.2; // 眼神和叹号的变化持续时间

        // 将向两侧旋转的动作组合为一个独立的、可重复的时间轴
        // 解决停顿的最佳方法：使用一个进度代理(progress)，配合 Math.sin 恢复原生正弦波
        // 这能保证中间穿过 0 度时速度达到峰值，而只在两侧最高点平滑减速，彻底消除多段动画拼凑带来的割裂感。
        const shakeProxy = { progress: 0 };
        const shakeCycleDuration = shakeDuration * 4; // 一个完整来回(周期)的总持续时间

        const shakeSequence = gsap.timeline({
            repeat: 1, // 修改此值可重复播放，0为只播放一次完整的流程，-1为无限循环
        });

        shakeSequence.to(shakeProxy, {
            progress: 1,
            duration: shakeCycleDuration,
            ease: "none", // 禁用时间轴本身的加减速缓动，让速度完全由数学正弦曲线接管
            onUpdate: () => {
                // 进度 0 -> 1 恰好对应正弦波的一个完整周期 (0 -> 2π)
                state.angle = Math.sin(shakeProxy.progress * Math.PI * 2) * shakeMaxAngle;
                updateTransform();
            },
        });

        // 将组合好的序列加入到主时间轴起始点
        tl.add(shakeSequence, 0);

        // 开头动画 - 眼神形变，叹号快速浮现
        tl.to(normalEyes, { opacity: 0, scale: 0.8, duration: changeDuration }, 0)
            .to(crossEyes, { opacity: 1, scale: 1, duration: changeDuration }, 0)
            .to(
                exclamation,
                { opacity: 1, y: 0, duration: changeDuration, ease: "power3.out" },
                0,
            );

        // 结尾动画 - 逆向恢复（发生在最后 0.2s内）
        tl.to(
            exclamation,
            { opacity: 0, y: 10, duration: changeDuration, ease: "power2.in" },
            baseDuration - changeDuration,
        )
            .to(
                crossEyes,
                { opacity: 0, scale: 0.8, duration: changeDuration },
                baseDuration - changeDuration,
            )
            .to(
                normalEyes,
                { opacity: 1, scale: 1, duration: changeDuration },
                baseDuration - changeDuration,
            )
            .set(shakeLayer, { clearProps: "transform" }, baseDuration);

        // 定义生气动画时间轴，初始状态为暂停。触发条件是连续点击达到 4 次，动画结束后重置状态允许再次触发。
        const rageTl = gsap.timeline({
            paused: true,
            onStart: () => {
                isRageAnimating = true;
                mascot.style.pointerEvents = "none";
            },
            onComplete: () => {
                isRageAnimating = false;
                mascot.style.pointerEvents = "auto";
                clickCount = 0;
            },
        });

        rageTl
            .to(mascotScene, {
                scale: 0,
                opacity: 0,
                duration: 0.2,
                ease: "power4.in",
            })
            .set(angerSymbol, { opacity: 1, scale: 1 })
            .to(
                angerPaths,
                {
                    strokeDashoffset: 0,
                    duration: 0.5,
                    ease: "power2.out",
                    stagger: 0,
                },
                "<",
            )
            .to({}, { duration: 3 })
            .to(angerSymbol, {
                opacity: 0,
                duration: 0.2,
                ease: "power2.in",
            })
            .add(() => {
                angerPaths.forEach((path) => {
                    const pathLength = path.getTotalLength();
                    gsap.set(path, {
                        strokeDasharray: pathLength,
                        strokeDashoffset: pathLength,
                    });
                });
            })
            .set(angerSymbol, { scale: 0.6 })
            .to(
                mascotScene,
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.28,
                    ease: "power2.out",
                },
                "<",
            );

        mascot.addEventListener("click", () => {
            // 如果正在播放生气动画，则点击不触发任何反应，直到动画结束后才重置状态允许再次触发
            if (isRageAnimating) {
                return;
            }

            clickCount += 1;

            // 连续点击达到 4 次时触发生气动画，并在动画结束后重置点击计数
            if (clickCount === 4) {
                rageTl.restart();
                return;
            }

            tl.restart();
        });
    } else {
        mascot.dataset.mascotReady = "true";
    }
});
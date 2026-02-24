const rootElement = document.documentElement;
const themeToggleButton = document.getElementById("themeToggle");
const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
);

const theme = (() => {
    const LocalStorageTheme = localStorage?.getItem("theme") ?? "";
    if (["light", "dark"].includes(LocalStorageTheme)) {
        return LocalStorageTheme;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    if (media.matches) {
        return "dark";
    } else {
        return "light";
    }
})();

const applyTheme = (nextTheme) => {
    if (nextTheme === "dark") {
        rootElement.classList.add("dark");
    } else {
        rootElement.classList.remove("dark");
    }

    localStorage.setItem("theme", nextTheme);
};

if (theme === "light") {
    rootElement.classList.remove("dark");
} else {
    rootElement.classList.add("dark");
}

const getRippleEndRadius = (x, y) => {
    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    return Math.hypot(maxX, maxY);
};

const getClickPosition = (event) => {
    if (event.clientX !== 0 || event.clientY !== 0) {
        return { x: event.clientX, y: event.clientY };
    }

    if (themeToggleButton instanceof HTMLElement) {
        const rect = themeToggleButton.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }

    return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
    };
};

const handleToggleClick = (event) => {
    const nextTheme = rootElement.classList.contains("dark") ? "light" : "dark";
    const { x, y } = getClickPosition(event);
    const endRadius = getRippleEndRadius(x, y);

    if (!document.startViewTransition || prefersReducedMotion.matches) {
        applyTheme(nextTheme);
        return;
    }

    rootElement.style.setProperty("--theme-click-x", `${x}px`);
    rootElement.style.setProperty("--theme-click-y", `${y}px`);
    rootElement.style.setProperty("--theme-end-radius", `${endRadius}px`);

    const transition = document.startViewTransition(() => {
        applyTheme(nextTheme);
    });

    transition.finished.finally(() => {
        rootElement.style.removeProperty("--theme-click-x");
        rootElement.style.removeProperty("--theme-click-y");
        rootElement.style.removeProperty("--theme-end-radius");
    });
};

themeToggleButton?.addEventListener("click", handleToggleClick);

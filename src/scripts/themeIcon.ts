type Theme = "light" | "dark";

type ViewTransitionLike = {
    finished: Promise<void>;
};

type StartViewTransition = (
    callback: () => void | Promise<void>,
) => ViewTransitionLike;

const rootElement = document.documentElement;
const themeToggleButton = document.getElementById("themeToggle");
const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
);
const documentWithTransition = document as Document & {
    startViewTransition?: StartViewTransition;
};

const theme: Theme = (() => {
    const localStorageTheme = localStorage.getItem("theme") ?? "";
    if (localStorageTheme === "light" || localStorageTheme === "dark") {
        return localStorageTheme;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    if (media.matches) {
        return "dark";
    }

    return "light";
})();

const applyTheme = (nextTheme: Theme): void => {
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

const getRippleEndRadius = (x: number, y: number): number => {
    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    return Math.hypot(maxX, maxY);
};

const getClickPosition = (event: MouseEvent): { x: number; y: number } => {
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

const handleToggleClick = (event: MouseEvent): void => {
    const nextTheme: Theme = rootElement.classList.contains("dark")
        ? "light"
        : "dark";
    const { x, y } = getClickPosition(event);
    const endRadius = getRippleEndRadius(x, y);

    if (!documentWithTransition.startViewTransition || prefersReducedMotion.matches) {
        applyTheme(nextTheme);
        return;
    }

    rootElement.style.setProperty("--theme-click-x", `${x}px`);
    rootElement.style.setProperty("--theme-click-y", `${y}px`);
    rootElement.style.setProperty("--theme-end-radius", `${endRadius}px`);

    const transition = documentWithTransition.startViewTransition(() => {
        applyTheme(nextTheme);
    });

    transition.finished.finally(() => {
        rootElement.style.removeProperty("--theme-click-x");
        rootElement.style.removeProperty("--theme-click-y");
        rootElement.style.removeProperty("--theme-end-radius");
    });
};

themeToggleButton?.addEventListener("click", (event) => {
    handleToggleClick(event as MouseEvent);
});
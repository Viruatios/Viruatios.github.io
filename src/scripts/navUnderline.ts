const desktopQuery = window.matchMedia("(min-width: 636px)");

const normalizePath = (path: string | null | undefined): string => {
    const lower = (path || "/").toLowerCase();
    return lower.endsWith("/") ? lower : `${lower}/`;
};

const resolveCurrentPath = (path: string | null | undefined): string => {
    const normalized = normalizePath(path);

    if (normalized.startsWith("/posts/")) {
        return "/blog/";
    }

    if (normalized.startsWith("/tags/")) {
        return "/tags/";
    }

    return normalized;
};

const setUnderlinePosition = (
    container: HTMLElement,
    underline: HTMLElement,
    activeLink: HTMLAnchorElement,
): void => {
    const containerRect = container.getBoundingClientRect();
    const activeRect = activeLink.getBoundingClientRect();

    if (desktopQuery.matches) {
        underline.style.left = `${activeRect.left - containerRect.left}px`;
        underline.style.right = `${containerRect.right - activeRect.right}px`;
        underline.style.top = "auto";
        underline.style.bottom = "0";
        underline.style.width = "auto";
        underline.style.height = "2px";
        return;
    }

    underline.style.left = "0";
    underline.style.right = "auto";
    underline.style.top = `${activeRect.top - containerRect.top}px`;
    underline.style.bottom = `${containerRect.bottom - activeRect.bottom}px`;
    underline.style.width = "2px";
    underline.style.height = "auto";
};

const initNavUnderline = (): void => {
    const container = document.querySelector<HTMLElement>(".nav-links");
    if (!container) {
        return;
    }

    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>("a"));
    const underline = container.querySelector<HTMLElement>(".tab-underline");

    if (!underline || links.length === 0) {
        return;
    }

    const currentPath = resolveCurrentPath(window.location.pathname);
    let activeIndex = links.findIndex(
        (link) => normalizePath(link.getAttribute("href") || "/") === currentPath,
    );

    if (activeIndex < 0) {
        activeIndex = 0;
    }

    let previousIndex = activeIndex;

    const applyActive = (index: number): void => {
        activeIndex = index;
        links.forEach((link, linkIndex) => {
            if (linkIndex === index) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        const activeLink = links[activeIndex];
        if (!activeLink) {
            return;
        }

        setUnderlinePosition(container, underline, activeLink);
        underline.hidden = false;
    };

    applyActive(activeIndex);

    requestAnimationFrame(() => {
        const activeLink = links[activeIndex];
        if (activeLink) {
            setUnderlinePosition(container, underline, activeLink);
        }
    });

    links.forEach((link, index) => {
        link.addEventListener("click", (event: MouseEvent) => {
            if (
                event.defaultPrevented ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            const nextHref = link.getAttribute("href");
            if (!nextHref || normalizePath(nextHref) === currentPath) {
                return;
            }

            event.preventDefault();

            underline.dataset.dir = index >= previousIndex ? "right" : "left";
            applyActive(index);
            previousIndex = index;

            window.setTimeout(() => {
                window.location.assign(nextHref);
            }, 300);
        });
    });

    window.addEventListener("resize", () => {
        const activeLink = links[activeIndex];
        if (!activeLink) {
            return;
        }

        setUnderlinePosition(container, underline, activeLink);
    });
};

initNavUnderline();
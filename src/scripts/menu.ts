const menu = document.querySelector<HTMLButtonElement>(".menu");

if (menu) {
    menu.addEventListener("click", () => {
        const isExpanded = menu.getAttribute("aria-expanded") === "true";
        menu.setAttribute("aria-expanded", `${!isExpanded}`);
    });
}
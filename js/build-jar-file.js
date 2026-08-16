(() => {
    "use strict";

    const body = document.body;
    const menuButton = document.getElementById("menuButton");
    const lessonNavigation = document.getElementById("lessonNavigation");
    const progressBar = document.getElementById("readingProgress");
    const toast = document.getElementById("copyToast");
    const navigationLinks = [...document.querySelectorAll(".lesson-sidebar nav a")];
    const observedSections = navigationLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);
    let toastTimer;

    const closeMenu = () => {
        body.classList.remove("menu-open");
        menuButton?.setAttribute("aria-expanded", "false");
    };

    menuButton?.addEventListener("click", () => {
        const isOpen = body.classList.toggle("menu-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    lessonNavigation?.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
        if (!body.classList.contains("menu-open")) return;
        if (lessonNavigation?.contains(event.target) || menuButton?.contains(event.target)) return;
        closeMenu();
    });

    const updateProgress = () => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visible) return;

            navigationLinks.forEach((link) => {
                const isActive = link.getAttribute("href") === `#${visible.target.id}`;
                link.classList.toggle("is-active", isActive);
                if (isActive) link.setAttribute("aria-current", "true");
                else link.removeAttribute("aria-current");
            });
        }, { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.15, 0.35] });

        observedSections.forEach((section) => sectionObserver.observe(section));
    }

    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add("is-visible");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
    };

    document.querySelectorAll("[data-copy-code]").forEach((button) => {
        button.addEventListener("click", async () => {
            const code = button.closest(".code-block")?.querySelector("code")?.textContent ?? "";

            try {
                await navigator.clipboard.writeText(code);
                button.textContent = "Copied";
                showToast("Code copied to clipboard");
                window.setTimeout(() => { button.textContent = "Copy"; }, 1500);
            } catch {
                showToast("Select the code and press Ctrl+C");
            }
        });
    });

    document.querySelectorAll("[data-print-page]").forEach((button) => {
        button.addEventListener("click", () => window.print());
    });
})();
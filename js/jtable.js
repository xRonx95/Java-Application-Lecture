document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const menuButton = document.getElementById("menuButton");
  const closeMenu = document.getElementById("closeMenu");
  const sidebar = document.getElementById("lessonNavigation");
  const overlay = document.getElementById("pageOverlay");
  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const navigationLinks = [...document.querySelectorAll(".lesson-sidebar a")];
  const lessonSections = [...document.querySelectorAll(".lesson-section[id]")];

  const openNavigation = () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    body.classList.add("menu-open");
    menuButton.setAttribute("aria-expanded", "true");
  };

  const closeNavigation = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  };

  menuButton.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) {
      closeNavigation();
    } else {
      openNavigation();
    }
  });

  closeMenu.addEventListener("click", closeNavigation);
  overlay.addEventListener("click", closeNavigation);

  navigationLinks.forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  const updateProgress = () => {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = documentHeight > 0
      ? Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100))
      : 0;

    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${Math.round(percentage)}% complete`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  const activeLinkObserver = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleEntry) return;

    navigationLinks.forEach((link) => {
      const isCurrent = link.getAttribute("href") === `#${visibleEntry.target.id}`;
      link.classList.toggle("active", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }, {
    rootMargin: "-18% 0px -62% 0px",
    threshold: [0.05, 0.25, 0.5]
  });

  lessonSections.forEach((section) => activeLinkObserver.observe(section));

  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const code = button.closest(".code-block")?.querySelector("pre code");
      if (!code) return;

      const originalLabel = button.textContent;

      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = "Copied";
        button.classList.add("copied");
      } catch (error) {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = "Code selected";
      }

      window.setTimeout(() => {
        button.textContent = originalLabel;
        button.classList.remove("copied");
      }, 1800);
    });
  });
});
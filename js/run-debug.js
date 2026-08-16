document.addEventListener("DOMContentLoaded", () => {
    const links = Array.from(document.querySelectorAll(".topic-link"));
    const sections = Array.from(document.querySelectorAll("[data-section]"));
    const menu = document.getElementById("lessonNavigation");
    const menuButton = document.getElementById("menuButton");
    const closeMenuButton = document.getElementById("closeMenu");
    const overlay = document.getElementById("navigationOverlay");
    const progressLabel = document.getElementById("progressLabel");
    const progressFill = document.getElementById("progressFill");
    const previousButton = document.getElementById("previousTopic");
    const nextButton = document.getElementById("nextTopic");
    let currentIndex = 0;

    function openMenu() {
        menu.classList.add("open");
        overlay.classList.add("open");
        document.body.classList.add("menu-open");
        menuButton.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
        menu.classList.remove("open");
        overlay.classList.remove("open");
        document.body.classList.remove("menu-open");
        menuButton.setAttribute("aria-expanded", "false");
    }

    function updateNavigation(index) {
        currentIndex = Math.max(0, Math.min(sections.length - 1, index));
        links.forEach((link, linkIndex) => {
            link.classList.toggle("active", linkIndex === currentIndex);
            if (linkIndex === currentIndex) {
                link.setAttribute("aria-current", "step");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        const topicNumber = currentIndex + 1;
        progressLabel.textContent = `Topic ${topicNumber} of ${sections.length}`;
        progressFill.style.width = `${(topicNumber / sections.length) * 100}%`;
        previousButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === sections.length - 1;
        nextButton.textContent = currentIndex === sections.length - 2 ? "Take Quiz →" : "Next →";
    }

    function goToTopic(index) {
        updateNavigation(index);
        sections[currentIndex].scrollIntoView({ behavior: "smooth", block: "start" });
        closeMenu();
    }

    menuButton.addEventListener("click", openMenu);
    closeMenuButton.addEventListener("click", closeMenu);
    overlay.addEventListener("click", closeMenu);

    links.forEach((link, index) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            goToTopic(index);
        });
    });

    previousButton.addEventListener("click", () => goToTopic(currentIndex - 1));
    nextButton.addEventListener("click", () => goToTopic(currentIndex + 1));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    const observer = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
            const index = sections.indexOf(visible.target);
            if (index >= 0) updateNavigation(index);
        }
    }, { rootMargin: "-15% 0px -65% 0px", threshold: [0, 0.15, 0.35] });

    sections.forEach((section) => observer.observe(section));

    document.querySelectorAll(".copy-code").forEach((button) => {
        button.addEventListener("click", async () => {
            const code = button.closest(".code-block").querySelector("code").textContent;
            try {
                await navigator.clipboard.writeText(code);
                const original = button.textContent;
                button.textContent = "Copied!";
                setTimeout(() => { button.textContent = original; }, 1400);
            } catch (error) {
                button.textContent = "Select text";
                setTimeout(() => { button.textContent = "Copy"; }, 1400);
            }
        });
    });

    const revealButton = document.getElementById("revealSolution");
    const solutionPanel = document.getElementById("solutionPanel");
    revealButton.addEventListener("click", () => {
        const willShow = solutionPanel.hidden;
        solutionPanel.hidden = !willShow;
        revealButton.textContent = willShow ? "Hide solution" : "Reveal solution";
        revealButton.setAttribute("aria-expanded", String(willShow));
    });

    const quizForm = document.getElementById("quizForm");
    const quizResult = document.getElementById("quizResult");
    const answerKey = { q1: "b", q2: "c", q3: "a", q4: "b", q5: "c" };

    quizForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(quizForm);
        const unanswered = Object.keys(answerKey).filter((name) => !formData.get(name));

        quizResult.className = "quiz-result show";
        if (unanswered.length > 0) {
            quizResult.classList.add("notice");
            quizResult.textContent = `Please answer all questions. Unanswered: ${unanswered.length}.`;
            return;
        }

        const score = Object.entries(answerKey)
            .filter(([name, answer]) => formData.get(name) === answer)
            .length;

        quizResult.classList.add(score >= 4 ? "success" : "notice");
        const message = score === 5
            ? "Excellent debugging knowledge!"
            : score >= 4
                ? "Great work!"
                : "Review the lesson topics and try again.";
        quizResult.textContent = `Your score is ${score}/5. ${message}`;
    });

    document.getElementById("resetQuiz").addEventListener("click", () => {
        quizResult.className = "quiz-result";
        quizResult.textContent = "";
    });

    document.getElementById("backToTop").addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    updateNavigation(0);
});

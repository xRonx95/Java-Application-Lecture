(() => {
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const progressBar = document.getElementById("readingProgress");
  const updateProgress = () => {
    if (!progressBar) return;
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = distance > 0 ? (window.scrollY / distance) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const source = document.getElementById(button.dataset.copy);
      if (!source) return;
      const originalText = button.textContent;
      try {
        await navigator.clipboard.writeText(source.innerText);
        button.textContent = "Copied";
      } catch {
        button.textContent = "Select and copy";
      }
      window.setTimeout(() => { button.textContent = originalText; }, 1800);
    });
  });

  document.querySelectorAll("[data-reveal]").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = document.getElementById(button.dataset.reveal);
      if (!answer) return;
      answer.hidden = !answer.hidden;
      button.textContent = answer.hidden ? "Reveal answer" : "Hide answer";
    });
  });

  const assessmentForm = document.getElementById("assessmentForm");
  const scoreBox = document.getElementById("scoreBox");
  if (assessmentForm && scoreBox) {
    assessmentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const questions = [...assessmentForm.querySelectorAll("fieldset[data-answer]")];
      let score = 0;

      questions.forEach((question) => {
        question.classList.remove("correct", "incorrect");
        const selected = question.querySelector("input:checked");
        const isCorrect = selected && selected.value === question.dataset.answer;
        if (isCorrect) score += 1;
        question.classList.add(isCorrect ? "correct" : "incorrect");
      });

      const message = score === questions.length
        ? "Excellent work. You demonstrated complete understanding."
        : score >= 3
          ? "Good progress. Review the highlighted questions before continuing."
          : "Please review Topics 2, 3, and 7, then try the assessment again.";
      scoreBox.textContent = `Your score is ${score} out of ${questions.length}. ${message}`;
      scoreBox.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();
(() => {
  'use strict';

  const progressBar = document.getElementById('readingProgress');
  const copyNotice = document.getElementById('copyNotice');
  const printButtons = [
    document.getElementById('printLesson'),
    document.getElementById('printLessonBottom')
  ].filter(Boolean);

  const updateProgress = () => {
    const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = pageHeight > 0 ? (window.scrollY / pageHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  printButtons.forEach((button) => {
    button.addEventListener('click', () => window.print());
  });

  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;

      try {
        await navigator.clipboard.writeText(target.textContent);
        button.textContent = 'Copied';
        copyNotice.classList.add('is-visible');
        window.setTimeout(() => {
          button.textContent = 'Copy';
          copyNotice.classList.remove('is-visible');
        }, 1800);
      } catch (error) {
        button.textContent = 'Select code manually';
        window.setTimeout(() => { button.textContent = 'Copy'; }, 2200);
      }
    });
  });
})();

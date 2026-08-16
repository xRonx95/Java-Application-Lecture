const menuButton = document.querySelector('.menu-button');
const sidebar = document.querySelector('.lesson-sidebar');
const overlay = document.querySelector('.nav-overlay');
const topicLinks = [...document.querySelectorAll('.topic-nav a')];

function closeMenu() {
  menuButton?.setAttribute('aria-expanded', 'false');
  sidebar?.classList.remove('open');
  overlay?.classList.remove('open');
  document.body.classList.remove('nav-open');
}

menuButton?.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(willOpen));
  sidebar?.classList.toggle('open', willOpen);
  overlay?.classList.toggle('open', willOpen);
  document.body.classList.toggle('nav-open', willOpen);
});

overlay?.addEventListener('click', closeMenu);
topicLinks.forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const sections = topicLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;

  topicLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
  });
}, { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.2, 0.5] });

sections.forEach((section) => observer.observe(section));

document.querySelectorAll('.copy-button').forEach((button) => {
  button.addEventListener('click', async () => {
    const code = button.closest('.code-window')?.querySelector('code')?.innerText;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'Copied';
      button.classList.add('copied');
      window.setTimeout(() => {
        button.textContent = 'Copy';
        button.classList.remove('copied');
      }, 1600);
    } catch {
      button.textContent = 'Select text';
    }
  });
});
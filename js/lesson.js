const menuButton = document.getElementById('menuButton');
const closeMenuButton = document.getElementById('closeMenu');
const sidebar = document.getElementById('lessonNavigation');
const overlay = document.getElementById('navOverlay');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const lessonLinks = [...document.querySelectorAll('.sidebar nav a')];

function setMenu(open) {
    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('show', open);
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
}

menuButton.addEventListener('click', () => setMenu(true));
closeMenuButton.addEventListener('click', () => setMenu(false));
overlay.addEventListener('click', () => setMenu(false));

lessonLinks.forEach(link => {
    link.addEventListener('click', () => setMenu(false));
});

document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', async () => {
        const code = button.closest('.code-block').querySelector('code').textContent;
        try {
            await navigator.clipboard.writeText(code);
            const oldText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => button.textContent = oldText, 1400);
        } catch {
            button.textContent = 'Select and copy';
        }
    });
});

const sections = [...document.querySelectorAll('main section[id]')];
const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        lessonLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
    });
}, { rootMargin: '-22% 0px -68% 0px' });

sections.forEach(section => sectionObserver.observe(section));

function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(100, Math.round((window.scrollY / scrollable) * 100)) : 0;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${progress}% complete`;
}

window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', () => {
    if (window.innerWidth > 820) setMenu(false);
    updateProgress();
});
updateProgress();

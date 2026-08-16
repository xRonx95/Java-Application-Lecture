const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.main-navigation');
const progressBar = document.querySelector('#progressBar');

menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? '✕' : '☰';
});

navigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navigation.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.textContent = '☰';
    });
});

document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', async () => {
        const code = button.closest('.code-block').querySelector('code').innerText;
        try {
            await navigator.clipboard.writeText(code);
            button.textContent = 'Copied!';
            setTimeout(() => { button.textContent = 'Copy'; }, 1400);
        } catch (error) {
            button.textContent = 'Select code';
        }
    });
});

document.querySelector('#quizForm').addEventListener('submit', event => {
    event.preventDefault();
    const questions = [...event.currentTarget.querySelectorAll('fieldset')];
    let score = 0;

    questions.forEach(question => {
        const selected = question.querySelector('input:checked');
        if (selected && selected.value === question.dataset.answer) score++;
    });

    const result = document.querySelector('#quizResult');
    result.textContent = `Your score is ${score} out of ${questions.length}. ${score === questions.length ? 'Excellent work!' : 'Review the lesson and try again.'}`;
    result.className = `quiz-result ${score === questions.length ? 'success' : 'warning'}`;
});

function updateReadingProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(100, percentage)}%`;
}

window.addEventListener('scroll', updateReadingProgress, { passive: true });
updateReadingProgress();

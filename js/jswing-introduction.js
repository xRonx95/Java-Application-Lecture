document.querySelector('.menu-button')?.addEventListener('click', function () {
  const nav = document.querySelector('.topnav');
  const isOpen = nav?.classList.toggle('open');
  this.setAttribute('aria-expanded', String(Boolean(isOpen)));
});

document.querySelectorAll('.topnav a').forEach(link => link.addEventListener('click', () => {
  document.querySelector('.topnav')?.classList.remove('open');
}));

document.querySelectorAll('.code-block').forEach(block => {
  const button = block.querySelector('.code-toolbar button');
  const code = block.querySelector('code');
  button?.addEventListener('click', async () => {
    await navigator.clipboard.writeText(code?.textContent || '');
    button.textContent = 'Copied!';
    setTimeout(() => { button.textContent = 'Copy code'; }, 1600);
  });
});

const checkButton = document.querySelector('.quiz-button');
const answerKey = { q1: 'JFrame', q2: 'setVisible(true)', q3: 'ActionListener' };
document.querySelectorAll('.quiz-card input').forEach(input => input.addEventListener('change', () => {
  const ready = Object.keys(answerKey).every(name => document.querySelector(`input[name="${name}"]:checked`));
  if (checkButton) checkButton.disabled = !ready;
}));

checkButton?.addEventListener('click', () => {
  let score = 0;
  Object.entries(answerKey).forEach(([name, correct]) => {
    document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
      const label = input.closest('label');
      label?.classList.remove('correct', 'wrong');
      if (input.value === correct) label?.classList.add('correct');
      else if (input.checked) label?.classList.add('wrong');
    });
    if (document.querySelector(`input[name="${name}"]:checked`)?.value === correct) score++;
  });
  let card = document.querySelector('.score-card');
  if (!card) {
    card = document.createElement('div');
    card.className = 'score-card';
    card.setAttribute('role', 'status');
    checkButton.after(card);
  }
  card.innerHTML = `<b>${score}/3</b><div><strong>${score === 3 ? 'Excellent work!' : 'Good attempt—review the highlighted answer.'}</strong><p>${score === 3 ? 'You are ready for the practice project.' : 'Correct answers are shown in green.'}</p></div>`;
});
const menuButton = document.querySelector('.menu-button');
const lessonNav = document.querySelector('#lesson-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  lessonNav?.classList.toggle('is-open', !isOpen);
});

lessonNav?.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuButton?.setAttribute('aria-expanded', 'false');
    lessonNav.classList.remove('is-open');
  }
});

const helloButton = document.querySelector('#helloButton');
const helloMessage = document.querySelector('#helloMessage');

helloButton?.addEventListener('click', () => {
  if (helloMessage) {
    helloMessage.textContent = 'Excellent! The click event worked.';
    helloMessage.classList.add('success');
  }
});

let count = 0;
const countButton = document.querySelector('#countButton');
const countOutput = document.querySelector('#countOutput');
const resetCount = document.querySelector('#resetCount');

function updateCount() {
  if (countOutput) countOutput.textContent = `Total clicks: ${count}`;
}

countButton?.addEventListener('click', () => {
  count += 1;
  updateCount();
});

resetCount?.addEventListener('click', () => {
  count = 0;
  updateCount();
  countButton?.focus();
});

const detailsButton = document.querySelector('#detailsButton');
const eventOutput = document.querySelector('#eventOutput');

detailsButton?.addEventListener('click', (event) => {
  if (eventOutput && event.currentTarget instanceof HTMLButtonElement) {
    eventOutput.textContent = `Event type: ${event.type} · Current target: ${event.currentTarget.textContent}`;
    eventOutput.classList.add('success');
  }
});

const toggleButton = document.querySelector('#toggleButton');
const togglePanel = document.querySelector('#togglePanel');

toggleButton?.addEventListener('click', () => {
  const active = togglePanel?.classList.toggle('active') ?? false;
  toggleButton.setAttribute('aria-pressed', String(active));
  toggleButton.textContent = active ? 'Deactivate panel' : 'Activate panel';
  if (togglePanel) togglePanel.textContent = `Current state: ${active ? 'Active' : 'Inactive'}`;
});

const hoverButton = document.querySelector('#hoverButton');
const hoverOutput = document.querySelector('#hoverOutput');

hoverButton?.addEventListener('pointerenter', () => {
  if (hoverOutput) hoverOutput.textContent = 'pointerenter detected: the pointer moved inside.';
});

hoverButton?.addEventListener('pointerleave', () => {
  if (hoverOutput) hoverOutput.textContent = 'pointerleave detected: the pointer moved outside.';
});

hoverButton?.addEventListener('click', () => {
  if (hoverOutput) hoverOutput.textContent = 'click detected: this also works on touch screens.';
});

const doubleButton = document.querySelector('#doubleButton');
const doubleOutput = document.querySelector('#doubleOutput');

doubleButton?.addEventListener('dblclick', () => {
  if (doubleOutput) {
    doubleOutput.textContent = 'dblclick detected successfully.';
    doubleOutput.classList.add('success-text');
  }
});

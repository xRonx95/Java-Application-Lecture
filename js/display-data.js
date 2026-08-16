const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".lesson-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const open = navigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll(".copy-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.closest(".code-card")?.querySelector("code")?.innerText;
    if (!code) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const temporaryField = document.createElement("textarea");
        temporaryField.value = code;
        temporaryField.setAttribute("readonly", "");
        temporaryField.style.position = "fixed";
        temporaryField.style.opacity = "0";
        document.body.appendChild(temporaryField);
        temporaryField.select();
        document.execCommand("copy");
        temporaryField.remove();
      }
    } catch {
      button.textContent = "Copy unavailable";
      window.setTimeout(() => (button.textContent = "Copy code"), 1600);
      return;
    }
    const original = button.textContent;
    button.textContent = "Copied";
    button.classList.add("copied");
    window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove("copied");
    }, 1600);
  });
});

const sections = document.querySelectorAll("main section[id]");
const progress = document.querySelector(".reading-progress");

window.addEventListener("scroll", () => {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const percent = available > 0 ? (window.scrollY / available) * 100 : 0;
  if (progress) progress.style.width = `${percent}%`;

  let current = "overview";
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 180) current = section.id;
  });
  document.querySelectorAll(".lesson-nav a[href^='#']").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
});
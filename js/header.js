const headerTarget = document.getElementById("site-header");

function initializePage() {
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-navigation");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");
      menuButton.classList.toggle("is-active", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navigation.classList.remove("is-open");
        menuButton.classList.remove("is-active");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
      });
    });
  }

  document.querySelectorAll(".run-code").forEach((button) => {
    button.addEventListener("click", () => {
      const output = button.nextElementSibling;
      output.textContent = `Output: ${button.dataset.output}`;
      output.classList.add("is-visible");
    });
  });

  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
}

fetch("header.html")
  .then((response) => {
    if (!response.ok) throw new Error("Header could not be loaded.");
    return response.text();
  })
  .then((markup) => {
    headerTarget.innerHTML = markup;
    initializePage();
  })
  .catch(() => {
    headerTarget.innerHTML = '<p class="header-load-error">Please run this project through Apache NetBeans or a local web server.</p>';
    initializePage();
  });

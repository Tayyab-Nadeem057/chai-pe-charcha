(function () {
  const LOGO = "images/chai pe charcha logo.webp";

  function mark(compact) {
    return `<span class="brand-mark${compact ? " brand-mark--sm" : ""}">
      <span class="brand-mark-shine" aria-hidden="true"></span>
      <span class="brand-mark-ring" aria-hidden="true"></span>
      <img class="brand-logo-img" src="${LOGO}" alt="Chai Pe Charcha" width="160" height="48" decoding="async"/>
    </span>`;
  }

  function mountLogo(el) {
    const compact = el.classList.contains("brand-compact") || el.dataset.brand === "compact";
    el.classList.add("brand-lockup", "brand-lockup--restaurant");
    el.innerHTML = mark(compact);
  }

  document.querySelectorAll(".nav-logo, .brand-lockup-slot").forEach(mountLogo);
})();

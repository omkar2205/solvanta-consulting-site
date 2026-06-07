/* =========================================================
   Solvanta Consulting
   Shared Site Behaviour
   ========================================================= */

loadResponsivePolish();

document.addEventListener("DOMContentLoaded", () => {
  initBrandLogo();
  initPrimaryNavigation();
  initFooterNavigation();
  initMobileNavigation();
  initActiveNavigation();
  initCurrentYear();
  initExternalLinks();
});

/* -----------------------------
   Responsive polish stylesheet
----------------------------- */

function loadResponsivePolish() {
  const href = "/assets/css/responsive-polish.css?v=4";

  if (document.querySelector(`link[href="${href}"]`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/* -----------------------------
   Brand logo
----------------------------- */

function initBrandLogo() {
  const brandLinks = document.querySelectorAll(".brand-link");

  brandLinks.forEach((brandLink) => {
    const brandMark = brandLink.querySelector(".brand-mark");
    if (!brandMark) return;

    brandMark.classList.add("brand-mark-primary");
    brandLink.classList.add("has-primary-logo");
    brandMark.innerHTML = '<img class="brand-logo-primary" src="/assets/img/logo-primary.svg" alt="" width="180" height="67" />';
  });
}

/* -----------------------------
   Primary navigation
----------------------------- */

function initPrimaryNavigation() {
  const navMenus = document.querySelectorAll("[data-nav-menu]");
  const links = [
    { href: "/", label: "Home" },
    { href: "/courses/", label: "Courses" },
    { href: "/about/", label: "About" },
    { href: "/contact/", label: "Contact" },
  ];

  navMenus.forEach((navMenu) => {
    navMenu.innerHTML = links
      .map((link) => `<a href="${link.href}">${link.label}</a>`)
      .join("");
  });
}

/* -----------------------------
   Footer navigation
----------------------------- */

function initFooterNavigation() {
  const footerLayout = document.querySelector(".site-footer .footer-layout");
  if (!footerLayout) return;

  footerLayout.innerHTML = `
    <div class="footer-brand">
      <p class="footer-title">Solvanta Consulting</p>
      <p class="muted">Free practical learning resources, with certificates only where they fit the course.</p>
    </div>
    <div>
      <h3>Site</h3>
      <nav class="footer-links" aria-label="Footer site links">
        <a data-footer-link href="/courses/">Courses</a>
        <a data-footer-link href="/about/">About</a>
        <a data-footer-link href="/contact/">Contact</a>
        <a data-footer-link href="/verify/">Certificate lookup</a>
      </nav>
    </div>
    <div>
      <h3>Policies</h3>
      <nav class="footer-links" aria-label="Footer policy links">
        <a data-footer-link href="/privacy-policy/">Privacy Policy</a>
        <a data-footer-link href="/terms/">Terms of Use</a>
        <a data-footer-link href="/certificate-policy/">Certificate Policy</a>
        <a data-footer-link href="/data-deletion/">Data Deletion</a>
      </nav>
    </div>
  `;
}

/* -----------------------------
   Mobile navigation
----------------------------- */

function initMobileNavigation() {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  if (!navToggle || !navMenu) return;

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");

    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation menu");
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu = navMenu.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle && navMenu.classList.contains("open")) {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation menu");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenu.classList.contains("open")) {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open navigation menu");
      navToggle.focus();
    }
  });
}

/* -----------------------------
   Active navigation
----------------------------- */

function initActiveNavigation() {
  const currentPath = normalizePath(window.location.pathname);
  const navLinks = document.querySelectorAll("[data-nav-menu] a, [data-footer-link]");

  navLinks.forEach((link) => {
    const linkPath = normalizePath(new URL(link.href, window.location.origin).pathname);

    if (linkPath === currentPath) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function normalizePath(path) {
  if (!path) return "/";

  let normalized = path.trim();

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/* -----------------------------
   Current year
----------------------------- */

function initCurrentYear() {
  const yearElements = document.querySelectorAll("[data-current-year]");
  const year = new Date().getFullYear();

  yearElements.forEach((element) => {
    element.textContent = String(year);
  });
}

/* -----------------------------
   External links
----------------------------- */

function initExternalLinks() {
  const links = document.querySelectorAll('a[href^="http"]');

  links.forEach((link) => {
    const url = new URL(link.href);

    if (url.hostname !== window.location.hostname) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });
}

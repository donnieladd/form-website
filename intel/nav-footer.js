(function () {
  var arrow =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

  var navItems = [
    { href: "/services.html", label: "what we do" },
    { href: "/businesses.html", label: "businesses" },
    { href: "/ministries.html", label: "ministries" },
    { href: "/work.html", label: "work" },
    { href: "/insights.html", label: "insights" },
    { href: "/about.html", label: "about" },
  ];

  var isContactPage =
    /contact\.html$/i.test(location.pathname) ||
    location.pathname.replace(/\/+$/, "") === "/contact";

  function isActive(href) {
    var path = location.pathname.replace(/\/+$/, "") || "/";
    if (href === "/" && (path === "/" || path === "/index.html")) return true;
    if (href.endsWith(".html") && path.endsWith(href.replace(/^\//, ""))) return true;
    if (href === "/contact.html" && isContactPage) return true;
    return false;
  }

  function navLink(item) {
    var cls = isActive(item.href) ? " fi-nav-link active" : " fi-nav-link";
    return '<a href="' + item.href + '" class="' + cls.trim() + '">' + item.label + "</a>";
  }

  var contactNavLink = isContactPage
    ? '<a href="/contact.html" class="fi-nav-link active">contact</a>'
    : "";

  var navCtaClass = isContactPage ? "fi-btn fi-btn-primary" : "fi-btn fi-btn-nav-outline";

  var navHTML =
    '<header class="fi-nav" role="banner">' +
    '<div class="fi-container fi-nav-inner">' +
    '<a href="/" class="fi-brand" aria-label="form. home">form<span class="fi-brand-dot">.</span></a>' +
    '<nav class="fi-nav-links" aria-label="Primary">' +
    navItems.map(navLink).join("") +
    contactNavLink +
    "</nav>" +
    '<div class="fi-nav-actions">' +
    '<a href="/contact.html" class="' +
    navCtaClass +
    '">talk to form. ' +
    arrow +
    "</a>" +
    '<button class="fi-nav-burger" type="button" aria-label="Open menu">☰</button>' +
    "</div>" +
    "</div>" +
    "</header>" +
    '<div class="fi-mobile-panel" id="fi-mobile-panel" aria-hidden="true">' +
    navItems
      .map(function (item) {
        return '<a href="' + item.href + '">' + item.label + "</a>";
      })
      .join("") +
    '<a href="/contact.html">contact</a>' +
    '<a href="/contact.html">start a project</a>' +
    "</div>";

  var footerLocations = "ATL • CLT • MIA • BHM • GVL";

  var footerHTML =
    '<footer class="fi-footer" role="contentinfo">' +
    '<div class="fi-container fi-footer-grid">' +
    '<div class="fi-footer-brand">' +
    '<div class="fi-brand">form<span class="fi-brand-dot">.</span></div>' +
    '<div class="fi-footer-tag">vision needs structure.</div>' +
    '<div class="fi-footer-headline">the future needs <em class="fi-blue-dot">form.</em></div>' +
    '<a href="/contact.html" class="fi-btn fi-btn-primary">talk to form. ' +
    arrow +
    "</a>" +
    '<div class="fi-footer-locations">' +
    footerLocations +
    "</div>" +
    "</div>" +
    '<div class="fi-footer-col">' +
    "<h3>navigation</h3>" +
    '<ul class="fi-footer-list">' +
    navItems
      .concat([{ href: "/contact.html", label: "contact" }])
      .map(function (item) {
        return (
          "<li><a href=\"" +
          item.href +
          '">' +
          item.label +
          " " +
          arrow +
          "</a></li>"
        );
      })
      .join("") +
    "</ul>" +
    "</div>" +
    '<div class="fi-footer-col">' +
    "<h3>solutions &amp; products</h3>" +
    '<ul class="fi-footer-list">' +
    [
      { page: "processes", label: "processes by form." },
      { page: "people", label: "people by form." },
      { page: "ledger", label: "ledger by form." },
      { page: "intellect", label: "intellect by form." },
      { page: "messages", label: "messages by form." },
      { page: "experience", label: "form. experience" },
    ]
      .map(function (item) {
        return (
          '<li><a href="/' +
          item.page +
          '.html">' +
          item.label +
          " " +
          arrow +
          "</a></li>"
        );
      })
      .join("") +
    "</ul>" +
    "</div>" +
    '<div class="fi-footer-col">' +
    "<h3>contact</h3>" +
    [
      "hello@formintel.co",
      "continuum@formintel.co",
      "support@formintel.co",
    ]
      .map(function (email) {
        return (
          '<a class="fi-footer-mail" href="mailto:' +
          email +
          '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span>' +
          email +
          "</span>" +
          arrow +
          "</a>"
        );
      })
      .join("") +
    "</div>" +
    "</div>" +
    '<div class="fi-container fi-footer-bar">' +
    "<span>© 2026 form. all rights reserved.</span>" +
    '<div class="fi-footer-bar-links">' +
    '<a href="/privacy.html">privacy</a>' +
    '<span class="fi-dot-sep">•</span>' +
    '<a href="/terms.html">terms</a>' +
    '<span class="fi-dot-sep">•</span>' +
    '<a href="https://instagram.com" rel="noopener noreferrer">instagram</a>' +
    '<span class="fi-dot-sep">•</span>' +
    '<a href="https://linkedin.com" rel="noopener noreferrer">linkedin</a>' +
    "</div>" +
    "</div>" +
    '<div class="fi-prism fi-prism-left" aria-hidden="true"></div>' +
    "</footer>";

  /* Static conic vignette + film grain. Injected once per page so every
     page carries an identical atmosphere layer. Styles live in
     intel/components.css under "ATMOSPHERE". Purely decorative: aria-hidden
     and pointer-events:none, so it never reaches the accessibility tree. */
  function injectAtmosphere() {
    if (document.querySelector(".fi-atmosphere")) return;
    var layer = document.createElement("div");
    layer.className = "fi-atmosphere";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML =
      '<div class="fi-atmosphere__conic"></div>' +
      '<div class="fi-atmosphere__vignette"></div>' +
      '<div class="fi-atmosphere__grain"></div>';
    document.body.appendChild(layer);
  }

  function inject() {
    injectAtmosphere();

    var navMount = document.getElementById("fi-nav-mount");
    var footerMount = document.getElementById("fi-footer-mount");
    if (navMount) navMount.innerHTML = navHTML;
    if (footerMount) footerMount.innerHTML = footerHTML;

    var nav = document.querySelector(".fi-nav");
    if (nav) {
      var onScroll = function () {
        nav.classList.toggle("is-solid", window.scrollY > 24);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    var burger = document.querySelector(".fi-nav-burger");
    var panel = document.getElementById("fi-mobile-panel");
    if (burger && panel) {
      burger.addEventListener("click", function () {
        panel.classList.toggle("open");
        panel.setAttribute(
          "aria-hidden",
          panel.classList.contains("open") ? "false" : "true"
        );
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();

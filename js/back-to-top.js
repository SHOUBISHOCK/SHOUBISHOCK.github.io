/**
 * Self-hosted floating "Back to Top" button (replaces Elfsight Back to Top widget)
 * - Bottom-center placement
 * - Auto-shifts up when the cookie consent bar (#mge-cookie-bar) is visible
 *
 * USAGE:
 *   <script src="/assets/back-to-top.js" defer></script>
 *   (load order relative to cookie-consent.js doesn't matter — detection is dynamic)
 *
 * Configure via the CONFIG object below, or override before the script loads:
 *   <script>window.BACK_TO_TOP_CONFIG = { showAfter: 400 };</script>
 *   <script src="/assets/back-to-top.js" defer></script>
 */
(function () {
  "use strict";

  var CONFIG = Object.assign({
    text: "Back to Top",
    bgColor: "#111111",
    textColor: "#8a4fff",
    borderColor: "#8a4fff",
    // px scrolled down before the button appears
    showAfter: 300,
    // base gap from the bottom of the viewport (px)
    offset: 24,
    // extra gap above the cookie bar, when it's showing (px)
    cookieGap: 12
  }, window.BACK_TO_TOP_CONFIG || {});

  var style = document.createElement("style");
  style.textContent = [
    "#mge-back-to-top{position:fixed;left:50%;bottom:" + CONFIG.offset + "px;",
    "z-index:2147483647;display:flex;align-items:center;gap:8px;",
    "padding:10px 20px;border-radius:999px;",
    "background:" + CONFIG.bgColor + ";color:" + CONFIG.textColor + ";",
    "border:1px solid " + CONFIG.borderColor + ";",
    "font:600 14px/1 system-ui,sans-serif;cursor:pointer;",
    "box-shadow:0 2px 10px rgba(0,0,0,.25);",
    "opacity:0;visibility:hidden;",
    "transform:translateX(-50%) translateY(8px);",
    "transition:opacity .2s ease,transform .2s ease,visibility .2s,bottom .2s ease;}",
    "#mge-back-to-top.mge-visible{opacity:1;visibility:visible;transform:translateX(-50%) translateY(0);}",
    "#mge-back-to-top:hover{opacity:.85;}",
    "#mge-back-to-top svg{width:14px;height:14px;fill:none;stroke:" + CONFIG.textColor + ";",
    "stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}"
  ].join("");
  document.head.appendChild(style);

  var btn = document.createElement("button");
  btn.id = "mge-back-to-top";
  btn.type = "button";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML =
    '<svg viewBox="0 0 24 24"><polyline points="17 11 12 6 7 11"></polyline><polyline points="17 18 12 13 7 18"></polyline></svg>' +
    "<span>" + CONFIG.text + "</span>";

  function mount() {
    document.body.appendChild(btn);
    updatePosition();
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }

  // Shift the button above the cookie bar whenever it's present in the DOM.
  function updatePosition() {
    var cookieBar = document.getElementById("mge-cookie-bar");
    if (cookieBar) {
      var h = cookieBar.getBoundingClientRect().height;
      btn.style.bottom = (CONFIG.offset + h + CONFIG.cookieGap) + "px";
    } else {
      btn.style.bottom = CONFIG.offset + "px";
    }
  }

  // Re-check on scroll/resize (covers cookie bar height changes e.g. text wrap).
  function onScroll() {
    if (window.scrollY > CONFIG.showAfter) {
      btn.classList.add("mge-visible");
    } else {
      btn.classList.remove("mge-visible");
    }
    updatePosition();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updatePosition);

  // Detect the moment the cookie bar is dismissed (removed from DOM) or
  // appears (e.g. injected after this script runs), without polling.
  var observer = new MutationObserver(updatePosition);
  observer.observe(document.body, { childList: true });

  onScroll();

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

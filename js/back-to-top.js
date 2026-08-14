/**
 * Self-hosted floating "Back to Top" button (replaces Elfsight Back to Top widget)
 *
 * USAGE:
 *   <script src="/assets/back-to-top.js" defer></script>
 *
 * Configure via the CONFIG object below, or override before the script loads:
 *   <script>window.BACK_TO_TOP_CONFIG = { showAfter: 400, position: "right" };</script>
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
    // "right" or "left"
    position: "right",
    offset: 24
  }, window.BACK_TO_TOP_CONFIG || {});

  var style = document.createElement("style");
  style.textContent = [
    "#mge-back-to-top{position:fixed;bottom:" + CONFIG.offset + "px;" + CONFIG.position + ":" + CONFIG.offset + "px;",
    "z-index:2147483647;display:flex;align-items:center;gap:8px;",
    "padding:10px 20px;border-radius:999px;",
    "background:" + CONFIG.bgColor + ";color:" + CONFIG.textColor + ";",
    "border:1px solid " + CONFIG.borderColor + ";",
    "font:600 14px/1 system-ui,sans-serif;cursor:pointer;",
    "box-shadow:0 2px 10px rgba(0,0,0,.25);",
    "opacity:0;visibility:hidden;transform:translateY(8px);",
    "transition:opacity .2s ease,transform .2s ease,visibility .2s;}",
    "#mge-back-to-top.mge-visible{opacity:1;visibility:visible;transform:translateY(0);}",
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
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }

  function onScroll() {
    if (window.scrollY > CONFIG.showAfter) {
      btn.classList.add("mge-visible");
    } else {
      btn.classList.remove("mge-visible");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

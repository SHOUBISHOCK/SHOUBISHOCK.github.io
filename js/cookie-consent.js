/**
 * Self-hosted floating bottom cookie consent bar (replaces Elfsight Cookie Consent widget)
 *
 * USAGE:
 *   <script src="/assets/cookie-consent.js" defer></script>
 *
 * Configure via the CONFIG object below, or override before the script loads:
 *   <script>window.COOKIE_CONSENT_CONFIG = { message: "...", version: "2" };</script>
 *   <script src="/assets/cookie-consent.js" defer></script>
 */
(function () {
  "use strict";

  var CONFIG = Object.assign({
    icon: "🍪",
    message: "We use cookie to improve your experience on our site. By using our site you consent cookies.",
    buttonText: "OK",
    bgColor: "#808080",
    textColor: "#ffe600",
    buttonBg: "#22b14c",
    buttonColor: "#ffffff",
    // Bump this any time you change your cookie policy and need everyone
    // to re-consent, even people who already clicked OK on a prior version.
    version: "1"
  }, window.COOKIE_CONSENT_CONFIG || {});

  var STORAGE_KEY = "mge_cookie_consent_v" + CONFIG.version;

  // Already consented for this version -> do nothing.
  if (localStorage.getItem(STORAGE_KEY) === "1") return;

  var style = document.createElement("style");
  style.textContent = [
    "#mge-cookie-bar{position:fixed;left:0;right:0;bottom:0;z-index:2147483647;",
    "display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;",
    "padding:14px 24px;font:14px/1.4 system-ui,sans-serif;",
    "background:" + CONFIG.bgColor + ";color:" + CONFIG.textColor + ";",
    "box-shadow:0 -2px 6px rgba(0,0,0,.15);}",
    "#mge-cookie-bar .mge-icon{font-size:22px;}",
    "#mge-cookie-bar .mge-msg{max-width:900px;text-align:center;}",
    "#mge-cookie-bar button{background:" + CONFIG.buttonBg + ";color:" + CONFIG.buttonColor + ";",
    "border:none;border-radius:3px;padding:8px 22px;font-weight:700;font-size:14px;",
    "cursor:pointer;white-space:nowrap;}",
    "#mge-cookie-bar button:hover{opacity:.9;}",
    "body.mge-cookie-active{padding-bottom:60px;}"
  ].join("");
  document.head.appendChild(style);

  var bar = document.createElement("div");
  bar.id = "mge-cookie-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Cookie consent");
  bar.innerHTML =
    '<span class="mge-icon">' + CONFIG.icon + "</span>" +
    '<span class="mge-msg">' + CONFIG.message + "</span>" +
    '<button type="button">' + CONFIG.buttonText + "</button>";

  function mount() {
    document.body.appendChild(bar);
    document.body.classList.add("mge-cookie-active");
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }

  bar.querySelector("button").addEventListener("click", function () {
    localStorage.setItem(STORAGE_KEY, "1");
    bar.remove();
    document.body.classList.remove("mge-cookie-active");
  });
})();

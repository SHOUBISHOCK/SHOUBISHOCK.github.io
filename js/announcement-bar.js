/**
 * Self-hosted floating top announcement bar (replaces Elfsight Announcement Bar widget)
 *
 * USAGE:
 *   <script src="/assets/announcement-bar.js" defer></script>
 *
 * Configure via the CONFIG object below, or override before the script loads:
 *   <script>window.ANNOUNCEMENT_BAR_CONFIG = { message: "...", linkUrl: "...", version: "2" };</script>
 *   <script src="/assets/announcement-bar.js" defer></script>
 */
(function () {
  "use strict";

  var CONFIG = Object.assign({
    message: "Running crowdfunding currently pending, awaiting for you!",
    linkText: "Learn more",
    linkUrl: "#",
    bgColor: "#1a73e8",
    textColor: "#ffffff",
    // Bump this string any time you want the bar to reappear for everyone
    // who already dismissed a previous version (e.g. "1" -> "2").
    version: "1"
  }, window.ANNOUNCEMENT_BAR_CONFIG || {});

  var STORAGE_KEY = "mge_announcement_bar_dismissed_v" + CONFIG.version;

  // If this version was already closed, do nothing.
  if (localStorage.getItem(STORAGE_KEY) === "1") return;

  var style = document.createElement("style");
  style.textContent = [
    "#mge-announcement-bar{position:fixed;top:0;left:0;right:0;z-index:2147483647;",
    "display:flex;align-items:center;justify-content:center;gap:12px;",
    "padding:10px 40px 10px 16px;font:14px/1.4 system-ui,sans-serif;",
    "background:" + CONFIG.bgColor + ";color:" + CONFIG.textColor + ";",
    "box-shadow:0 2px 6px rgba(0,0,0,.15);text-align:center;}",
    "#mge-announcement-bar a{color:" + CONFIG.textColor + ";text-decoration:underline;font-weight:600;white-space:nowrap;}",
    "#mge-announcement-bar button{position:absolute;right:8px;top:50%;transform:translateY(-50%);",
    "background:transparent;border:none;color:" + CONFIG.textColor + ";font-size:20px;line-height:1;",
    "cursor:pointer;padding:4px 8px;opacity:.85;}",
    "#mge-announcement-bar button:hover{opacity:1;}",
    "body.mge-bar-active{padding-top:44px;}"
  ].join("");
  document.head.appendChild(style);

  var bar = document.createElement("div");
  bar.id = "mge-announcement-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Announcement");
  bar.innerHTML =
    "<span>" + CONFIG.message + "</span>" +
    (CONFIG.linkUrl && CONFIG.linkUrl !== "#"
      ? '<a href="' + CONFIG.linkUrl + '">' + CONFIG.linkText + "</a>"
      : "") +
    '<button type="button" aria-label="Close">&times;</button>';

  function mount() {
    document.body.prepend(bar);
    document.body.classList.add("mge-bar-active");
  }

  if (document.body) {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }

  bar.querySelector("button").addEventListener("click", function () {
    localStorage.setItem(STORAGE_KEY, "1");
    bar.remove();
    document.body.classList.remove("mge-bar-active");
  });
})();

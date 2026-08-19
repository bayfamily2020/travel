// Correct continent metadata for Sri Lanka entries.
const sriLankaRanks = new Set([191, 382, 399, 407, 453]);

function applySriLankaContinentFix() {
  if (typeof places === "undefined" || !Array.isArray(places)) return;
  places.forEach(place => {
    if (sriLankaRanks.has(place.rank) || /斯里兰卡|Sri Lanka/i.test(String(place.country || ""))) {
      place.continent = "亚洲";
    }
  });
}

// Patch before every render so it also covers asynchronously loaded data chunks.
if (typeof render === "function") {
  const baseRenderForContinentFix = render;
  render = function(...args) {
    applySriLankaContinentFix();
    return baseRenderForContinentFix.apply(this, args);
  };
}

queueMicrotask(applySriLankaContinentFix);
document.addEventListener("DOMContentLoaded", applySriLankaContinentFix, { once: true });

// Improve visibility of the card check circle against photos and light backgrounds.
(function improveCardCheckVisibility() {
  const style = document.createElement("style");
  style.textContent = `
    .check {
      border-width: 3px !important;
      border-color: #4f5f55 !important;
      background: rgba(251, 248, 240, 0.88);
      box-shadow: 0 1px 4px rgba(23, 33, 27, 0.28), 0 0 0 1px rgba(255,255,255,0.55);
      color: #fff;
    }
    .place-card.done .check {
      background: #1f4b3b !important;
      border-color: #173b31 !important;
      box-shadow: 0 1px 5px rgba(23, 33, 27, 0.35), 0 0 0 1px rgba(255,255,255,0.6);
    }
    @media (max-width: 580px) {
      .check {
        border-width: 3px !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

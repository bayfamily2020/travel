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

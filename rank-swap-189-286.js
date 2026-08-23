// Swap #189 and #286 content while keeping their new ranking labels.
// Final state: #189 Ross Ice Shelf = must-go (2 points); #286 Catalan Human Towers = optional (1 point).
(function () {
  function applySwap() {
    if (!Array.isArray(places) || places.length < 286) {
      setTimeout(applySwap, 50);
      return;
    }

    const p189 = places.find(p => p.rank === 189);
    const p286 = places.find(p => p.rank === 286);
    if (!p189 || !p286) return;

    Object.assign(p189, {
      fame: "此生必去",
      points: 2,
      continent: "南极洲",
      name: "罗斯冰架（Ross Ice Shelf）",
      country: "南极洲 (Antarctica)",
      type: "地标/特色体验",
      group: "地点与景观"
    });

    Object.assign(p286, {
      fame: "不去也行",
      points: 1,
      continent: "欧洲",
      name: "加泰罗尼亚叠人塔（Catalan Human Towers）",
      country: "西班牙 / Spain",
      type: "节庆中由团队协作搭建层层人塔的加泰罗尼亚传统",
      group: "节日庆典"
    });

    // Move the curated human-tower image from the old rank to its new rank.
    if (typeof featuredMedia === "object" && featuredMedia[189]) {
      featuredMedia[286] = featuredMedia[189];
      delete featuredMedia[189];
    }

    if (typeof render === "function") render();
  }

  document.addEventListener("DOMContentLoaded", applySwap);
})();

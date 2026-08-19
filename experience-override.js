// Replace overlapping entries with distinct iconic travel experiences.
const experienceOverrides = {
  585: {
    name: "维多利亚瀑布魔鬼池游泳（Devil's Pool at Victoria Falls）",
    country: "赞比亚 / Zambia",
    continent: "非洲",
    group: "特色体验",
    type: "在维多利亚瀑布顶端天然岩池中游泳，近距离俯瞰瀑布边缘",
    points: 1,
    fame: "不去也行"
  },
  591: {
    name: "东加座头鲸同游（Swimming with Humpback Whales in Tonga）",
    country: "汤加 / Tonga",
    continent: "大洋洲",
    group: "特色体验",
    type: "在南太平洋海域下水与迁徙座头鲸近距离同游",
    points: 1,
    fame: "不去也行"
  },
  616: {
    name: "塞伦盖蒂热气球（Serengeti Hot-Air Balloon Safari）",
    country: "坦桑尼亚 / Tanzania",
    continent: "非洲",
    group: "特色体验",
    type: "日出乘热气球飞越塞伦盖蒂草原，从空中俯瞰野生动物",
    points: 2,
    fame: "此生必去"
  },
  628: {
    name: "南极冰泳（Antarctic Polar Plunge）",
    country: "南极洲 / Antarctica",
    continent: "南极洲",
    group: "特色体验",
    type: "在南极远征途中跃入接近冰点的极地海水",
    points: 2,
    fame: "此生必去"
  }
};

function applyExperienceOverrides() {
  if (typeof places === "undefined" || !Array.isArray(places)) return;
  places.forEach(place => {
    const patch = experienceOverrides[place.rank];
    if (patch) Object.assign(place, patch);
  });
}

// Apply before each render because data chunks load asynchronously.
if (typeof render === "function") {
  const baseRenderForExperienceOverrides = render;
  render = function(...args) {
    applyExperienceOverrides();
    return baseRenderForExperienceOverrides.apply(this, args);
  };
}

queueMicrotask(applyExperienceOverrides);
document.addEventListener("DOMContentLoaded", applyExperienceOverrides, { once: true });

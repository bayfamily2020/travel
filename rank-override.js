// Travel rank labels override.
updateSummary = function() {
  const score = places.reduce((sum, p) => sum + (visited.has(p.rank) ? p.points : 0), 0);
  const max = places.reduce((sum, p) => sum + p.points, 0);
  const progress = max ? Math.round(score / max * 1000) / 10 : 0;
  $("count").textContent = visited.size;
  $("score").textContent = score;
  $("max-score").textContent = `/ ${max} 得分`;
  $("progress").textContent = `${progress}%`;
  $("progress-bar").style.width = `${progress}%`;

  const levels = [
    [2, "工位钉子户"],
    [4, "家养牛马"],
    [6, "井底观察员"],
    [8, "探头土拨鼠"],
    [10, "年假特种兵"],
    [12, "出逃的羊驼"],
    [14, "奔跑的走地鸡"],
    [16, "护照磨损员"],
    [18, "人形登机牌"],
    [20, "祖国偶尔拥有我"],
    [30, "跨国流窜犯"],
    [40, "漂流的海龟"],
    [50, "地球街溜子"],
    [60, "人形行李箱"],
    [70, "环球达人"],
    [85, "伊本·白图泰"],
    [95, "洄游的灰鲸"]
  ];
  const level = progress >= 95 ? "外星人卧底" : levels.find(([limit]) => progress < limit)[1];
  $("level").textContent = level;
  if ($("final-score")) $("final-score").textContent = score;
  if ($("final-max-score")) $("final-max-score").textContent = `/ ${max} 得分`;
  if ($("final-progress")) $("final-progress").textContent = `${progress}%`;
  if ($("final-level")) $("final-level").textContent = level;
  drawShareCard(score, max, progress, level);
};

// Gateway-city fix: never use the country name as the city fallback.
function normalizedGatewayText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9\u00c0-\u024f\u0400-\u04ff]+/g, " ")
    .trim();
}

function gatewayCountryParts(country) {
  return String(country || "")
    .replace(/[（）]/g, m => m === "（" ? "(" : ")")
    .split(/[\/]/)
    .flatMap(part => [part, englishPart(part)])
    .map(normalizedGatewayText)
    .filter(Boolean);
}

function isCountryLikeGateway(city, country) {
  const c = normalizedGatewayText(city);
  if (!c) return true;
  return gatewayCountryParts(country).some(part => c === part || (part.length > 3 && c.includes(part)));
}

async function nearestSettlement(lat, lon) {
  try {
    const geoUrl = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
    geoUrl.searchParams.set("latitude", lat);
    geoUrl.searchParams.set("longitude", lon);
    geoUrl.searchParams.set("localityLanguage", "en");
    const response = await fetch(geoUrl);
    if (response.ok) {
      const geo = await response.json();
      const direct = [geo.city, geo.locality]
        .map(v => String(v || "").trim())
        .find(Boolean);
      if (direct) return direct;
      const administrative = geo.localityInfo?.administrative || [];
      const namedLocality = administrative
        .map(item => String(item?.name || "").trim())
        .find(name => name && !/^(county|province|state|region|district)$/i.test(name));
      if (namedLocality) return namedLocality;
    }
  } catch (_) {}

  try {
    const osm = new URL("https://nominatim.openstreetmap.org/reverse");
    osm.searchParams.set("format", "jsonv2");
    osm.searchParams.set("lat", lat);
    osm.searchParams.set("lon", lon);
    osm.searchParams.set("zoom", "10");
    osm.searchParams.set("addressdetails", "1");
    osm.searchParams.set("accept-language", "en");
    const response = await fetch(osm, {headers:{"Accept":"application/json"}});
    if (response.ok) {
      const data = await response.json();
      const a = data.address || {};
      return a.city || a.town || a.village || a.municipality || a.hamlet || a.suburb || "";
    }
  } catch (_) {}
  return "";
}

seededMedia = function(p) {
  const featured = featuredMedia[p.rank];
  if (featured) return {
    city: featured.city,
    image: `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(featured.file)}?width=720`
  };
  const cached = mediaCache[p.rank];
  if (!cached) return null;
  if (isCountryLikeGateway(cached.city, p.country)) return cached.image ? {image: cached.image, city: ""} : null;
  return cached;
};

fetchMedia = async function(p) {
  const featured = featuredMedia[p.rank];
  if (featured) return {
    city: featured.city,
    image: `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(featured.file)}?width=720`
  };

  const cached = mediaCache[p.rank];
  if (cached?.image && cached?.city && !isCountryLikeGateway(cached.city, p.country)) return cached;

  const query = `${englishPart(p.name)} ${englishPart(p.country)}`;
  const params = new URLSearchParams({
    action:"query", format:"json", origin:"*", generator:"search",
    gsrsearch:query, gsrnamespace:"0", gsrlimit:"1",
    prop:"pageimages|coordinates", piprop:"thumbnail", pithumbsize:"720", colimit:"1"
  });

  let image = cached?.image || "";
  let city = "";
  try {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
    if (!response.ok) throw new Error("Wikipedia lookup failed");
    const json = await response.json();
    const page = Object.values(json.query?.pages || {})[0];
    image = image || page?.thumbnail?.source || "";
    const coord = page?.coordinates?.[0];
    if (coord) city = await nearestSettlement(coord.lat, coord.lon);
  } catch (error) {
    console.warn("Gateway city lookup:", query, error);
  }

  if (!image) image = await fetchCommonsImage(query);
  if (isCountryLikeGateway(city, p.country)) city = "";
  const result = {image, city: city || "Nearest city unavailable"};
  mediaCache[p.rank] = result;
  saveMediaCache();
  return result;
};

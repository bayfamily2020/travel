// Travel rank labels override.

const travelDiagnoses = {
  "工位钉子户":"世界很大，但你的活动半径主要取决于午休有多久。",
  "家养牛马":"具备远行能力，目前仍处于稳定圈养状态。",
  "井底观察员":"面对四壁，我在暗中观察。",
  "探头土拨鼠":"已出现明显出门欲望，建议老板提高警惕。",
  "年假特种兵":"擅长把5天年假使用出15天的效果。",
  "出逃的羊驼":"圈养失败，已开始周期性离家出走。",
  "奔跑的走地鸡":"飞得还不算远，但已经明显不愿意在家待着。",
  "护照比脸沧桑":"护照老化速度已经超过本人。",
  "人形登机牌":"机场广播对你的熟悉程度正在超过邻居。",
  "祖国偶尔拥有我":"户籍所在地明确，实际出没地点比较随机。",
  "跨国流窜犯":"活动范围已突破国界，朋友圈定位具有较强迷惑性。",
  "漂流的海龟":"有明确的家，但主要用途是回来换行李。",
  "地球街溜子":"已把地球逛出了小区遛弯的感觉。",
  "人形行李箱":"人与行李已形成长期稳定的共生关系。",
  "环球达人":"普通旅游建议已基本失效，请自行打开世界地图找漏网之鱼。",
  "伊本·白图泰":"现代交通工具显著放大了你的活动范围。古人看了会沉默。",
  "洄游的灰鲸":"全球大范围迁徙已成习性，回家属于季节性行为。",
  "外星人卧底":"是外星人派来侦查地球的，鉴定完毕。"
};

function travelDiagnosis(level){
  return travelDiagnoses[level] || "以上诊断仅供娱乐，如有不服，建议继续买机票。";
}

// Add the diagnosis to the share card without disturbing the existing card layout.
const baseDrawShareCard = drawShareCard;
drawShareCard = async function(score,max,progress,level){
  await baseDrawShareCard(score,max,progress,level);
  const canvas=$("share-card");
  if(!canvas)return;
  const ctx=canvas.getContext("2d");
  const text=travelDiagnosis(level);
  const centerX=540;
  const maxWidth=330;
  ctx.textAlign="center";
  ctx.fillStyle="#ff9a69";
  ctx.font='700 20px "Microsoft YaHei",sans-serif';
  ctx.fillText("旅行诊断",centerX,512);
  ctx.fillStyle="#d7e1d9";
  ctx.font='20px "Microsoft YaHei",sans-serif';
  const chars=Array.from(text);
  const lines=[];
  let line="";
  chars.forEach(ch=>{
    const test=line+ch;
    if(ctx.measureText(test).width>maxWidth && line){lines.push(line);line=ch;}else{line=test;}
  });
  if(line)lines.push(line);
  lines.slice(0,3).forEach((l,i)=>ctx.fillText(l,centerX,548+i*30));
  ctx.textAlign="left";
};

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
    [16, "护照比脸沧桑"],
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

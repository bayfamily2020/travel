const STORAGE_KEY = "world-travel-500-progress-v1";
const $ = (id) => document.getElementById(id);
let places = [];
let visited = new Set();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"})[c]);
}

const featuredMedia = {
  1:{city:"Siem Reap",file:"Angkor Vat (6931599619).jpg"},
  2:{city:"Cairns",file:"Amazing Great Barrier Reef 1.jpg"},
  3:{city:"Cusco",file:"Peru Machu Picchu Sunrise.jpg"},
  4:{city:"Beijing",file:"Great wall panorama.jpg"},
  5:{city:"Agra",file:"Taj Mahal Front.JPG"},
  6:{city:"Flagstaff",file:"Grand Canyon view from Pima Point 2010.jpg"},
  7:{city:"Rome",file:"Colosseum Rome.jpg"},
  8:{city:"Puerto Iguazú",file:"Iguazu Falls Panorama 2009.jpg"},
  9:{city:"Granada",file:"Alhambra - Granada.jpg"},
  10:{city:"Istanbul",file:"Hagia Sophia Mars 2013.jpg"}
};

function mediaFor(p) {
  const media = featuredMedia[p.rank];
  if (!media) return null;
  return {
    city: media.city,
    image: `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(media.file)}?width=720`
  };
}

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited])); }

function descriptionFor(p) {
  const featured = {
    1:"高棉王朝留下的宏伟寺庙群，以日出塔影、回廊浮雕和丛林古迹闻名。",
    2:"世界最大的珊瑚礁生态系统，潜入海中可见绚丽珊瑚、海龟与热带鱼群。",
    3:"隐在安第斯山巅的印加古城，云雾、梯田与严丝合缝的石墙令人惊叹。",
    4:"横跨中国北方的古代防御体系，沿山脊起伏，凝聚两千多年的工程智慧。",
    5:"莫卧儿皇帝为爱妻修建的白色大理石陵墓，晨昏光线会改变它的色泽。",
    6:"科罗拉多河亿万年切割出的巨型峡谷，层层岩壁如同一部地球历史书。",
    7:"古罗马最具代表性的竞技场，拱券结构与地下通道仍诉说帝国时代盛况。",
    8:"横跨阿根廷与巴西的庞大瀑布群，站在“魔鬼咽喉”前可感受雷鸣般水势。",
    9:"摩尔王朝留下的宫殿城堡，繁复雕刻、静谧庭院与流水展现伊斯兰美学。",
    10:"跨越拜占庭与奥斯曼时代的建筑奇迹，巨型穹顶、马赛克和宣礼塔同框。"
  };
  if (featured[p.rank]) return featured[p.rank];

  const name = String(p.name || "").split(" (")[0];
  const country = String(p.country || "").split(" (")[0];

  if (p.group === "节日庆典") return `${p.type}；现场的服饰、音乐与仪式，是理解当地文化最鲜活的方式。`;
  if (p.group === "徒步与朝圣") return `${p.type}；用双脚穿越地貌与村落，沿途风景往往比终点更令人难忘。`;
  if (p.group === "特色体验") return `${p.type}；它把自然、生活方式与在地文化浓缩成一次难以复制的经历。`;

  const rules = [
    [/瀑布/, `${name}以磅礴水势和层叠水幕著称，丰水期的轰鸣与水雾尤其震撼。`],
    [/峡谷/, `${name}由漫长地质作用塑造，峭壁、岩层与光影展现大自然的时间尺度。`],
    [/火山|火口|熔岩/, `${name}保存着鲜明的火山地貌，可近距离观察熔岩、火口与地球内部力量留下的痕迹。`],
    [/冰川|冰原|冰洞/, `${name}展现冰川侵蚀与流动形成的蓝冰世界，裂隙、冰壁和寒地景观极具冲击力。`],
    [/沙漠|沙丘/, `${name}以辽阔沙海和流动沙丘闻名，日出日落时的色彩与线条最具魅力。`],
    [/梯田/, `${name}顺山势层层铺展，既是农业智慧的结晶，也呈现四季变化的壮观大地纹理。`],
    [/湖|泻湖/, `${name}以开阔水面和周围地貌相映成景，天气与光线会赋予湖水不同色彩。`],
    [/珊瑚|礁/, `${name}拥有丰富的珊瑚生态与海洋生物，是浮潜、潜水和理解海洋生态的理想地点。`],
    [/岛|群岛|海岸|海滩|海湾/, `${name}融合海岸地貌、海洋生态与岛屿文化，适合放慢脚步深入探索。`],
    [/山|峰|高地|山脉/, `${name}以鲜明山势和开阔视野吸引旅行者，沿途还能观察海拔变化带来的生态差异。`],
    [/洞|洞窟|溶洞/, `${name}记录水、岩石与时间共同雕刻的地下世界，洞内结构与光影充满神秘感。`],
    [/森林|雨林|丛林/, `${name}保存着多层次森林生态，茂密植被、鸟兽与湿润气息构成沉浸式自然体验。`],
    [/国家公园|保护区|野生动物/, `${name}保护着${country}重要的自然生态，是观察地貌、植物与野生动物的代表区域。`],
    [/古城|遗址|废墟|考古/, `${name}保存着城市格局与文明遗迹，行走其间可以触摸当地历史最真实的层次。`],
    [/城堡|宫|堡垒|要塞/, `${name}将权力、战争与建筑艺术凝结在一起，内部空间和制高点景观同样值得细看。`],
    [/寺|教堂|清真寺|神社|佛|修道院/, `${name}融合信仰、历史与建筑艺术，细部装饰和仪式空间体现当地精神传统。`],
    [/博物馆|美术馆|纪念馆|纪念碑/, `${name}以展品、艺术或历史现场串联当地记忆，适合在短时间内读懂一座城市。`],
    [/市场|集市|老街|街区|广场/, `${name}汇集建筑、饮食与市井生活，是观察当地日常文化和城市节奏的窗口。`],
    [/铁路|火车|列车/, `${name}不仅连接目的地，本身也是旅程亮点，沿途地貌与人文景观不断变化。`],
    [/桥|塔|摩天楼/, `${name}以鲜明轮廓和工程设计成为城市象征，登高或远眺能获得经典视角。`]
  ];
  const matched = rules.find(([pattern]) => pattern.test(name));
  if (matched) return matched[1];

  const descriptions = {
    "自然景观":`${name}浓缩了${country}独特的地貌与自然气候，最适合在光线变化中慢慢欣赏。`,
    "自然保护地":`${name}守护着珍贵生态系统，可在相对原始的环境中观察当地动植物与自然演化。`,
    "历史遗产":`${name}见证当地重要历史阶段，建筑细节和空间格局仍保留着时代留下的密码。`,
    "宗教建筑":`${name}不仅是信仰场所，也是一部立体的建筑史，艺术细节与仪式氛围值得品味。`,
    "博物馆/纪念地":`${name}通过实物、艺术与故事呈现当地历史，是深入理解目的地的重要一站。`,
    "城市街区":`${name}把建筑、街巷和日常生活融为一体，步行探索最能发现城市真实气质。`,
    "地标/特色体验":`${name}集中体现${country}鲜明的地域特色，是认识当地风景与文化的经典入口。`
  };
  return descriptions[p.type] || `${name}兼具风景、文化与在地故事，是值得留出时间深入体验的一站。`;
}

function updateSummary() {
  const score = places.reduce((sum, p) => sum + (visited.has(p.rank) ? p.points : 0), 0);
  const max = places.reduce((sum, p) => sum + p.points, 0);
  const progress = max ? Math.round(score / max * 1000) / 10 : 0;
  $("count").textContent = visited.size;
  $("score").textContent = score;
  $("max-score").textContent = `/ ${max} 得分`;
  $("progress").textContent = `${progress}%`;
  $("progress-bar").style.width = `${progress}%`;
  const levels = [[5,"井底观察员"],[15,"驿站菜鸟"],[30,"奔跑的走地鸡"],[50,"漂流的海龟"],[70,"环球达人"],[90,"断腿旅行侠"]];
  $("level").textContent = progress >= 90 ? "外星人探针" : levels.find(([limit]) => progress < limit)[1];
}

function render() {
  const q = $("query").value.trim().toLowerCase();
  const continent = $("continent").value, group = $("group").value;
  const fame = $("fame").value, status = $("status").value, sort = $("sort").value;
  const filtered = places.filter(p => {
    const done = visited.has(p.rank);
    const haystack = `${p.name} ${p.country} ${p.type} ${p.group} ${descriptionFor(p)}`.toLowerCase();
    return (!q || haystack.includes(q)) && (continent === "全部" || p.continent === continent) && (group === "全部类型" || p.group === group) && (fame === "全部" || p.fame.startsWith(fame)) && (status === "全部" || (status === "已去" ? done : !done));
  }).sort((a,b) => sort === "points" ? b.points-a.points || a.rank-b.rank : sort === "country" ? a.country.localeCompare(b.country,"zh-CN") : a.rank-b.rank);
  $("shown").textContent = filtered.length;
  $("empty").hidden = filtered.length !== 0;
  $("grid").innerHTML = filtered.map(p => {
    const done = visited.has(p.rank);
    const media = mediaFor(p);
    return `<button class="place-card ${done ? "done" : ""} ${media ? "with-image" : ""}" data-rank="${p.rank}" aria-pressed="${done}">${media ? `<span class="image-wrap"><img class="place-image" src="${escapeHtml(media.image)}" alt="${escapeHtml(p.name)}" loading="lazy" decoding="async"><span class="image-credit">Wikimedia Commons</span></span>` : ""}<span class="rank">#${String(p.rank).padStart(3,"0")}</span><span class="points p${p.points}">${p.points} 分</span><span class="check" aria-hidden="true">${done ? "✓" : ""}</span><span class="place-name">${escapeHtml(p.name)}</span><span class="meta"><b>${escapeHtml(p.continent)}</b> · ${escapeHtml(p.country)}</span>${media ? `<span class="gateway"><b>Gateway city</b> · ${escapeHtml(media.city)}</span>` : ""}<span class="description">${escapeHtml(descriptionFor(p))}</span><span class="type">${escapeHtml(p.group)} · ${escapeHtml(p.type)}</span>${p.evidence ? '<span class="evidence">已有旅行记录</span>' : ""}</button>`;
  }).join("");
  updateSummary();
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const chunks = await Promise.all(Array.from({length:13}, (_,i) => fetch(`./data-${i}.json`).then(r => r.json())));
    places = chunks.flat();
    const base = places.slice(0, 500);
    const saved = localStorage.getItem(STORAGE_KEY);
    visited = new Set(saved ? JSON.parse(saved) : base.filter(p => p.visited).map(p => p.rank));
    document.querySelectorAll("input,select").forEach(el => el.addEventListener("input", render));
    $("grid").addEventListener("click", e => { const card=e.target.closest("[data-rank]"); if(!card)return; const rank=Number(card.dataset.rank); visited.has(rank)?visited.delete(rank):visited.add(rank); save(); render(); });
    $("reset").addEventListener("click", () => { if(confirm("确定要清空这个浏览器里的全部打卡记录吗？")){visited.clear();save();render();} });
    render();
  } catch (error) {
    $("grid").innerHTML = '<div class="empty">数据加载失败，请刷新页面重试。</div>';
    console.error(error);
  }
});

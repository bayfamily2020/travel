const STORAGE_KEY = "world-travel-500-progress-v1";
const $ = (id) => document.getElementById(id);
let places = [];
let visited = new Set();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"})[c]);
}

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited])); }

function descriptionFor(p) {
  const featured = {
    1:"高棉王朝留下的宏伟寺庙群，以日出塔影和精美浮雕闻名。",
    2:"世界最大的珊瑚礁生态系统，是潜水观赏珊瑚与海洋生物的胜地。",
    3:"隐藏在安第斯山巅的印加古城，云雾、梯田与石墙交相辉映。",
    4:"横跨中国北方的古代防御工程，也是人类建筑史上的宏大奇迹。",
    5:"莫卧儿皇帝为爱妻修建的白色大理石陵墓，被誉为永恒爱情的象征。",
    6:"科罗拉多河亿万年切割出的巨型峡谷，岩层记录着漫长的地质历史。",
    7:"古罗马最具代表性的竞技场，曾举办角斗、表演与大型公共活动。",
    8:"横跨阿根廷与巴西的庞大瀑布群，以“魔鬼咽喉”最为震撼。",
    9:"摩尔王朝留下的宫殿与城堡，以繁复雕刻、庭院和水景著称。",
    10:"融合拜占庭教堂与奥斯曼清真寺历史，以宏伟穹顶和马赛克闻名。"
  };
  if (featured[p.rank]) return featured[p.rank];
  if (p.group && p.group !== "地点与景观") return `${p.type}，展现当地独特的文化与旅行魅力。`;
  const country = String(p.country || "").split(" (")[0];
  const descriptions = {
    "自然景观":`以独特的自然风貌与壮丽景色闻名，是感受${country}山水魅力的代表地点。`,
    "自然保护地":`保存着珍贵的自然生态与野生环境，适合深入体验${country}的自然之美。`,
    "历史遗产":`承载当地历史与建筑记忆，是了解${country}文化变迁的重要遗产。`,
    "宗教建筑":`融合宗教传统、建筑艺术与历史故事，是当地重要的人文地标。`,
    "博物馆/纪念地":`通过珍贵展品与历史记录，呈现当地文化、艺术和时代记忆。`,
    "城市街区":`汇集街巷、建筑与日常生活，是体验当地城市气质的理想去处。`,
    "地标/特色体验":`具有鲜明的地域特色，是认识${country}风景与文化的代表性体验。`
  };
  return descriptions[p.type] || `展现${country}独特的风景与文化，是值得亲身体验的一站。`;
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
    return `<button class="place-card ${done ? "done" : ""}" data-rank="${p.rank}" aria-pressed="${done}"><span class="rank">#${String(p.rank).padStart(3,"0")}</span><span class="points p${p.points}">${p.points} 分</span><span class="check" aria-hidden="true">${done ? "✓" : ""}</span><span class="place-name">${escapeHtml(p.name)}</span><span class="meta"><b>${escapeHtml(p.continent)}</b> · ${escapeHtml(p.country)}</span><span class="description">${escapeHtml(descriptionFor(p))}</span><span class="type">${escapeHtml(p.group)} · ${escapeHtml(p.type)}</span>${p.evidence ? '<span class="evidence">已有旅行记录</span>' : ""}</button>`;
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

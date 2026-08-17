const STORAGE_KEY = "world-travel-500-progress-v1";
const $ = (id) => document.getElementById(id);
let places = [];
let visited = new Set();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;","'":"&#39;"})[c]);
}

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify([...visited])); }

function updateSummary() {
  const score = places.reduce((sum, p) => sum + (visited.has(p.rank) ? p.points : 0), 0);
  const max = places.reduce((sum, p) => sum + p.points, 0);
  const progress = max ? Math.round(score / max * 1000) / 10 : 0;
  $("count").textContent = visited.size;
  $("score").textContent = score;
  $("max-score").textContent = `/ ${max} 得分`;
  $("progress").textContent = `${progress}%`;
  $("progress-bar").style.width = `${progress}%`;
  const levels = [[5,"井底观察员"],[15,"驿站菜鸟"],[30,"周末浪客"],[50,"空中飞人"],[70,"环球达人"],[101,"断腿级行者"]];
  $("level").textContent = levels.find(([limit]) => progress < limit)[1];
}

function render() {
  const q = $("query").value.trim().toLowerCase();
  const continent = $("continent").value, group = $("group").value;
  const fame = $("fame").value, status = $("status").value, sort = $("sort").value;
  const filtered = places.filter(p => {
    const done = visited.has(p.rank);
    const haystack = `${p.name} ${p.country} ${p.type} ${p.group}`.toLowerCase();
    return (!q || haystack.includes(q)) && (continent === "全部" || p.continent === continent) && (group === "全部类型" || p.group === group) && (fame === "全部" || p.fame.startsWith(fame)) && (status === "全部" || (status === "已去" ? done : !done));
  }).sort((a,b) => sort === "points" ? b.points-a.points || a.rank-b.rank : sort === "country" ? a.country.localeCompare(b.country,"zh-CN") : a.rank-b.rank);
  $("shown").textContent = filtered.length;
  $("empty").hidden = filtered.length !== 0;
  $("grid").innerHTML = filtered.map(p => {
    const done = visited.has(p.rank);
    return `<button class="place-card ${done ? "done" : ""}" data-rank="${p.rank}" aria-pressed="${done}"><span class="rank">#${String(p.rank).padStart(3,"0")}</span><span class="points p${p.points}">${p.points} 分</span><span class="check" aria-hidden="true">${done ? "✓" : ""}</span><span class="place-name">${escapeHtml(p.name)}</span><span class="meta"><b>${escapeHtml(p.continent)}</b> · ${escapeHtml(p.country)}</span><span class="type">${escapeHtml(p.group)} · ${escapeHtml(p.type)}</span>${p.evidence ? '<span class="evidence">已有旅行记录</span>' : ""}</button>`;
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

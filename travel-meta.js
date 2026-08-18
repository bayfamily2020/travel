// Concise destination highlights + best-month indexing.
// Loaded after app.js and rank-override.js so these functions override the generic card copy.

const MONTH_NAMES = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

const destinationHighlights = {
  1:"世界最大的宗教建筑群之一",
  2:"地球最大的珊瑚礁系统",
  3:"云端之上的印加失落之城",
  4:"世界最长的古代防御工程",
  5:"世界最著名的爱情纪念建筑",
  6:"地球最壮观的峡谷之一",
  7:"古罗马帝国最经典的竞技场",
  8:"世界最宽阔的瀑布群之一",
  9:"欧洲最精美的摩尔宫殿之一",
  10:"一座跨越两大帝国的穹顶奇迹",
  11:"世界最大中世纪老城之一",
  12:"大洋路最标志性的海蚀柱群",
  13:"岩壁中凿出的玫瑰古城",
  14:"玛雅文明最震撼的丛林古城之一",
  15:"世界最重要的综合博物馆之一",
  16:"高迪未完成的世纪杰作",
  17:"新西兰最震撼的峡湾荒野",
  18:"爱琴海最经典的火山悬崖岛",
  19:"达尔文进化论灵感之岛",
  20:"世界最叛逆的当代艺术博物馆之一",
  21:"花岗岩巨壁与瀑布的天堂",
  22:"《权力的游戏》“君临城”取景地",
  23:"地球最大的盐沼",
  24:"万座佛塔铺满平原的古都",
  25:"唯一仍存的古代世界七大奇迹",
  26:"世界最著名的水上城市广场之一",
  27:"世界最大瀑布水幕之一",
  28:"西方古典文明最具象征性的山丘",
  29:"欧洲宫廷奢华的巅峰样本",
  30:"世界最著名的露天市集广场之一",
  31:"东南亚最有烟火气的老城街区之一",
  32:"塔斯马尼亚最经典的高山荒野",
  33:"世界最大的单体岩石地标之一",
  34:"欧洲最美的中世纪石桥之一",
  35:"金色海湾与海岸步道的代表",
  36:"英国最经典的湖山风景",
  37:"世界参观人数最多的博物馆之一",
  38:"巴塔哥尼亚最标志性的角峰群",
  39:"世界最深、蓄水量最大的淡水湖",
  40:"世界最具辨识度的铁塔",
  41:"被火山瞬间封存的古罗马城市",
  42:"美洲保存最完整的殖民老城之一",
  43:"世界最有辨识度的桌状山之一",
  44:"布拉格最完整的中世纪城市舞台",
  45:"地球最著名的动物大迁徙舞台",
  55:"哥特式建筑最经典的城市地标之一",
  64:"苏格兰天空岛最上镜的岩峰",
  77:"地球最高树种的原生森林",
  84:"美国西部电影最经典的荒漠地貌",
  97:"二战太平洋战争的关键历史现场",
  114:"泰国最重要的古都遗址之一",
  115:"米开朗基罗最震撼的穹顶壁画空间",
  117:"世界最著名的城市天际线之一",
  125:"新西兰最南端的荒野岛屿",
  148:"世界最大的古代石刻弥勒佛",
  155:"全球最具影响力的主题乐园之一",
  173:"西非奴隶贸易历史最重要遗址之一",
  177:"落基山脉最经典的高山国家公园之一",
  190:"梵高作品收藏最集中的博物馆",
  195:"世界最紧张的边境参观地之一",
  208:"世界最著名的霓虹十字路口之一",
  209:"菲律宾最梦幻的石灰岩泻湖群",
  210:"曼德拉被囚18年的政治监狱岛",
  217:"中国最经典的城市山水名片之一",
  221:"现代德国政治最具象征性的建筑",
  238:"古埃及神庙最密集的城市之一",
  239:"世界最重要的自然史博物馆之一",
  240:"印度最密集、最混沌也最鲜活的老城",
  248:"世界顶级粉雪目的地之一",
  255:"欧洲保存最完整的骑士古城之一",
  275:"日本最古老的原始杉树林之一",
  278:"北美最炎热、最低洼的荒漠盆地",
  284:"南太平洋软珊瑚潜水天堂",
  290:"地球上最像外星世界的岛屿之一",
  295:"地球陆地最低点",
  312:"曾经的世界最高双子塔",
  323:"美国东岸最经典的沙丘海岸之一",
  324:"世界最大的淡水湖岛之一",
  330:"世界最亮的生物荧光海湾之一",
  331:"《阿凡达》式石英砂岩峰林",
  350:"南太平洋最经典的心形泻湖岛之一",
  351:"冰岛最上镜的“草帽山”",
  364:"美国最经典的山地景观公路之一",
  368:"加勒比保存最好的珊瑚环礁之一",
  397:"中国古代艺术收藏最顶级博物馆之一",
  421:"世界最华丽的城市公墓之一",
  431:"欧洲最早的露天生活史博物馆之一",
  446:"巴尔干最壮观的山谷修道院之一",
  448:"曾经的世界最高摩天楼",
  452:"东正教洞窟修道院群的代表",
  460:"全球最活跃的火山之一",
  476:"世界最梦幻的天然海水天坑之一",
  490:"玄武岩海蚀洞的世界级奇观",
  491:"世界最著名的倾斜建筑",
  492:"摩尔多瓦最具代表性的岩洞修道院景观",
  493:"世界最传奇的海洋博物馆之一",
  494:"北欧最具辨识度的当代建筑之一",
  495:"被沙漠吞没的钻石鬼城",
  504:"美国规模最大的狂欢节之一",
  508:"世界最疯狂的彩色节日之一",
  514:"中国山水画式花岗岩峰林代表",
  515:"“桂林山水甲天下”的现实版本",
  516:"长江三峡最雄伟的峡口之一",
  518:"京都千年祇园祭的山鉾巡行",
  524:"全球最壮观的万人天灯场景之一",
  533:"世界最著名的番茄大战",
  544:"欧洲最大街头狂欢节之一",
  556:"西非伏都教最重要的年度庆典之一",
  560:"全球规模最大的热气球节之一",
  566:"日本最经典的古道朝圣路线",
  568:"佩特拉最震撼的高地徒步路线之一",
  569:"地中海最经典的长距离海岸徒步之一",
  570:"古罗马城市遗址保存最完整者之一",
  581:"安第斯高海拔彩色湖泊徒步代表",
  583:"百内最经典的W线核心山谷",
  584:"直面格雷冰川的巴塔哥尼亚步道",
  585:"菲茨罗伊山最经典的终点景观",
  588:"世界最大的休眠火山之一",
  593:"夏威夷最壮观的原始海岸线",
  597:"欧洲最硬核的长距离山地徒步之一",
  601:"葡萄牙最美的悬崖海岸徒步之一",
  602:"巴尔干最经典的高山穿越之一",
  610:"世界最经典的一日火山穿越之一",
  615:"二战最艰苦的丛林战役路线之一",
  622:"火山湖上空追极光的经典地点",
  623:"拉普兰最经典的驯鹿与极光目的地",
  627:"全球最著名的日出热气球目的地之一",
  630:"日本茶道美学最经典的旅行体验之一",
  643:"巴塔哥尼亚最有代表性的牧场文化体验",
  644:"南美最著名的高海拔葡萄酒产区之一",
  645:"美国公路文化最传奇的母亲之路",
  646:"加州最经典的悬崖海岸公路",
  649:"世界最大盐沼的星空镜面",
  650:"世界最著名的棕熊捕鱼观景地之一"
};

function shortPlaceName(p) {
  return String(p.name || "").replace(/\s*\([^)]*\)\s*$/, "").replace(/^\d+[.、]\s*/, "").trim();
}

function descriptionFor(p) {
  if (destinationHighlights[p.rank]) return destinationHighlights[p.rank];
  const group = String(p.group || "");
  const type = String(p.type || "");
  if (group.includes("节日") || /节|Festival|Carnival|庆典/i.test(p.name)) return "当地一年中最值得专程赶来的高光时刻";
  if (group.includes("徒步") || /徒步|Trail|Trek|Hike|Way|Camino/i.test(p.name)) return "当地最值得用双脚抵达的风景之一";
  if (group.includes("特色体验")) return "这里最具代表性的在地旅行体验之一";
  if (type.includes("自然保护")) return "当地最具代表性的原始自然保护地之一";
  if (type.includes("自然景观")) return "当地辨识度最高的自然奇观之一";
  if (type.includes("历史")) return "当地最具代表性的历史地标之一";
  if (type.includes("宗教")) return "当地最具代表性的宗教建筑之一";
  if (type.includes("博物馆")) return "当地最值得看的收藏与历史现场之一";
  if (type.includes("城市街区")) return "当地最值得步行探索的城市片区之一";
  return "当地最具辨识度的旅行地标之一";
}

const bestMonthOverrides = {
  607:[9,10],
  294:[1,2,3],
  189:[6,7,8,9,10],
  582:[4,5,6],
  574:[12,1,2,3,4],
  610:[5,6,7,8,9,10], 611:[11,12,1,2,3,4],
  600:[7,8,9,10],
  1:[11,12,1,2], 2:[6,7,8,9,10], 3:[5,6,7,8,9], 4:[4,5,9,10], 5:[10,11,12,1,2,3],
  6:[4,5,9,10], 7:[4,5,9,10], 8:[3,4,8,9,10], 9:[3,4,5,9,10], 10:[4,5,9,10],
  12:[11,12,1,2,3], 13:[3,4,5,10,11], 14:[11,12,1,2,3,4], 17:[12,1,2,3], 18:[5,6,9,10],
  19:[6,7,8,9,10,11], 21:[5,6,9,10], 22:[5,6,9,10], 23:[2,3,4], 24:[11,12,1,2],
  25:[10,11,12,1,2,3], 27:[5,6,7,8,9], 32:[12,1,2,3], 33:[5,6,7,8,9], 35:[12,1,2,3],
  36:[5,6,7,8,9], 38:[11,12,1,2,3], 39:[2,3,7,8], 41:[4,5,9,10], 43:[11,12,1,2,3],
  45:[6,7,8,9,10], 64:[5,6,7,8,9], 77:[5,6,7,8,9,10], 84:[4,5,9,10], 97:[1,2,3,4,11,12],
  125:[12,1,2,3], 155:[1,2,3,4,11,12], 177:[6,7,8,9], 209:[12,1,2,3,4,5], 210:[11,12,1,2,3],
  238:[10,11,12,1,2,3], 248:[1,2], 255:[5,6,9,10], 275:[4,5,10,11], 278:[11,12,1,2,3],
  284:[5,6,7,8,9,10], 290:[10,11,12,1,2,3], 295:[10,11,12,1,2,3,4], 323:[6,7,8,9], 324:[12,1,2,3,4],
  330:[12,1,2,3,4], 331:[4,5,9,10,11], 350:[5,6,7,8,9,10], 351:[5,6,7,8,9], 368:[2,3,4,5,6],
  421:[3,4,10,11], 448:[10,11,12,1,2,3], 460:[5,6,7,8,9,10], 476:[5,6,7,8,9,10], 495:[5,6,7,8,9],
  504:[2], 508:[3], 514:[4,5,9,10,11], 515:[4,5,9,10,11], 516:[4,5,9,10], 518:[7], 524:[11], 533:[8], 544:[2],
  556:[1], 560:[10], 566:[4,5,10,11], 568:[3,4,5,10,11], 569:[4,5,9,10], 581:[5,6,7,8,9], 583:[12,1,2,3],
  584:[6,7], 585:[12,1,2,3], 588:[4,5,9,10], 593:[5,6,7,8,9], 597:[6,7,8,9], 601:[4,5,9,10],
  602:[6,7,8,9], 610:[11,12,1,2,3,4], 615:[5,6,7,8,9,10], 622:[9,10,2,3], 623:[12,1,2,3], 627:[4,5,9,10],
  643:[11,12,1,2,3], 644:[3,4,10,11], 645:[5,6,9,10], 646:[4,5,9,10], 649:[5,6,7,8,9,10], 650:[7,8,9]
};

function countryText(p){ return String(p.country || "").toLowerCase(); }
function bestMonthsFor(p) {
  if (bestMonthOverrides[p.rank]) return bestMonthOverrides[p.rank];
  const c = countryText(p);
  const n = String(p.name || "").toLowerCase();
  if (/antarctica|南极/.test(c+n)) return [11,12,1,2,3];
  if (/iceland|finland|norway|sweden|greenland|冰岛|芬兰|挪威|瑞典|格陵兰/.test(c)) return [5,6,7,8,9];
  if (/new zealand|australia|tasmania|新西兰|澳大利亚/.test(c)) return [11,12,1,2,3];
  if (/chile|argentina|智利|阿根廷/.test(c)) return [11,12,1,2,3];
  if (/peru|bolivia|秘鲁|玻利维亚/.test(c)) return [5,6,7,8,9];
  if (/ecuador|galapagos|厄瓜多尔/.test(c)) return [6,7,8,9,10,11];
  if (/costa rica|belize|mexico|guatemala|caribbean|cuba|jamaica|bahamas|波多黎各|古巴|墨西哥|危地马拉|伯利兹/.test(c)) return [12,1,2,3,4];
  if (/thailand|vietnam|cambodia|laos|myanmar|burma|philippines|泰国|越南|柬埔寨|老挝|缅甸|菲律宾/.test(c)) return [11,12,1,2,3];
  if (/indonesia|malaysia|singapore|印度尼西亚|马来西亚|新加坡/.test(c)) return [5,6,7,8,9];
  if (/india|nepal|bhutan|印度|尼泊尔|不丹/.test(c)) return [10,11,12,1,2,3];
  if (/japan|korea|日本|韩国/.test(c)) return [3,4,5,10,11];
  if (/china|中国/.test(c)) return [4,5,9,10];
  if (/jordan|israel|egypt|oman|uae|qatar|saudi|约旦|以色列|埃及|阿曼|阿联酋|卡塔尔|沙特/.test(c)) return [10,11,12,1,2,3,4];
  if (/morocco|摩洛哥/.test(c)) return [3,4,5,9,10,11];
  if (/tanzania|kenya|botswana|namibia|zambia|zimbabwe|south africa|坦桑尼亚|肯尼亚|博茨瓦纳|纳米比亚|赞比亚|津巴布韦|南非/.test(c)) return [6,7,8,9,10];
  if (/united states|usa|canada|美国|加拿大/.test(c)) return [5,6,9,10];
  if (/greece|italy|spain|portugal|france|croatia|montenegro|turkey|希腊|意大利|西班牙|葡萄牙|法国|克罗地亚|黑山|土耳其/.test(c)) return [4,5,6,9,10];
  if (/england|scotland|ireland|uk|united kingdom|iceland|英格兰|苏格兰|爱尔兰|英国/.test(c)) return [5,6,7,8,9];
  if (/russia|俄罗斯/.test(c)) return [5,6,7,8,9];
  if (p.continent === "欧洲") return [4,5,6,9,10];
  if (p.continent === "亚洲") return [10,11,12,1,2,3];
  if (p.continent === "非洲") return [6,7,8,9,10];
  if (p.continent === "大洋洲") return [11,12,1,2,3];
  if (p.continent === "美洲") return [5,6,9,10];
  return [4,5,9,10];
}

function bestMonthsLabel(p){
  const months = bestMonthsFor(p);
  return months.map(m => `${m}月`).join(" · ");
}

function ensureMonthFilter(){
  if ($("month")) return;
  const filters = document.querySelector(".filters");
  if (!filters) return;
  const select = document.createElement("select");
  select.id = "month";
  select.setAttribute("aria-label","按最佳访问月份筛选");
  select.innerHTML = `<option value="all">最佳月份：全部</option>${MONTH_NAMES.map((label,i)=>`<option value="${i+1}">${label} 最佳</option>`).join("")}`;
  filters.appendChild(select);
  select.addEventListener("input",()=>{ currentPage = 1; render(); });
}

const monthStyle = document.createElement("style");
monthStyle.textContent = `.best-months{display:block;margin-top:7px;font-size:12px;line-height:1.35;color:#7b5a40;font-weight:700;letter-spacing:.02em}.best-months b{color:#173b31}.place-card .description{font-size:13px;line-height:1.4;margin-top:8px}`;
document.head.appendChild(monthStyle);

render = function() {
  ensureMonthFilter();
  const q = $("query").value.trim().toLowerCase();
  const continent = $("continent").value, group = $("group").value;
  const fame = $("fame").value, status = $("status").value, sort = $("sort").value;
  const month = $("month")?.value || "all";
  const filtered = places.filter(p => {
    const done = visited.has(p.rank);
    const highlight = descriptionFor(p);
    const months = bestMonthsFor(p);
    const haystack = `${p.name} ${p.country} ${p.type} ${p.group} ${highlight} ${bestMonthsLabel(p)}`.toLowerCase();
    return (!q || haystack.includes(q)) &&
      (continent === "全部" || p.continent === continent) &&
      (group === "全部类型" || p.group === group) &&
      (fame === "全部" || p.fame.startsWith(fame)) &&
      (status === "全部" || (status === "已去" ? done : !done)) &&
      (month === "all" || months.includes(Number(month)));
  }).sort((a,b) => sort === "points" ? b.points-a.points || a.rank-b.rank : sort === "country" ? a.country.localeCompare(b.country,"zh-CN") : a.rank-b.rank);

  renderPagination(filtered.length);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);
  const end = start + pageItems.length;
  $("shown").textContent = filtered.length ? `${start + 1}–${end} / ${filtered.length} 个项目` : "0 个项目";
  $("empty").hidden = filtered.length !== 0;
  $("grid").innerHTML = pageItems.map(p => {
    const done = visited.has(p.rank);
    const media = seededMedia(p);
    const image = media?.image || "";
    const city = media?.city || "Locating…";
    return `<button class="place-card ${done ? "done" : ""} with-image" data-rank="${p.rank}" aria-pressed="${done}"><span class="image-wrap"><img class="place-image" ${image ? `src="${escapeHtml(image)}"` : "hidden"} alt="${escapeHtml(p.name)}" loading="lazy" decoding="async"><span class="image-placeholder" ${image ? "hidden" : ""}>EXPLORE</span><span class="image-credit">Wikimedia Commons</span></span><span class="rank">#${String(p.rank).padStart(3,"0")}</span><span class="points p${p.points}">${p.points} 分</span><span class="check" aria-hidden="true">${done ? "✓" : ""}</span><span class="place-name">${escapeHtml(p.name)}</span><span class="meta"><b>${escapeHtml(p.continent)}</b> · ${escapeHtml(p.country)}</span><span class="gateway"><b>Gateway city</b> · <span class="gateway-city">${escapeHtml(city)}</span></span><span class="description">${escapeHtml(descriptionFor(p))}</span><span class="best-months"><b>最佳月份</b> · ${escapeHtml(bestMonthsLabel(p))}</span><span class="type">${escapeHtml(p.group)} · ${escapeHtml(p.type)}</span>${p.evidence ? '<span class="evidence">已有旅行记录</span>' : ""}</button>`;
  }).join("");
  hydrateVisibleMedia();
  updateSummary();
};

document.addEventListener("DOMContentLoaded", ensureMonthFilter);

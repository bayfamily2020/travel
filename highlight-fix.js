// Remove low-information generic blurbs. Keep curated highlights when present;
// otherwise derive one concise, feature-first line from the destination name/type.
(function(){
  const originalHighlights = (typeof destinationHighlights !== "undefined") ? destinationHighlights : {};

  function fixFilterLabels(){
    const labels = {group:"类型：全部", continent:"洲别：全部", fame:"知名度：全部", status:"状态：全部"};
    Object.entries(labels).forEach(([id,label]) => {
      const select = document.getElementById(id);
      if (select?.options?.length) select.options[0].textContent = label;
    });
  }

  const exact = {
    4:"世界最长的古代防御工程",
    22:"《权力的游戏》“君临城”主要取景地",
    23:"世界最大的盐沼，雨季化身“天空之镜”",
    39:"世界最深、蓄水量最大的淡水湖",
    50:"原爆圆顶馆旁，记录1945年广岛核爆与和平反思",
    148:"世界最大的古代石刻弥勒佛",
    278:"北美最低、最热、最干燥的荒漠盆地",
    295:"地球陆地最低点",
    312:"曾经的世界最高双子塔",
    491:"世界最著名的倾斜钟楼",
    495:"被纳米布沙漠吞没的钻石鬼城",
    645:"美国公路文化最传奇的“母亲之路”"
  };

  function cleanName(p){ return String(p.name || "").replace(/^\d+[.、]\s*/, "").replace(/\s*\([^)]*\)\s*$/, "").trim(); }
  function derivedHighlight(p){
    const n = `${p.name || ""}`.toLowerCase(), type = `${p.type || ""}`, group = `${p.group || ""}`;
    if (/blue hole|蓝洞/.test(n)) return "深蓝色海底竖井，潜水时像直通地心";
    if (/waterfall|falls|瀑布/.test(n)) return "巨量水流从断崖倾泻，是最直接的自然力量现场";
    if (/glacier|冰川/.test(n)) return "蓝色冰体与裂隙近距离展开，能直观看见冰河运动";
    if (/volcano|火山/.test(n)) return "火山口、熔岩地貌与高差共同塑造极强视觉冲击";
    if (/canyon|gorge|峡谷/.test(n)) return "深切岩壁与河谷尺度巨大，地层像被劈开的地球剖面";
    if (/reef|珊瑚礁/.test(n)) return "珊瑚、热带鱼与透明海水构成最密集的海底生态景观";
    if (/cave|洞窟|洞穴/.test(n)) return "岩洞内部以巨大空间、钟乳石或特殊岩层取胜";
    if (/desert|沙漠|dune|沙丘/.test(n)) return "极简沙丘与光影变化，是最纯粹的荒漠景观";
    if (/salt|盐沼|盐湖/.test(n)) return "盐壳延伸到地平线，雨后可形成镜面反射";
    if (/lake|湖/.test(n)) return "湖水、山体与倒影构成最核心的视觉记忆";
    if (/island|isle|岛/.test(n)) return "海岛地貌、海水颜色与隔绝感是这里的核心体验";
    if (/beach|海滩|bay|海湾/.test(n)) return "海岸线、沙色与水色组合成最具记忆点的海景";
    if (/mount|mountain|山|峰/.test(n)) return "山体轮廓本身就是主角，日出日落时最有层次";
    if (/forest|森林|redwood|杉/.test(n)) return "高大古树与林下雾气共同制造强烈原始感";
    if (/national park|国家公园/.test(n)) return "核心看点不是单一地标，而是一整片保存完整的原始景观";
    if (/palace|宫/.test(n)) return "建筑、庭院与装饰细节共同展示权力与审美的巅峰";
    if (/castle|fort|fortress|城堡|要塞/.test(n)) return "城墙与制高点仍保留明显的防御尺度与历史感";
    if (/temple|寺|庙/.test(n)) return "建筑比例、雕刻与宗教空间感是最值得看的部分";
    if (/cathedral|church|教堂|大教堂/.test(n)) return "穹顶、立面与内部光线共同定义这座建筑";
    if (/mosque|清真寺/.test(n)) return "穹顶、宣礼塔与几何装饰形成最鲜明的伊斯兰建筑语言";
    if (/monastery|修道院/.test(n)) return "宗教建筑嵌入山谷或岩壁，孤立感就是最大特色";
    if (/museum|博物馆/.test(n)) return "真正值得看的是馆藏本身，而不是只为建筑打卡";
    if (/old town|old city|古城|老城|medina/.test(n)) return "最适合步行钻进街巷，用建筑、市场与日常生活认识城市";
    if (/square|广场/.test(n)) return "城市最重要的公共舞台，建筑与人群活动都集中在这里";
    if (/bridge|桥/.test(n)) return "桥体本身与两侧城市天际线共同构成经典视角";
    if (/tower|塔/.test(n)) return "以高度、轮廓或结构成为这座城市最直接的视觉符号";
    if (/market|bazaar|市场|市集/.test(n)) return "真正的看点是摊贩、气味、叫卖与本地人的日常交易";
    if (/trail|trek|hike|way|camino|徒步|古道|朝圣/.test(n) || group.includes("徒步")) return "最精彩的部分在路上：连续地貌变化比单一终点更重要";
    if (/festival|carnival|节|庆典|狂欢/.test(n) || group.includes("节日")) return "一年只在固定时段爆发，现场氛围比静态景点更重要";
    if (/wine|葡萄酒|vineyard|酒庄/.test(n)) return "核心体验是产区风土：葡萄园、酒窖与本地品种一起看";
    if (/hot spring|onsen|温泉/.test(n)) return "把当地地热直接变成旅行体验，天气越冷越有感觉";
    if (/safari|迁徙|migration|wildlife/.test(n)) return "动物密度、迁徙或捕食现场才是这里真正的主角";
    if (/aurora|northern lights|极光/.test(n)) return "最大卖点就是低光污染天空下的极光爆发";
    if (/balloon|热气球/.test(n)) return "日出时从空中俯瞰地貌，尺度感远胜地面观看";
    if (type.includes("历史遗产")) return "真正值得看的，是遗址上仍能读出的时代结构与生活痕迹";
    if (type.includes("宗教建筑")) return "建筑、仪式与艺术细节三者叠加，才是这里的核心价值";
    if (type.includes("城市街区")) return "最适合步行体验，用街巷尺度而不是单点打卡认识它";
    if (type.includes("自然景观")) return "核心看点是地貌本身，光线和天气会直接改变观感";
    if (type.includes("自然保护")) return "看的是完整生态系统，而不是某一个孤立景点";
    if (type.includes("博物馆")) return "核心价值在代表性馆藏与原作，而不是泛泛参观建筑";
    if (group.includes("特色体验")) return "这里最值得记住的是只有在当地才能成立的体验方式";
    return `${cleanName(p)}最值得记住的是它独有的现场感，而不是“到此一游”本身`;
  }

  descriptionFor = function(p){
    if (exact[p.rank]) return exact[p.rank];
    const curated = originalHighlights[p.rank];
    if (curated && !/当地最|最具辨识度|代表性的|值得.*之一|旅行地标之一/.test(curated)) return curated;
    return derivedHighlight(p);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fixFilterLabels);
  else fixFilterLabels();
  setTimeout(fixFilterLabels, 0);
})();

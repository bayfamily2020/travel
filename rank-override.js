// Travel rank labels override. Keep 20%+ bands unchanged.
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
    [14, "跨国流窜犯"],
    [16, "奔跑的走地鸡"],
    [18, "人形行李箱"],
    [20, "驿站老菜鸟"],
    [30, "迁徙的羚羊"],
    [40, "漂流的海龟"],
    [50, "追风的北极燕鸥"],
    [60, "洄游的灰鲸"],
    [70, "地球街溜子"],
    [85, "伊本·白图泰"]
  ];
  const level = progress >= 85 ? "外星人探针" : levels.find(([limit]) => progress < limit)[1];
  $("level").textContent = level;
  if ($("final-score")) $("final-score").textContent = score;
  if ($("final-max-score")) $("final-max-score").textContent = `/ ${max} 得分`;
  if ($("final-progress")) $("final-progress").textContent = `${progress}%`;
  if ($("final-level")) $("final-level").textContent = level;
  drawShareCard(score, max, progress, level);
};

(() => {
  const API = "https://bayfamily-wechat-login.bayfamily2020.workers.dev";
  const LOGIN_KEY = "bayfamily-wechat-login-v1";
  const samplePlans = [
    { rank: 594, place: "勃朗峰环线", date: "2027年6月", from: "旧金山湾区", days: "10天", style: "徒步 · 摄影", people: "计划6–10人", summary: "完整体验TMB经典路段，适合有连续徒步经验的旅行者。" },
    { rank: 648, place: "挪威峡湾", date: "2027年6月", from: "旧金山湾区", days: "10天", style: "徒步 · 自驾", people: "计划6–10人", summary: "串联三大岩石与峡湾公路，时间可在六月下旬协调。" },
    { rank: 571, place: "安纳普尔纳环线", date: "时间待定", from: "出发地灵活", days: "12–15天", style: "高海拔徒步", people: "寻找同路人", summary: "先寻找有兴趣的伙伴，再共同确定季节和线路长度。" }
  ];
  let plans = [], pendingAction = null;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  function login() { try { return JSON.parse(localStorage.getItem(LOGIN_KEY) || "null"); } catch (_) { return null; } }

  async function api(path, options = {}, needsLogin = false) {
    const headers = { "content-type":"application/json", ...(options.headers || {}) };
    if (needsLogin) {
      const token = login()?.token;
      if (!token) throw new Error("unauthorized");
      headers.authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${API}${path}`, { ...options, headers });
    const result = await response.json().catch(() => ({}));
    if (response.status === 401 && needsLogin) {
      localStorage.removeItem(LOGIN_KEY); document.documentElement.classList.remove("wechat-verified");
      throw new Error("unauthorized");
    }
    if (!response.ok) { const error = new Error(result.error || "request_failed"); error.status = response.status; throw error; }
    return result;
  }

  function planMarkup(plan, demo = false) {
    const action = demo
      ? `<button class="wechat-required" type="button" data-action="publish" data-place="${esc(plan.place)}" data-rank="${esc(plan.rank)}">发起类似计划</button>`
      : `<button class="wechat-required" type="button" data-action="apply" data-plan-id="${esc(plan.id)}" data-place="${esc(plan.place)}">申请同行</button>`;
    return `<article class="companion-plan-card" data-plan-rank="${esc(plan.rank ?? "")}"><div class="companion-plan-top"><span class="companion-date">${esc(plan.date)}</span><span class="${demo ? "companion-demo-badge" : "companion-live-badge"}">${demo ? "功能示例" : "正在招募"}</span></div><h3>${esc(plan.place)}</h3><span class="companion-author">发起人：${esc(plan.nickname || "示例旅行者")}</span><p class="companion-plan-summary">${esc(plan.summary)}</p><div class="companion-plan-meta"><span>📍 ${esc(plan.from || "出发地待定")}</span><span>🗓 ${esc(plan.days || "时长待定")}</span><span>🥾 ${esc(plan.style || "方式待定")}</span><span>👥 ${esc(plan.people || "人数待定")}</span></div>${action}</article>`;
  }
  function renderPlans() { const list = $("companion-plan-list"); if (list) list.innerHTML = plans.length ? plans.map(p => planMarkup(p)).join("") : samplePlans.map(p => planMarkup(p, true)).join(""); }
  async function loadPlans() {
    try { const result = await api("/plans"); plans = Array.isArray(result.plans) ? result.plans : []; renderPlans(); }
    catch (_) { plans = []; renderPlans(); }
  }

  function enhanceCards() {
    document.querySelectorAll(".place-card[data-rank]").forEach(card => {
      if (card.querySelector(".companion-card-link")) return;
      const rank = Number(card.dataset.rank), name = card.querySelector(".place-name")?.textContent?.trim() || "这个目的地";
      const link = document.createElement("span"); link.className = "companion-card-link"; link.setAttribute("role","button"); link.setAttribute("tabindex","0"); link.textContent = "🤝 找同伴";
      link.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); openDestination(rank, name); });
      link.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openDestination(rank, name); } });
      card.appendChild(link);
    });
  }
  function openDialog(dialog) { if (!dialog) return; document.body.classList.add("dialog-open"); typeof dialog.showModal === "function" ? dialog.showModal() : dialog.setAttribute("open",""); }
  function closeDialog(dialog) { if (!dialog) return; document.body.classList.remove("dialog-open"); typeof dialog.close === "function" ? dialog.close() : dialog.removeAttribute("open"); }
  function openDestination(rank, name) {
    const matches = plans.filter(plan => Number(plan.rank) === rank);
    $("destination-companion-title").textContent = `${name} · 寻找旅行同伴`;
    $("destination-companion-body").innerHTML = matches.length ? matches.map(p => planMarkup(p)).join("") : `<div class="companion-empty"><strong>暂时还没有公开计划</strong><p>你可以成为第一个发起人。</p><button class="wechat-required companion-primary" type="button" data-action="publish" data-place="${esc(name)}" data-rank="${rank}">验证后发起计划</button></div>`;
    openDialog($("destination-companion-dialog"));
  }

  function requireLogin(action) {
    pendingAction = action; closeDialog($("destination-companion-dialog"));
    const verb = action.type === "publish" ? "发布结伴计划" : action.type === "dashboard" ? "查看我的结伴" : "申请同行";
    $("wechat-login-context").textContent = action.place ? `你正在为“${action.place}”${verb}。` : `通过公众号口令验证后才可以${verb}。`;
    $("wechat-login-status").textContent = ""; openDialog($("wechat-login-dialog"));
  }
  function runAction(action) { if (!login()?.token) return requireLogin(action); if (action.type === "publish") return openPublish(action); if (action.type === "apply") return openApply(action); if (action.type === "dashboard") return openDashboard(); }
  function openPublish(action) {
    closeDialog($("destination-companion-dialog")); const form = $("publish-plan-form"); form.reset();
    form.elements.place.value = action.place || ""; form.elements.rank.value = action.rank || "";
    $("publish-plan-title").textContent = "发布结伴计划"; form.querySelector("button[type=submit]").textContent = "发布计划";
    $("publish-plan-status").textContent = ""; openDialog($("publish-plan-dialog"));
  }
  function openEditPlan(planId) {
    const plan = plans.find(item => item.id === planId) || null;
    return openDashboardPlanEditor(planId, plan);
  }
  async function openDashboardPlanEditor(planId, publicPlan) {
    let plan = publicPlan;
    if (!plan?.contact) {
      try { plan = (await api("/me", {}, true)).ownPlans.find(item => item.id === planId); } catch (_) { return; }
    }
    if (!plan) return;
    closeDialog($("companion-dashboard-dialog")); const form = $("publish-plan-form"); form.reset();
    for (const name of ["nickname","place","rank","date","from","days","people","style","summary"]) if (form.elements[name]) form.elements[name].value = plan[name] ?? "";
    form.elements.planId.value = plan.id; form.elements.wechatId.value = plan.contact?.wechatId || ""; form.elements.email.value = plan.contact?.email || "";
    $("publish-plan-title").textContent = "编辑结伴计划"; form.querySelector("button[type=submit]").textContent = "保存修改"; $("publish-plan-status").textContent = ""; openDialog($("publish-plan-dialog"));
  }
  function openApply(action) {
    closeDialog($("destination-companion-dialog")); const form = $("apply-plan-form"); form.reset(); form.elements.planId.value = action.planId;
    $("apply-plan-context").textContent = `申请加入“${action.place}”结伴计划。联系方式暂不公开。`; $("apply-plan-status").textContent = ""; openDialog($("apply-plan-dialog"));
  }

  async function verifyPassphrase(event) {
    event.preventDefault(); const status = $("wechat-login-status"), button = $("wechat-login-button"), input = $("wechat-passphrase"), passphrase = input.value.trim();
    if (!passphrase) { status.textContent = "请先输入公众号回复的访问口令。"; return input.focus(); }
    button.disabled = true; status.textContent = "正在验证口令…";
    try {
      const result = await api("/auth/passphrase", { method:"POST", body:JSON.stringify({ passphrase }) });
      localStorage.setItem(LOGIN_KEY, JSON.stringify({ token:result.loginToken, user:result.user, savedAt:Date.now() })); document.documentElement.classList.add("wechat-verified"); input.value = ""; status.textContent = "口令验证成功…";
      const next = pendingAction; pendingAction = null; setTimeout(() => { closeDialog($("wechat-login-dialog")); if (next) runAction(next); }, 450);
    } catch (error) { status.textContent = error.status === 429 ? "尝试次数过多，请15分钟后再试。" : "口令不正确或服务暂时不可用。"; input.select(); }
    finally { button.disabled = false; }
  }
  async function submitPlan(event) {
    event.preventDefault(); const form = event.currentTarget, button = form.querySelector("button[type=submit]"), status = $("publish-plan-status"), body = Object.fromEntries(new FormData(form).entries());
    button.disabled = true; status.textContent = "正在发布…";
    const planId = body.planId; delete body.planId;
    try { await api(planId ? `/plans/${encodeURIComponent(planId)}` : "/plans", { method:planId ? "PATCH" : "POST", body:JSON.stringify(body) }, true); status.textContent = planId ? "修改已保存。" : "发布成功。"; await loadPlans(); setTimeout(() => closeDialog($("publish-plan-dialog")), 650); }
    catch (error) { status.textContent = error.message === "unauthorized" ? "登录已过期，请重新验证。" : "发布失败，请检查必填项。"; } finally { button.disabled = false; }
  }
  async function submitApplication(event) {
    event.preventDefault(); const form = event.currentTarget, button = form.querySelector("button[type=submit]"), status = $("apply-plan-status"), body = Object.fromEntries(new FormData(form).entries()), planId = body.planId; delete body.planId;
    button.disabled = true; status.textContent = "正在提交…";
    try { await api(`/plans/${encodeURIComponent(planId)}/applications`, { method:"POST", body:JSON.stringify(body) }, true); status.textContent = "申请已发送给发起人。"; setTimeout(() => closeDialog($("apply-plan-dialog")), 750); }
    catch (error) { status.textContent = error.message === "already_applied" ? "你已经申请过这个计划。" : error.message === "own_plan" ? "不能申请自己发布的计划。" : "提交失败，请稍后重试。"; } finally { button.disabled = false; }
  }

  const statusText = value => ({ pending:"等待回复", accepted:"发起人愿意同行", declined:"发起人暂不接受" }[value] || value);
  const contactMarkup = contact => contact && (contact.wechatId || contact.email) ? `<p class="dashboard-contact"><strong>联系方式：</strong>${contact.wechatId ? `微信 ${esc(contact.wechatId)}` : ""}${contact.wechatId && contact.email ? " · " : ""}${contact.email ? `邮箱 ${esc(contact.email)}` : ""}</p>` : "";
  async function openDashboard() {
    const body = $("companion-dashboard-body"); body.innerHTML = `<p class="dashboard-loading">正在读取…</p>`; openDialog($("companion-dashboard-dialog"));
    try {
      const data = await api("/me", {}, true);
      const own = data.ownPlans?.length ? data.ownPlans.map(p => `<div class="dashboard-item"><strong>${esc(p.place)}</strong><p>${esc(p.date)} · ${esc(p.summary)}</p><div class="dashboard-actions"><button data-edit-plan="${esc(p.id)}">编辑计划</button><button class="danger-button" data-delete-plan="${esc(p.id)}" data-plan-name="${esc(p.place)}">删除计划</button></div></div>`).join("") : `<p class="dashboard-empty">还没有发布计划。</p>`;
      const received = data.received?.length ? data.received.map(item => `<div class="dashboard-item"><strong>${esc(item.nickname)} 申请 ${esc(item.plan.place)}</strong><p>${esc(item.message)}</p><span class="dashboard-status">${esc(statusText(item.status))}</span>${contactMarkup(item.contact)}${item.status === "pending" ? `<div class="dashboard-actions"><button data-respond="accepted" data-application-id="${esc(item.id)}">愿意同行</button><button data-respond="declined" data-application-id="${esc(item.id)}">婉拒</button></div>` : ""}</div>`).join("") : `<p class="dashboard-empty">暂时没有收到申请。</p>`;
      const sent = data.sent?.length ? data.sent.map(item => `<div class="dashboard-item"><strong>${esc(item.plan.place)}</strong><p>${esc(item.message)}</p><span class="dashboard-status">${esc(statusText(item.status))}</span>${contactMarkup(item.plan.contact)}</div>`).join("") : `<p class="dashboard-empty">还没有申请其他计划。</p>`;
      body.innerHTML = `<section class="dashboard-section"><h3>我发布的计划</h3>${own}</section><section class="dashboard-section"><h3>收到的申请</h3>${received}</section><section class="dashboard-section"><h3>我发出的申请</h3>${sent}</section>`;
    } catch (_) { body.innerHTML = `<p class="companion-error">登录可能已过期，请关闭后重新验证。</p>`; }
  }
  async function respond(applicationId, decision, button) { button.disabled = true; try { await api(`/applications/${encodeURIComponent(applicationId)}/respond`, { method:"POST", body:JSON.stringify({ decision }) }, true); await openDashboard(); } catch (_) { button.disabled = false; } }
  async function deletePlan(planId, name, button) {
    if (!confirm(`确定删除“${name}”结伴计划吗？相关申请也会一并删除，无法恢复。`)) return;
    button.disabled = true;
    try { await api(`/plans/${encodeURIComponent(planId)}`, { method:"DELETE" }, true); await loadPlans(); await openDashboard(); }
    catch (_) { button.disabled = false; alert("删除失败，请稍后重试。"); }
  }

  document.addEventListener("click", event => {
    const gated = event.target.closest(".wechat-required");
    if (gated) { event.preventDefault(); event.stopPropagation(); return runAction({ type:gated.dataset.action || "apply", place:gated.dataset.place || "", rank:gated.dataset.rank || "", planId:gated.dataset.planId || "" }); }
    const response = event.target.closest("[data-respond]"); if (response) return respond(response.dataset.applicationId, response.dataset.respond, response);
    const edit = event.target.closest("[data-edit-plan]"); if (edit) return openEditPlan(edit.dataset.editPlan);
    const remove = event.target.closest("[data-delete-plan]"); if (remove) return deletePlan(remove.dataset.deletePlan, remove.dataset.planName, remove);
    const close = event.target.closest("[data-close-dialog]"); if (close) closeDialog(close.closest("dialog"));
  });
  document.addEventListener("DOMContentLoaded", () => {
    if (login()?.token) document.documentElement.classList.add("wechat-verified"); renderPlans(); loadPlans(); enhanceCards();
    const grid = $("grid"); if (grid) new MutationObserver(enhanceCards).observe(grid, { childList:true });
    $("wechat-passphrase-form")?.addEventListener("submit", verifyPassphrase); $("publish-plan-form")?.addEventListener("submit", submitPlan); $("apply-plan-form")?.addEventListener("submit", submitApplication); $("open-companion-dashboard")?.addEventListener("click", () => runAction({ type:"dashboard" }));
    document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(dialog); }));
  });
})();

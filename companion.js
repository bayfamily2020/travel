(() => {
  const WECHAT_APP_ID = "wx043cc038eed3bd32";
  const WECHAT_AUTH_API = "https://bayfamily-wechat-login.bayfamily2020.workers.dev";
  const LOGIN_STORAGE_KEY = "bayfamily-wechat-login-v1";
  let loginPollTimer = null;
  const samplePlans = [
    { rank: 594, place: "勃朗峰环线", date: "2027年6月", from: "旧金山湾区", days: "10天", style: "徒步 · 摄影", people: "计划6–10人", summary: "完整体验TMB经典路段，适合有连续徒步经验的旅行者。" },
    { rank: 648, place: "挪威峡湾", date: "2027年6月", from: "旧金山湾区", days: "10天", style: "徒步 · 自驾", people: "计划6–10人", summary: "串联三大岩石与峡湾公路，时间可在六月下旬协调。" },
    { rank: 571, place: "安纳普尔纳环线", date: "时间待定", from: "出发地灵活", days: "12–15天", style: "高海拔徒步", people: "寻找同路人", summary: "先寻找有兴趣的伙伴，再共同确定季节和线路长度。" }
  ];

  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

  function planMarkup(plan) {
    return `<article class="companion-plan-card" data-plan-rank="${plan.rank}">
      <div class="companion-plan-top"><span class="companion-date">${escapeHtml(plan.date)}</span><span class="companion-demo-badge">功能示例</span></div>
      <h3>${escapeHtml(plan.place)}</h3>
      <p class="companion-plan-summary">${escapeHtml(plan.summary)}</p>
      <div class="companion-plan-meta"><span>📍 ${escapeHtml(plan.from)}</span><span>🗓 ${escapeHtml(plan.days)}</span><span>🥾 ${escapeHtml(plan.style)}</span><span>👥 ${escapeHtml(plan.people)}</span></div>
      <button class="wechat-required" type="button" data-action="apply" data-place="${escapeHtml(plan.place)}">微信登录后申请同行</button>
    </article>`;
  }

  function renderPlans() {
    const list = $("companion-plan-list");
    if (list) list.innerHTML = samplePlans.map(planMarkup).join("");
  }

  function enhanceCards() {
    document.querySelectorAll(".place-card[data-rank]").forEach(card => {
      if (card.querySelector(".companion-card-link")) return;
      const rank = Number(card.dataset.rank);
      const name = card.querySelector(".place-name")?.textContent?.trim() || "这个目的地";
      const link = document.createElement("span");
      link.className = "companion-card-link";
      link.setAttribute("role", "button");
      link.setAttribute("tabindex", "0");
      link.dataset.companionRank = String(rank);
      link.dataset.companionName = name;
      link.textContent = "🤝 找同伴";
      link.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        openDestination(rank, name);
      });
      link.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          openDestination(rank, name);
        }
      });
      card.appendChild(link);
    });
  }

  function openDialog(dialog) {
    if (!dialog) return;
    document.body.classList.add("dialog-open");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    document.body.classList.remove("dialog-open");
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }

  function openDestination(rank, name) {
    const dialog = $("destination-companion-dialog");
    const title = $("destination-companion-title");
    const body = $("destination-companion-body");
    const matches = samplePlans.filter(plan => plan.rank === rank);
    if (title) title.textContent = `${name} · 寻找旅行同伴`;
    if (body) {
      body.innerHTML = matches.length
        ? matches.map(planMarkup).join("")
        : `<div class="companion-empty"><strong>暂时还没有公开计划</strong><p>你可以成为第一个发起人。发布和申请都需要先完成微信身份验证。</p><button class="wechat-required companion-primary" type="button" data-action="publish" data-place="${escapeHtml(name)}">微信登录后发起计划</button></div>`;
    }
    openDialog(dialog);
  }

  function openWechatGate(action, place) {
    closeDialog($("destination-companion-dialog"));
    const dialog = $("wechat-login-dialog");
    const context = $("wechat-login-context");
    if (context) {
      const verb = action === "publish" ? "发布结伴计划" : action === "reply" ? "回复同行申请" : "申请同行";
      context.textContent = place ? `你正在为“${place}”${verb}。` : `微信登录后才可以${verb}。`;
    }
    const status = $("wechat-login-status");
    if (status) status.textContent = "";
    openDialog(dialog);
  }

  async function startWechatLogin() {
    const status = $("wechat-login-status");
    const button = $("wechat-login-button");
    if (!WECHAT_AUTH_API) {
      if (status) status.textContent = "验证码后台已经准备好，发布消息接收服务后即可启用。";
      return;
    }
    if (button) button.disabled = true;
    if (status) status.textContent = "正在生成一次性验证码…";
    try {
      const response = await fetch(`${WECHAT_AUTH_API}/auth/challenge`, { method: "POST", headers: {"content-type":"application/json"} });
      if (!response.ok) throw new Error("challenge_failed");
      const challenge = await response.json();
      showChallenge(challenge);
      pollLogin(challenge.sessionId, Date.now() + challenge.expiresIn * 1000);
    } catch (_) {
      if (status) status.textContent = "暂时无法连接微信验证服务，请稍后重试。";
    } finally {
      if (button) button.disabled = false;
    }
  }

  function showChallenge(challenge) {
    const panel = $("wechat-code-panel");
    const code = $("wechat-login-code");
    const status = $("wechat-login-status");
    if (panel) panel.hidden = false;
    if (code) code.textContent = challenge.code;
    if (status) status.textContent = "请在5分钟内向 BayFamily 公众号发送上面的完整验证码。";
  }

  function pollLogin(sessionId, expiresAt) {
    clearTimeout(loginPollTimer);
    const check = async () => {
      if (Date.now() >= expiresAt) {
        const status = $("wechat-login-status");
        if (status) status.textContent = "验证码已经过期，请重新获取。";
        return;
      }
      try {
        const response = await fetch(`${WECHAT_AUTH_API}/auth/status?session=${encodeURIComponent(sessionId)}`, {cache:"no-store"});
        const result = await response.json();
        if (result.status === "verified" && result.loginToken) {
          localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify({ token: result.loginToken, user: result.user, savedAt: Date.now() }));
          const status = $("wechat-login-status");
          if (status) status.textContent = "微信身份验证成功，正在返回结伴功能…";
          document.documentElement.classList.add("wechat-verified");
          setTimeout(() => closeDialog($("wechat-login-dialog")), 900);
          return;
        }
      } catch (_) {}
      loginPollTimer = setTimeout(check, 1800);
    };
    check();
  }

  document.addEventListener("click", event => {
    const gated = event.target.closest(".wechat-required");
    if (gated) {
      event.preventDefault();
      event.stopPropagation();
      openWechatGate(gated.dataset.action || "apply", gated.dataset.place || "");
      return;
    }
    const close = event.target.closest("[data-close-dialog]");
    if (close) closeDialog(close.closest("dialog"));
  });

  document.addEventListener("DOMContentLoaded", () => {
    renderPlans();
    enhanceCards();
    try { if (JSON.parse(localStorage.getItem(LOGIN_STORAGE_KEY) || "null")?.token) document.documentElement.classList.add("wechat-verified"); } catch (_) {}
    const grid = $("grid");
    if (grid) new MutationObserver(enhanceCards).observe(grid, {childList:true});
    $("wechat-login-button")?.addEventListener("click", startWechatLogin);
    document.querySelectorAll("dialog").forEach(dialog => {
      dialog.addEventListener("click", event => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });
  });
})();

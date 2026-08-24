const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const encoder = new TextEncoder();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === "/health") return json({ ok: true }, 200, cors);
      if (url.pathname === "/auth/passphrase" && request.method === "POST") return verifyPassphrase(request, env, cors);
      if (url.pathname === "/plans" && request.method === "GET") return listPlans(env, cors);
      if (url.pathname === "/plans" && request.method === "POST") return createPlan(request, env, cors);
      if (/^\/plans\/[A-Za-z0-9_-]+\/applications$/.test(url.pathname) && request.method === "POST") return createApplication(request, url, env, cors);
      if (url.pathname === "/me" && request.method === "GET") return getDashboard(request, env, cors);
      if (/^\/applications\/[A-Za-z0-9_-]+\/respond$/.test(url.pathname) && request.method === "POST") return respondToApplication(request, url, env, cors);
      if (url.pathname === "/auth/challenge" && request.method === "POST") return createChallenge(env, cors);
      if (url.pathname === "/auth/status" && request.method === "GET") return challengeStatus(url, env, cors);
      if (url.pathname === "/wechat/callback" && request.method === "GET") return verifyWechatEndpoint(url, env);
      if (url.pathname === "/wechat/callback" && request.method === "POST") return receiveWechatMessage(request, url, env);
      return json({ error: "not_found" }, 404, cors);
    } catch (error) {
      console.error(error);
      return json({ error: "server_error" }, 500, cors);
    }
  }
};

function corsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "https://bayfamily2020.github.io").split(",").map(value => value.trim());
  return {
    "access-control-allow-origin": allowed.includes(origin) ? origin : allowed[0],
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };
}

async function authenticatedUser(request, env) {
  const match = (request.headers.get("authorization") || "").match(/^Bearer\s+([A-Za-z0-9_-]{30,80})$/i);
  if (!match) return null;
  const raw = await env.AUTH_SESSIONS.get(`login:${match[1]}`);
  if (!raw) return null;
  const record = JSON.parse(raw);
  return record.userId ? { id: record.userId } : null;
}

async function listPlans(env, cors) {
  const ids = await readIndex(env, "plans:index");
  const records = await Promise.all(ids.slice(0, 60).map(id => env.AUTH_SESSIONS.get(`plan:${id}`)));
  const plans = records.filter(Boolean).map(JSON.parse).filter(plan => plan.status === "open").map(publicPlan);
  return json({ plans }, 200, cors);
}

async function createPlan(request, env, cors) {
  const user = await authenticatedUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, cors);
  const body = await request.json().catch(() => ({}));
  const plan = {
    id: randomToken(9),
    ownerId: user.id,
    nickname: clean(body.nickname, 24),
    place: clean(body.place, 80),
    rank: Number.isFinite(Number(body.rank)) ? Number(body.rank) : null,
    date: clean(body.date, 40),
    from: clean(body.from, 50),
    days: clean(body.days, 30),
    style: clean(body.style, 50),
    people: clean(body.people, 30),
    summary: clean(body.summary, 300),
    createdAt: Date.now(),
    status: "open"
  };
  if (!plan.nickname || !plan.place || !plan.date || !plan.summary) return json({ error: "missing_fields" }, 400, cors);
  await env.AUTH_SESSIONS.put(`plan:${plan.id}`, JSON.stringify(plan));
  await Promise.all([
    prependIndex(env, "plans:index", plan.id, 100),
    prependIndex(env, `userplans:${user.id}`, plan.id, 50)
  ]);
  return json({ plan: publicPlan(plan) }, 201, cors);
}

async function createApplication(request, url, env, cors) {
  const user = await authenticatedUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, cors);
  const planId = url.pathname.split("/")[2];
  const plan = await readJson(env, `plan:${planId}`);
  if (!plan || plan.status !== "open") return json({ error: "plan_not_found" }, 404, cors);
  if (plan.ownerId === user.id) return json({ error: "own_plan" }, 409, cors);
  if (await env.AUTH_SESSIONS.get(`applied:${planId}:${user.id}`)) return json({ error: "already_applied" }, 409, cors);
  const body = await request.json().catch(() => ({}));
  const application = {
    id: randomToken(9), planId, applicantId: user.id,
    nickname: clean(body.nickname, 24),
    message: clean(body.message, 300),
    createdAt: Date.now(), status: "pending"
  };
  if (!application.nickname || !application.message) return json({ error: "missing_fields" }, 400, cors);
  await Promise.all([
    env.AUTH_SESSIONS.put(`application:${application.id}`, JSON.stringify(application)),
    env.AUTH_SESSIONS.put(`applied:${planId}:${user.id}`, application.id),
    prependIndex(env, `planapps:${planId}`, application.id, 100),
    prependIndex(env, `userapps:${user.id}`, application.id, 100)
  ]);
  return json({ application: safeApplication(application) }, 201, cors);
}

async function getDashboard(request, env, cors) {
  const user = await authenticatedUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, cors);
  const ownPlanIds = await readIndex(env, `userplans:${user.id}`);
  const ownPlans = (await Promise.all(ownPlanIds.map(id => readJson(env, `plan:${id}`)))).filter(Boolean);
  const received = [];
  for (const plan of ownPlans) {
    const appIds = await readIndex(env, `planapps:${plan.id}`);
    const apps = (await Promise.all(appIds.map(id => readJson(env, `application:${id}`)))).filter(Boolean).map(safeApplication);
    received.push(...apps.map(application => ({ ...application, plan: publicPlan(plan) })));
  }
  const sentIds = await readIndex(env, `userapps:${user.id}`);
  const sentRaw = (await Promise.all(sentIds.map(id => readJson(env, `application:${id}`)))).filter(Boolean);
  const sent = [];
  for (const application of sentRaw) {
    const plan = await readJson(env, `plan:${application.planId}`);
    if (plan) sent.push({ ...safeApplication(application), plan: publicPlan(plan) });
  }
  return json({ ownPlans: ownPlans.map(publicPlan), received, sent }, 200, cors);
}

async function respondToApplication(request, url, env, cors) {
  const user = await authenticatedUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, cors);
  const applicationId = url.pathname.split("/")[2];
  const application = await readJson(env, `application:${applicationId}`);
  if (!application) return json({ error: "application_not_found" }, 404, cors);
  const plan = await readJson(env, `plan:${application.planId}`);
  if (!plan || plan.ownerId !== user.id) return json({ error: "forbidden" }, 403, cors);
  const body = await request.json().catch(() => ({}));
  const decision = body.decision === "accepted" ? "accepted" : body.decision === "declined" ? "declined" : "";
  if (!decision) return json({ error: "invalid_decision" }, 400, cors);
  application.status = decision;
  application.respondedAt = Date.now();
  await env.AUTH_SESSIONS.put(`application:${application.id}`, JSON.stringify(application));
  return json({ application: safeApplication(application) }, 200, cors);
}

function publicPlan(plan) {
  const { ownerId, ...safe } = plan;
  return safe;
}

function safeApplication(application) {
  const { applicantId, ...safe } = application;
  return safe;
}

function clean(value, maxLength) {
  return String(value || "").trim().replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, maxLength);
}

async function readJson(env, key) {
  const raw = await env.AUTH_SESSIONS.get(key);
  return raw ? JSON.parse(raw) : null;
}

async function readIndex(env, key) {
  const value = await readJson(env, key);
  return Array.isArray(value) ? value : [];
}

async function prependIndex(env, key, id, limit) {
  const current = await readIndex(env, key);
  const next = [id, ...current.filter(value => value !== id)].slice(0, limit);
  await env.AUTH_SESSIONS.put(key, JSON.stringify(next));
}

async function verifyPassphrase(request, env, cors) {
  if (!env.ACCESS_PASSPHRASE || !env.LOGIN_SIGNING_SECRET) {
    return json({ error: "service_not_configured" }, 503, cors);
  }

  const clientId = request.headers.get("cf-connecting-ip") || "unknown";
  const rateKey = `passphrase-attempts:${clientId}`;
  const attempts = Number(await env.AUTH_SESSIONS.get(rateKey) || 0);
  if (attempts >= 10) return json({ error: "too_many_attempts" }, 429, cors);

  const body = await request.json().catch(() => ({}));
  const supplied = String(body.passphrase || "").trim();
  const expected = String(env.ACCESS_PASSPHRASE).trim();
  if (!supplied || !await constantTimeEqual(supplied, expected)) {
    await env.AUTH_SESSIONS.put(rateKey, String(attempts + 1), { expirationTtl: 900 });
    return json({ error: "invalid_passphrase" }, 401, cors);
  }

  await env.AUTH_SESSIONS.delete(rateKey);
  const loginToken = randomToken(32);
  const userId = await stableUserId(loginToken, env.LOGIN_SIGNING_SECRET);
  await env.AUTH_SESSIONS.put(`login:${loginToken}`, JSON.stringify({ userId, method: "wechat_passphrase" }), { expirationTtl: 2592000 });
  return json({ loginToken, user: { id: userId, label: "公众号成员" }, expiresIn: 2592000 }, 200, cors);
}

async function constantTimeEqual(left, right) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right))
  ]);
  const a = new Uint8Array(leftHash);
  const b = new Uint8Array(rightHash);
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index] ^ b[index];
  return difference === 0;
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });
}

async function createChallenge(env, cors) {
  const sessionId = randomToken(24);
  const code = `TRAVEL-${randomCode(6)}`;
  const expiresIn = 300;
  const record = { status: "pending", createdAt: Date.now(), code };

  await Promise.all([
    env.AUTH_SESSIONS.put(`session:${sessionId}`, JSON.stringify(record), { expirationTtl: expiresIn }),
    env.AUTH_SESSIONS.put(`code:${code}`, sessionId, { expirationTtl: expiresIn })
  ]);

  return json({ sessionId, code, expiresIn }, 201, cors);
}

async function challengeStatus(url, env, cors) {
  const sessionId = url.searchParams.get("session");
  if (!sessionId || !/^[A-Za-z0-9_-]{20,80}$/.test(sessionId)) return json({ error: "invalid_session" }, 400, cors);
  const raw = await env.AUTH_SESSIONS.get(`session:${sessionId}`);
  if (!raw) return json({ status: "expired" }, 404, cors);

  const record = JSON.parse(raw);
  if (record.status !== "verified") return json({ status: "pending" }, 200, cors);

  return json({
    status: "verified",
    loginToken: record.loginToken,
    user: { id: record.userId, label: "微信用户" }
  }, 200, cors);
}

async function verifyWechatEndpoint(url, env) {
  const signature = url.searchParams.get("signature") || "";
  const timestamp = url.searchParams.get("timestamp") || "";
  const nonce = url.searchParams.get("nonce") || "";
  const echo = url.searchParams.get("echostr") || "";
  if (!await validWechatSignature(signature, timestamp, nonce, env.WECHAT_TOKEN)) return new Response("invalid signature", { status: 403 });
  return new Response(echo, { headers: { "content-type": "text/plain; charset=utf-8" } });
}

async function receiveWechatMessage(request, url, env) {
  const signature = url.searchParams.get("signature") || "";
  const timestamp = url.searchParams.get("timestamp") || "";
  const nonce = url.searchParams.get("nonce") || "";
  if (!await validWechatSignature(signature, timestamp, nonce, env.WECHAT_TOKEN)) return new Response("invalid signature", { status: 403 });

  const xml = await request.text();
  const message = parseWechatXml(xml);
  if (message.MsgType !== "text") return new Response("success", { headers: { "content-type": "text/plain; charset=utf-8" } });

  const code = (message.Content || "").trim().toUpperCase();
  if (!/^TRAVEL-[A-Z2-9]{6}$/.test(code)) {
    return new Response("success", { headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  const sessionId = await env.AUTH_SESSIONS.get(`code:${code}`);
  if (!sessionId) return xmlReply(message, "验证码无效或已过期，请回到旅行网站重新获取。");

  const loginToken = randomToken(32);
  const userId = await stableUserId(message.FromUserName, env.LOGIN_SIGNING_SECRET);
  const verified = { status: "verified", verifiedAt: Date.now(), userId, loginToken };

  await Promise.all([
    env.AUTH_SESSIONS.put(`session:${sessionId}`, JSON.stringify(verified), { expirationTtl: 300 }),
    env.AUTH_SESSIONS.put(`login:${loginToken}`, JSON.stringify({ userId, openId: message.FromUserName }), { expirationTtl: 2592000 }),
    env.AUTH_SESSIONS.delete(`code:${code}`)
  ]);

  return xmlReply(message, "微信身份验证成功。请返回旅行网站，页面将自动完成登录。");
}

async function validWechatSignature(signature, timestamp, nonce, token) {
  if (!signature || !timestamp || !nonce || !token) return false;
  const value = [token, timestamp, nonce].sort().join("");
  const digest = await crypto.subtle.digest("SHA-1", encoder.encode(value));
  return hex(digest) === signature.toLowerCase();
}

async function stableUserId(openId, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(openId))).slice(0, 24);
}

function parseWechatXml(xml) {
  const fields = ["ToUserName", "FromUserName", "CreateTime", "MsgType", "Content"];
  return Object.fromEntries(fields.map(name => {
    const match = xml.match(new RegExp(`<${name}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${name}>|<${name}>([\\s\\S]*?)<\\/${name}>`));
    return [name, match ? (match[1] ?? match[2] ?? "") : ""];
  }));
}

function xmlReply(message, content) {
  const safe = String(content).replace(/]]>/g, "]]]]><![CDATA[>");
  const body = `<xml><ToUserName><![CDATA[${message.FromUserName}]]></ToUserName><FromUserName><![CDATA[${message.ToUserName}]]></FromUserName><CreateTime>${Math.floor(Date.now()/1000)}</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[${safe}]]></Content></xml>`;
  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
}

function randomCode(length) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
}

function randomToken(bytesLength) {
  const bytes = crypto.getRandomValues(new Uint8Array(bytesLength));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function hex(buffer) {
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, "0")).join("");
}

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const encoder = new TextEncoder();
const CLERK_ISSUER = "https://rational-sculpin-1836.clerk.accounts.dev";
const CLERK_JWKS_URL = `${CLERK_ISSUER}/.well-known/jwks.json`;
let jwksCache = { expiresAt: 0, keys: [] };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === "/health") return json({ ok: true }, 200, cors);
      if (url.pathname === "/plans" && request.method === "GET") return listPlans(env, cors);
      if (url.pathname === "/plans" && request.method === "POST") return createPlan(request, env, cors);
      if (/^\/plans\/[A-Za-z0-9_-]+$/.test(url.pathname) && request.method === "PATCH") return updatePlan(request, url, env, cors);
      if (/^\/plans\/[A-Za-z0-9_-]+$/.test(url.pathname) && request.method === "DELETE") return deletePlan(request, url, env, cors);
      if (/^\/plans\/[A-Za-z0-9_-]+\/applications$/.test(url.pathname) && request.method === "POST") return createApplication(request, url, env, cors);
      if (url.pathname === "/me" && request.method === "GET") return getDashboard(request, env, cors);
      if (/^\/applications\/[A-Za-z0-9_-]+\/respond$/.test(url.pathname) && request.method === "POST") return respondToApplication(request, url, env, cors);
      return json({ error: "not_found" }, 404, cors);
    } catch (error) {
      console.error(error);
      return json({ error: "server_error" }, 500, cors);
    }
  }
};

function corsHeaders(request, env) {
  const origin = request.headers.get("origin") || "";
  const allowed = allowedOrigins(env);
  return {
    "access-control-allow-origin": allowed.includes(origin) ? origin : allowed[0],
    "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };
}

async function authenticatedUser(request, env) {
  const match = (request.headers.get("authorization") || "").match(/^Bearer\s+([^\s]+)$/i);
  if (!match) return null;
  const claims = await verifyClerkToken(match[1], env).catch(() => null);
  return claims?.sub ? { id: claims.sub } : null;
}

async function verifyClerkToken(token, env) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("invalid_jwt");
  const header = JSON.parse(new TextDecoder().decode(base64UrlBytes(parts[0])));
  const claims = JSON.parse(new TextDecoder().decode(base64UrlBytes(parts[1])));
  if (header.alg !== "RS256" || !header.kid) throw new Error("invalid_jwt_header");

  const jwk = (await clerkJwks()).find(key => key.kid === header.kid);
  if (!jwk) throw new Error("unknown_jwt_key");
  const publicKey = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const validSignature = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, base64UrlBytes(parts[2]), encoder.encode(`${parts[0]}.${parts[1]}`));
  if (!validSignature) throw new Error("invalid_jwt_signature");

  const now = Math.floor(Date.now() / 1000);
  if (!claims.sub || claims.iss !== CLERK_ISSUER || !claims.exp || claims.exp <= now || (claims.nbf && claims.nbf > now + 5)) throw new Error("invalid_jwt_claims");
  const allowed = allowedOrigins(env);
  if (claims.azp && !allowed.includes(claims.azp)) throw new Error("invalid_authorized_party");
  return claims;
}

async function clerkJwks() {
  if (jwksCache.expiresAt > Date.now() && jwksCache.keys.length) return jwksCache.keys;
  const response = await fetch(CLERK_JWKS_URL);
  if (!response.ok) throw new Error("jwks_unavailable");
  const body = await response.json();
  if (!Array.isArray(body.keys)) throw new Error("invalid_jwks");
  jwksCache = { keys: body.keys, expiresAt: Date.now() + 3600000 };
  return body.keys;
}

function base64UrlBytes(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || "https://bayfamily2020.github.io").split(",").map(value => value.trim()).filter(Boolean);
}

async function listPlans(env, cors) {
  const ids = await readIndex(env, "plans:index");
  const records = await Promise.all(ids.slice(0, 60).map(id => env.AUTH_SESSIONS.get(`plan:${id}`)));
  const plans = records.filter(Boolean).map(JSON.parse).filter(plan => plan.status === "open").map(plan => publicPlan(plan));
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
    wechatId: clean(body.wechatId, 50),
    email: clean(body.email, 100).toLowerCase(),
    createdAt: Date.now(),
    status: "open"
  };
  if (!plan.nickname || !plan.place || !plan.date || !plan.summary || (!plan.wechatId && !plan.email)) return json({ error: "missing_fields" }, 400, cors);
  if (plan.email && !validEmail(plan.email)) return json({ error: "invalid_email" }, 400, cors);
  await env.AUTH_SESSIONS.put(`plan:${plan.id}`, JSON.stringify(plan));
  await Promise.all([
    prependIndex(env, "plans:index", plan.id, 100),
    prependIndex(env, `userplans:${user.id}`, plan.id, 50)
  ]);
  return json({ plan: publicPlan(plan) }, 201, cors);
}

async function updatePlan(request, url, env, cors) {
  const user = await authenticatedUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, cors);
  const planId = url.pathname.split("/")[2];
  const plan = await readJson(env, `plan:${planId}`);
  if (!plan) return json({ error: "plan_not_found" }, 404, cors);
  if (plan.ownerId !== user.id) return json({ error: "forbidden" }, 403, cors);
  const body = await request.json().catch(() => ({}));
  const updated = {
    ...plan,
    nickname: clean(body.nickname, 24), place: clean(body.place, 80),
    rank: Number.isFinite(Number(body.rank)) ? Number(body.rank) : null,
    date: clean(body.date, 40), from: clean(body.from, 50), days: clean(body.days, 30),
    style: clean(body.style, 50), people: clean(body.people, 30), summary: clean(body.summary, 300),
    wechatId: clean(body.wechatId, 50), email: clean(body.email, 100).toLowerCase(), updatedAt: Date.now()
  };
  if (!updated.nickname || !updated.place || !updated.date || !updated.summary || (!updated.wechatId && !updated.email)) return json({ error: "missing_fields" }, 400, cors);
  if (updated.email && !validEmail(updated.email)) return json({ error: "invalid_email" }, 400, cors);
  await env.AUTH_SESSIONS.put(`plan:${planId}`, JSON.stringify(updated));
  return json({ plan: publicPlan(updated, true) }, 200, cors);
}

async function deletePlan(request, url, env, cors) {
  const user = await authenticatedUser(request, env);
  if (!user) return json({ error: "unauthorized" }, 401, cors);
  const planId = url.pathname.split("/")[2];
  const plan = await readJson(env, `plan:${planId}`);
  if (!plan) return json({ error: "plan_not_found" }, 404, cors);
  if (plan.ownerId !== user.id) return json({ error: "forbidden" }, 403, cors);
  const applicationIds = await readIndex(env, `planapps:${planId}`);
  for (const applicationId of applicationIds) {
    const application = await readJson(env, `application:${applicationId}`);
    if (application) {
      await Promise.all([
        env.AUTH_SESSIONS.delete(`application:${applicationId}`),
        env.AUTH_SESSIONS.delete(`applied:${planId}:${application.applicantId}`),
        removeFromIndex(env, `userapps:${application.applicantId}`, applicationId)
      ]);
    }
  }
  await Promise.all([
    env.AUTH_SESSIONS.delete(`plan:${planId}`), env.AUTH_SESSIONS.delete(`planapps:${planId}`),
    removeFromIndex(env, "plans:index", planId), removeFromIndex(env, `userplans:${user.id}`, planId)
  ]);
  return json({ deleted: true }, 200, cors);
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
    wechatId: clean(body.wechatId, 50),
    email: clean(body.email, 100).toLowerCase(),
    createdAt: Date.now(), status: "pending"
  };
  if (!application.nickname || !application.message || (!application.wechatId && !application.email)) return json({ error: "missing_fields" }, 400, cors);
  if (application.email && !validEmail(application.email)) return json({ error: "invalid_email" }, 400, cors);
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
    const apps = (await Promise.all(appIds.map(id => readJson(env, `application:${id}`)))).filter(Boolean).map(application => safeApplication(application, application.status === "accepted"));
    received.push(...apps.map(application => ({ ...application, plan: publicPlan(plan) })));
  }
  const sentIds = await readIndex(env, `userapps:${user.id}`);
  const sentRaw = (await Promise.all(sentIds.map(id => readJson(env, `application:${id}`)))).filter(Boolean);
  const sent = [];
  for (const application of sentRaw) {
    const plan = await readJson(env, `plan:${application.planId}`);
    if (plan) sent.push({ ...safeApplication(application), plan: publicPlan(plan, application.status === "accepted") });
  }
  return json({ ownPlans: ownPlans.map(plan => publicPlan(plan, true)), received, sent }, 200, cors);
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
  return json({ application: safeApplication(application, decision === "accepted") }, 200, cors);
}

function publicPlan(plan, includeContact = false) {
  const { ownerId, wechatId, email, ...safe } = plan;
  if (includeContact) safe.contact = { wechatId, email };
  return safe;
}

function safeApplication(application, includeContact = false) {
  const { applicantId, wechatId, email, ...safe } = application;
  if (includeContact) safe.contact = { wechatId, email };
  return safe;
}

function clean(value, maxLength) {
  return String(value || "").trim().replace(/[\u0000-\u001F\u007F]/g, " ").slice(0, maxLength);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

async function removeFromIndex(env, key, id) {
  const current = await readIndex(env, key);
  await env.AUTH_SESSIONS.put(key, JSON.stringify(current.filter(value => value !== id)));
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...extra } });
}

function randomToken(bytesLength) {
  const bytes = crypto.getRandomValues(new Uint8Array(bytesLength));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

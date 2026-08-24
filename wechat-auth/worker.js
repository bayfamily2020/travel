const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };
const encoder = new TextEncoder();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    try {
      if (url.pathname === "/health") return json({ ok: true }, 200, cors);
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
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    "vary": "Origin"
  };
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

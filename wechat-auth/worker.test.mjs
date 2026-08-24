import worker from "./worker.js";
import assert from "node:assert/strict";

class MemoryKV {
  constructor() { this.values = new Map(); }
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
  async delete(key) { this.values.delete(key); }
}

const env = { AUTH_SESSIONS: new MemoryKV(), ALLOWED_ORIGINS: "https://example.com" };
const keys = await crypto.subtle.generateKey({ name:"RSASSA-PKCS1-v1_5", modulusLength:2048, publicExponent:new Uint8Array([1,0,1]), hash:"SHA-256" }, true, ["sign","verify"]);
const publicJwk = { ...await crypto.subtle.exportKey("jwk", keys.publicKey), kid:"test-key", use:"sig", alg:"RS256" };
globalThis.fetch = async url => {
  assert.equal(String(url), "https://rational-sculpin-1836.clerk.accounts.dev/.well-known/jwks.json");
  return new Response(JSON.stringify({ keys:[publicJwk] }), { headers:{ "content-type":"application/json" } });
};

const encode = value => Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");
async function tokenFor(sub, azp = "https://example.com") {
  const now = Math.floor(Date.now() / 1000);
  const head = encode({ alg:"RS256", typ:"JWT", kid:"test-key" });
  const body = encode({ sub, iss:"https://rational-sculpin-1836.clerk.accounts.dev", azp, nbf:now-1, exp:now+3600 });
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", keys.privateKey, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${Buffer.from(signature).toString("base64url")}`;
}

async function call(path, { method = "GET", token, body } = {}) {
  const headers = { origin:"https://example.com" };
  if (body) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await worker.fetch(new Request(`https://worker.test${path}`, { method, headers, body:body && JSON.stringify(body) }), env);
  return { status:response.status, body:await response.json() };
}

const ownerToken = await tokenFor("user_owner");
const applicantToken = await tokenFor("user_applicant");
assert.equal((await call("/me", { token:await tokenFor("user_attacker", "https://evil.example") })).status, 401);

const created = await call("/plans", { method:"POST", token:ownerToken, body:{ nickname:"发起人", place:"冰岛", date:"2027年7月", from:"上海", days:"8天", style:"自驾", people:"4人", summary:"环岛旅行", wechatId:"owner-wechat", email:"owner@example.com" } });
assert.equal(created.status, 201);
const planId = created.body.plan.id;
const edited = await call(`/plans/${planId}`, { method:"PATCH", token:ownerToken, body:{ nickname:"发起人", place:"冰岛环岛", date:"2027年7月", from:"上海", days:"9天", style:"自驾", people:"4人", summary:"更新后的环岛旅行", wechatId:"owner-wechat", email:"owner@example.com" } });
assert.equal(edited.status, 200);
assert.equal(edited.body.plan.place, "冰岛环岛");
const publicPlans = (await call("/plans")).body.plans;
assert.equal(publicPlans.length, 1);
assert.equal(publicPlans[0].wechatId, undefined);
assert.equal(publicPlans[0].email, undefined);
assert.equal(publicPlans[0].contact, undefined);

assert.equal((await call(`/plans/${planId}`, { method:"PATCH", token:applicantToken, body:{} })).status, 403);
assert.equal((await call(`/plans/${planId}`, { method:"DELETE", token:applicantToken })).status, 403);
const applied = await call(`/plans/${planId}/applications`, { method:"POST", token:applicantToken, body:{ nickname:"申请人", message:"有冬季自驾经验", wechatId:"applicant-wechat", email:"applicant@example.com" } });
assert.equal(applied.status, 201);

const ownerDashboard = await call("/me", { token:ownerToken });
assert.equal(ownerDashboard.body.received.length, 1);
assert.equal(ownerDashboard.body.received[0].contact, undefined);
const applicationId = ownerDashboard.body.received[0].id;
assert.equal((await call(`/applications/${applicationId}/respond`, { method:"POST", token:ownerToken, body:{ decision:"accepted" } })).status, 200);
const applicantDashboard = await call("/me", { token:applicantToken });
assert.equal(applicantDashboard.body.sent[0].status, "accepted");
assert.equal(applicantDashboard.body.sent[0].plan.contact.wechatId, "owner-wechat");
assert.equal((await call("/me", { token:ownerToken })).body.received[0].contact.email, "applicant@example.com");

assert.equal((await call(`/plans/${planId}`, { method:"DELETE", token:ownerToken })).status, 200);
assert.equal((await call("/plans")).body.plans.length, 0);

console.log("clerk worker flow ok");

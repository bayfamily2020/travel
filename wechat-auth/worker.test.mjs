import worker from "./worker.js";
import assert from "node:assert/strict";

class MemoryKV {
  constructor() { this.values = new Map(); }
  async get(key) { return this.values.get(key) ?? null; }
  async put(key, value) { this.values.set(key, value); }
  async delete(key) { this.values.delete(key); }
}

const env = {
  AUTH_SESSIONS: new MemoryKV(),
  ACCESS_PASSPHRASE: "test-passphrase",
  LOGIN_SIGNING_SECRET: "12345678901234567890123456789012",
  ALLOWED_ORIGINS: "https://example.com"
};

async function call(path, { method = "GET", token, body } = {}) {
  const headers = { origin: "https://example.com" };
  if (body) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await worker.fetch(new Request(`https://worker.test${path}`, { method, headers, body: body && JSON.stringify(body) }), env);
  return { status: response.status, body: await response.json() };
}

const ownerLogin = await call("/auth/passphrase", { method:"POST", body:{ passphrase:"test-passphrase" } });
assert.equal(ownerLogin.status, 200);
const ownerToken = ownerLogin.body.loginToken;

const created = await call("/plans", { method:"POST", token:ownerToken, body:{ nickname:"发起人", place:"冰岛", date:"2027年7月", from:"上海", days:"8天", style:"自驾", people:"4人", summary:"环岛旅行" } });
assert.equal(created.status, 201);
const planId = created.body.plan.id;
assert.equal((await call("/plans")).body.plans.length, 1);

const applicantLogin = await call("/auth/passphrase", { method:"POST", body:{ passphrase:"test-passphrase" } });
const applicantToken = applicantLogin.body.loginToken;
const applied = await call(`/plans/${planId}/applications`, { method:"POST", token:applicantToken, body:{ nickname:"申请人", message:"有冬季自驾经验" } });
assert.equal(applied.status, 201);

const ownerDashboard = await call("/me", { token:ownerToken });
assert.equal(ownerDashboard.body.received.length, 1);
const applicationId = ownerDashboard.body.received[0].id;
assert.equal((await call(`/applications/${applicationId}/respond`, { method:"POST", token:ownerToken, body:{ decision:"accepted" } })).status, 200);
assert.equal((await call("/me", { token:applicantToken })).body.sent[0].status, "accepted");

console.log("worker flow ok");

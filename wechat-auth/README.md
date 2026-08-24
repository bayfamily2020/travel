# BayFamily Clerk 邮箱登录服务

旅行内容和公开结伴计划可匿名浏览；发布、申请、编辑、删除和处理申请必须先通过 Clerk 邮箱验证码登录。Worker 验证 Clerk session JWT，并用稳定的 Clerk `sub` 用户 ID 记录计划和申请归属。

## 前端

`index.html` 使用 Clerk 测试环境 Publishable Key 加载 ClerkJS。Publishable Key 可以公开；不要把 Clerk Secret Key 写进代码、Cloudflare Worker 或 GitHub。

在 Clerk Dashboard 的 **User & Authentication** 中启用 Email，并把登录方式配置为邮箱验证码（Email verification code）。

## Cloudflare Worker

1. 保留 KV binding：变量名 `AUTH_SESSIONS`。
2. 保留变量 `ALLOWED_ORIGINS`，当前值：
   `https://bayfamily2020.github.io,https://raw.githack.com`
3. 将 `worker.js` 部署到现有 Worker。
4. `ACCESS_PASSPHRASE` 和 `LOGIN_SIGNING_SECRET` 已不再使用，可以删除。

Worker 会从 Clerk 的公开 JWKS 地址读取签名密钥，不需要 Clerk Secret Key。JWT 的签名、过期时间、issuer 和 `azp` 来源都会校验。

## 测试

```bash
node worker.test.mjs
```

当前使用 `pk_test_...` 开发实例，适合预览和测试。正式上线应在 Clerk 创建 Production instance，并按 Clerk 要求绑定自有域名后换成 `pk_live_...`。

# BayFamily 微信验证码登录服务

这个 Worker 用公众号普通文本消息完成微信身份验证，不依赖网页 OAuth，也不读取用户资料。

## 登录流程

1. 旅行网站调用 `POST /auth/challenge` 获取一次性验证码。
2. 用户向 BayFamily 公众号发送验证码。
3. 微信服务器调用 `/wechat/callback`，消息中包含发送者 OpenID。
4. Worker 将验证码对应会话标记为已验证。
5. 浏览器轮询 `GET /auth/status` 并取得登录令牌。

验证码有效期为 5 分钟，使用后立即失效。OpenID 不返回浏览器。

## 部署前配置

1. 创建 Cloudflare Worker 和 KV namespace，把 namespace ID 填入 `wrangler.toml`。
2. 设置两个 Worker secret：
   - `WECHAT_TOKEN`：自行生成的随机字符串，需要与公众号“服务器配置”的 Token 完全一致。
   - `LOGIN_SIGNING_SECRET`：至少 32 字节的随机字符串，只保存在 Worker secret。
3. 部署后取得 `https://<worker>.workers.dev` 地址。
4. 公众号后台服务器配置：
   - URL：`https://<worker>.workers.dev/wechat/callback`
   - Token：与 `WECHAT_TOKEN` 相同
   - 消息加解密方式：第一版选择“明文模式”
5. 把 Worker 地址填入网站 `companion.js` 的 `WECHAT_AUTH_API`。

不要把 AppSecret、WECHAT_TOKEN 或 LOGIN_SIGNING_SECRET 提交到 GitHub。

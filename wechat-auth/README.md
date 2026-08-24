# BayFamily 公众号口令登录服务

这个 Worker 校验公众号自动回复的访问口令，不依赖公众号认证、服务器配置或网页 OAuth，也不读取用户资料。

## 登录流程

1. 用户扫码关注 BayFamily 公众号，发送关键词“结伴旅行”。
2. 公众号通过关键词自动回复访问口令。
3. 用户在旅行网站输入口令。
4. 网站调用 `POST /auth/passphrase`，Worker 校验成功后签发30天登录令牌。

同一来源15分钟内最多失败10次。口令应定期更换，并同步修改公众号自动回复和 Worker secret。

## 部署前配置

1. 创建 Cloudflare Worker 和 KV namespace，把 namespace ID 填入 `wrangler.toml`。
2. 设置两个 Worker secret：
   - `ACCESS_PASSPHRASE`：公众号自动回复给用户的访问口令。
   - `LOGIN_SIGNING_SECRET`：至少 32 字节的随机字符串，只保存在 Worker secret。
3. 部署后取得 `https://<worker>.workers.dev` 地址。
4. 在公众号后台设置关键词“结伴旅行”的自动回复，回复内容包含与 `ACCESS_PASSPHRASE` 完全相同的口令。
5. 把 Worker 地址填入网站 `companion.js` 的 `WECHAT_AUTH_API`。

不要把访问口令或 `LOGIN_SIGNING_SECRET` 提交到 GitHub。`WECHAT_TOKEN` 和旧回调接口只为将来升级到正式微信身份认证而保留，当前方案无需配置。

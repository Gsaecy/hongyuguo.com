# hongyuguo.com 自由讨论论坛 · GitHub GraphQL 同源反向代理配置

论坛（discuss.html#forum）优先直连 `api.github.com/graphql`；
直连失败（中国大陆访问 GitHub API 常被拦截）时自动回退到**同源地址 `/github-graphql`**，
由 Nginx 反向代理到 GitHub，保证大陆访客也能浏览/发帖。

## 生效方法

1. 登录服务器，编辑 Nginx 站点配置（例如 `/www/server/panel/vhost/nginx/hongyuguo.com.conf`），
   在 `server { ... }` 块内加入：

```nginx
# 自由讨论论坛：GitHub GraphQL 同源反向代理
location = /github-graphql {
    if ($request_method != POST) { return 403; }
    proxy_pass https://api.github.com/graphql;
    proxy_set_header Host api.github.com;
    proxy_set_header Authorization $http_authorization;
    proxy_set_header User-Agent "hongyuguo-forum/1.0";
    proxy_ssl_server_name on;
}
```

2. 重载 Nginx（二选一）：
   - 宝塔面板：网站 → hongyuguo.com → 配置文件 → 保存（保存后自动重载）
   - 命令行：`nginx -t && nginx -s reload`

3. 验证：服务器上执行
   `curl -s -X POST https://hongyuguo.com/github-graphql -H "Content-Type: application/json" -d '{"query":"{ repository(owner:\"Gsaecy\",name:\"hongyuguo.com\"){ name } }"}'`
   返回包含 `"name":"hongyuguo.com"` 的 JSON 即成功。

## 说明

- 未登录访客经代理请求，共享服务器出口 IP 的匿名额度（60 次/小时）——仅够少量浏览；
  **登录后的访客**用自己的 GitHub token 直连（5000 次/小时），不受影响。
- 登录、换令牌均走 giscus.app（Vercel），大陆可正常访问，无需代理。
- 代理仅转发请求体与 Authorization 头，不涉及任何密钥存储。

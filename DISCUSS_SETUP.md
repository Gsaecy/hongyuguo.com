# 留言讨论板块 · 配置说明

> 本站是**纯静态站点**（阿里云轻量 2C0.5G，仅 Nginx，无后端）。
> 讨论区采用 **[giscus](https://giscus.app/zh-CN)**：评论数据全部存放在 **GitHub Discussions**，
> 由 GitHub 负责账号登录、防垃圾与内容审核，本站服务器**零存储、零接口、零负担**。
> 这是个人静态站最安全、最省心的社区方案（国内外大量博客与文档站使用）。

## 为什么这样做最安全

| 风险 | 传统自建后端 | giscus（本方案） |
| --- | --- | --- |
| 垃圾评论/刷屏 | 需自建验证码、风控 | GitHub 账号登录 + 自带防滥用 |
| 内容审核/删除 | 需自建后台 | GitHub 后台直接管理，可封禁、举报 |
| 数据存储 | 需数据库 + 备份 | GitHub Discussions 托管，永久免费 |
| 服务器压力 | 评论接口吃 CPU/内存 | 静态页面 + 第三方 iframe，0.5G 服务器毫无压力 |
| 违法内容风险 | 需自行过滤 + 备案合规 | GitHub 内容政策兜底，可远程删除 |

## 启用步骤（约 3 分钟，一次性）

> **前提：存放讨论的仓库必须是公开仓库**（访客才能看到评论）。
> 若 `hongyuguo.com` 仓库想保持私有，请新建一个专门的公开评论仓库（如 `Gsaecy/hongyuguo-discussions`），
> 把 giscus 装到该公开仓库，`discuss-config.js` 的 `repo` 与 `discussionsUrl` 改为新仓库即可（改后需重新生成 `assets/qr/general.png` 二维码）。

1. **确认仓库公开**
   讨论数据将存在 `Gsaecy/hongyuguo.com`（可换成任意公开仓库）。
   仓库设置 → General → Danger Zone → Change visibility → **Public**。

2. **开启 Discussions**
   仓库 → Settings → General → Features → 勾选 **Discussions**。

3. **安装 giscus App**
   打开 https://github.com/apps/giscus → Configure → 选择该仓库 → Install。
   （不装的话访客无法登录评论。）

4. **创建分类**
   仓库 → Discussions → Categories → New category：
   - 名称：`留言讨论`（英文仓库建议 `Comments`）
   - 类型：**Announcements（公告）** ← 推荐！只有维护者与 giscus 能新建 discussion，杜绝陌生人乱开话题

   「其他话题 · 自由讨论」使用 GitHub 默认的 **General** 分类（开启 Discussions 时自动创建），
   访客在该分类可自由「New discussion」发任意话题。

5. **生成配置**
   打开 https://giscus.app/zh-CN，填写：
   - 仓库：`Gsaecy/hongyuguo.com`
   - 页面 ↔ discussion 映射：**「Discussion 的标题包含特定字符串」**
   - Discussion 分类：刚创建的分类
   - 主题：任意（本站使用自定义主题 `assets/giscus/theme.css`，会自动覆盖）
   把生成代码里的 `data-repo-id` 与 `data-category-id` 填入本站
   `discuss-config.js`，并把 `enabled` 改为 `true`。

6. **重新部署**（`./deploy/make-package.sh` + `./deploy/deploy.sh`）。

完成后：
- 访客点击话题卡片 → 登录 GitHub → 直接留言；**首次有人评论时 giscus 会自动创建对应 discussion**。
- 也可以在 GitHub 上按话题标题（如 `ext-trans-picker`）手动预建 discussion 并置顶。
- 管理评论：仓库 → Discussions → 找到帖子 → 编辑/删除/锁定；垃圾账号可在 GitHub 侧处理。

## 话题与二维码

- 话题数据：`topics.js`，按 `group` 分组：`product`（SafeVault / MaiKer）与 `extension`（4 个 VS Code 扩展）。
- 「其他话题 · 自由讨论」为**站内论坛**（`discuss.html#forum`，`forum.js`）：任意话题站内发起/浏览/回复，
  数据双向同步 GitHub Discussions 的 **General** 分类；未登录访客只读，登录后（复用 giscus 会话）可发帖与评论。
- 二维码：`assets/qr/*.png`，内容为 `https://hongyuguo.com/discuss.html#topic=<slug>`（手机扫码直接进入对应话题并可留言）；
  `general.png` 指向 GitHub Discussions 自由讨论页。新增话题时运行 `python scripts/gen-qr.py` 重新生成。
- 首页 Projects 幕底部一行小字展示扩展案例（带 VS Code 图标），点击名称直达扩展商店页。

## 站内自由讨论论坛（#forum）架构与部署

`discuss.html#forum` 是站内论坛视图（`forum.js`）：

- **浏览**：匿名即可（公开仓库 GraphQL），列表/详情 10 分钟本地缓存，失败回退过期缓存
- **登录**：复用 giscus 会话（localStorage `giscus-session`，OAuth 回调 `?giscus=` 自动存入）
- **发帖/评论**：先经同源 `/giscus-token` 反代向 giscus.app 换取 GitHub 令牌，再调 GitHub GraphQL
  （`createDiscussion` / `addDiscussionComment`），成功后清缓存
- **双向同步**：GitHub 用户的发言直接读取自 GitHub，本站发言写入 GitHub

### 服务器 Nginx 配置（大陆访问必需）

`/etc/nginx/conf.d/hongyuguo.com.conf` 的 `server { }` 内：

```nginx
# 1) 匿名请求自动附加服务器只读令牌（登录用户的 Bearer 令牌透传）
map $http_authorization $gh_auth {
    default "Bearer <服务器只读令牌 github_pat_...>";
    "~^Bearer " $http_authorization;
}

# 2) GitHub GraphQL 同源反代
location = /github-graphql {
    if ($request_method != POST) { return 403; }
    proxy_pass https://api.github.com/graphql;
    proxy_set_header Host api.github.com;
    proxy_set_header Authorization $gh_auth;
    proxy_set_header User-Agent "hongyuguo-forum/1.0";
    proxy_ssl_server_name on;
}

# 3) giscus 令牌接口同源反代（giscus.app 的 CORS 只允许自身域名，必须同源转发）
location = /giscus-token {
    if ($request_method != POST) { return 403; }
    proxy_pass https://giscus.app/api/oauth/token;
    proxy_set_header Host giscus.app;
    proxy_ssl_server_name on;
}
```

只读令牌：GitHub → Fine-grained personal access tokens → 仅 `Gsaecy/hongyuguo.com` → Discussions 只读。
匿名浏览走服务器令牌（5000 次/小时），登录用户用自己令牌；`map` 保证登录请求透传用户令牌。
配置片段文件见 `deploy/nginx-github-graphql.conf.md`。

## 未启用时

`discuss-config.js` 保持 `enabled: false` 时，话题详情页会显示
「前往 GitHub Discussions」的兜底入口，不影响其他功能。

## 常见问题

- **访客没有 GitHub 账号怎么办？** 这是刻意取舍：牺牲少量匿名用户，换取零运维与绝对安全。
  网页右上角有「手机扫码」入口，有 GitHub 账号的手机用户可直接参与。
- **能匿名留言吗？** 不能。如需匿名方案（Waline/Artalk），需要在服务器或 Vercel 上自建后端并自行承担审核与风控。
- **giscus 加载慢/被墙？** giscus 由 Vercel 托管。若个别地区访问慢，可自建：见 giscus 文档 `SELF-HOSTING.md`。

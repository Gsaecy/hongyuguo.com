# hongyuguo.com

> 郭宏宇（Hongyu Guo）的个人网站 — 单屏四幕滚动叙事，荷花池塘视觉。
> Building small software for a better digital life.

**在线地址**：[https://hongyuguo.com](https://hongyuguo.com) · **源码仓库**：[Gsaecy/hongyuguo.com](https://github.com/Gsaecy/hongyuguo.com)

## 特性

- 🎞 **单屏四幕滚动叙事**：fixed 视窗 + 400vh 轨道，滚动依次呈现 Hero → About → Projects → Now/Links
- 🖱 **翻页式滚动**：滚轮方向 = 翻页命令（与滚动距离无关），约 3.2s 平滑动画，背景图全程交叉淡化；近距轻吸附兜底
- 📲 **移动端触摸翻页**：上滑/下滑同样为翻页命令，与桌面体验一致；内容安全居中（超高不裁切）、序号避开固定导航栏
- 🌸 **荷花池塘背景**：三张渲染图随幕切换，Ken Burns 缓慢推进；第三幕 ct8 全屏 cover 最小裁剪
- 🐟 **鱼蛙装饰**：CGmodel 模型渲染图（作者本人创作），镜像/摆动/双帧交替动画，随视窗缩小自适应尺寸与透明度，点击跳转 CGmodel 作品页
- 🛍 **软件产品卡片**：SafeVault、MaiKer 两张平级卡。SafeVault 文案点名「已在 iOS App Store、Mac App Store、Google Play、Microsoft Store 上架」，四家均为商店直链：iOS 与 macOS 是两个独立 App Store 条目（`id6793554270` / `id6793116909?mt=12`），因此拆成两条链接分别指向；中英两版统一使用 `/cn/` 完整链接——实测「省略 slug 的地区无关写法」（如 `apps.apple.com/app/id6793554270`）会 302 落到 App Store Today 首页，属于**无效链接**，故不再采用。Microsoft Store 用带地区参数的写法 `detail/9nsrdwh35hxh?hl=<语言>&gl=HK`：中文版 `hl=zh-CN`、英文版 `hl=en-US`（同地区换语言界面）；不带参数的裸链接会被商店重定向到 `?hl=en-US&gl=CN`，地区并非 HK，故显式指定。href 中的 `&` 统一写成 `&amp;`（浏览器解析后为单个 `&`，已验证 `searchParams` 正确取到 `hl`/`gl`）
- 🖼 **MaiKer 文案取「全功能面」而非只讲新功能**：除新增的三张 3D 互动壁纸外，同时覆盖精选动态壁纸、十种氛围特效（花瓣/萤火/雪花等）、鼠标互动特效（星尘/蝴蝶）、音乐律动时钟与低 CPU 占用。事实来源为官网 `macwall.skin` 的四个功能分区，未编造能力。中文压在约 113 字（旧版 118 字），字数更短但覆盖更全。开头写作「最近上新「锦鲤池」、「浅滩游鱼」、「深海风景」」，用「最近上新」把 3D 壁纸定位为新增内容，而非独占全部篇幅
- ⛔ **不写「每日上新」类更新频率承诺**：官网原文有「每日上新动态壁纸」，但个人精力有限无法保证日更，故站内文案一律改为「精选动态壁纸」（英文 `a curated set of live wallpapers`），只描述能力、不承诺频率。后续若新增任何「每日/每周更新」表述，请先确认能否兑现。注：`now.copy` 段落的「每天学点新东西 / learning something new every day」是个人状态陈述，不涉及产品更新承诺，不在此约束内（改动脚本 `scripts/patch-maiker-no-daily.cjs` 留档）
- ⬇ **MaiKer 商店入口内联进文案，不占独立按钮**：卡片 CTA 只保留「Visit site →」（官网 `macwall.skin`），macOS App Store 下载链接改为分别挂在三个壁纸名称上——「锦鲤池」、「浅滩游鱼」、「深海风景」各自是一个独立 `<a>`（三个链接，不是一个链接包住整个名字串），均指向 `apps.apple.com/cn/app/麦壳壁纸-maiker-…/id6804357926?mt=12`（实测 200 直达应用页）。动机：商店按钮会把「新功能」抬成与软件平级的主推位，隐入文案后正文自解释、版面更轻。实现上须把 `data-i18n`（纯文本注入）改为 `data-i18n-html`（走 `innerHTML`），否则链接会被转义成字面量；行内样式复用既有 `.product-tagline a`（下划线 + 加粗），无需新增 CSS。三处名称均为产品名/中文书名号，中英各自渲染（英文 `koi pond` / `shallow shoals` / `deep sea`），链接文案随语言切换，故不新增 i18n 键（键集仍 zh=95 / en=95）。链接沿用 `/cn/` 完整 slug 写法，理由同 SafeVault：省略 slug 的地区无关写法会 302 落到 App Store Today 首页，属无效链接。`href` 内无 `&` 参数故无需 `&amp;` 转义。改动脚本 `scripts/patch-maiker-inline-store-links.cjs` 留档
- 🧩 **VS Code 扩展案例**：Projects 幕底部一行小字 + VS Code 图标展示 5 个扩展（扩展选择助手、部署环境一键迁移、本地skill快捷调用、毛主席思想指导、DeepSeek-HWChat），点击直达商店页/仓库（扩展占比小，不与软件产品平级；DeepSeek-HWChat 仅在讨论板块单列话题，可跳转自身 GitHub Discussions）
- 💬 **留言讨论板块**（`discuss.html`，独立页面）：软件产品 / VS Code 扩展 / 其他话题三组话题；点进产品与扩展话题可用 GitHub 账号参与讨论、提建议，每张卡片带二维码，手机扫码即可留言
- 🗣 **站内自由讨论论坛**（`discuss.html#forum`，`forum.js`）：任何话题站内发起/浏览/回复，数据双向同步 GitHub Discussions（General 分类）；匿名浏览走服务器只读令牌反代 `/github-graphql`，登录复用 giscus 会话（`/giscus-token` 反代换令牌），含 10 分钟本地缓存与失败回退
- 🔒 **零后端安全方案**：讨论区基于 giscus（数据存 GitHub Discussions，登录/防垃圾/审核全部由 GitHub 承担），静态服务器零负担，配置见 `DISCUSS_SETUP.md`
- 🎨 **Cursor 设计系统**：奶油底 + 墨色文字 + 橙色点缀，源自 [awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
- 🌓 **明暗主题自适应 favicon**：`prefers-color-scheme` 切换黑/白签名图标
- 🌐 **全局中英文切换**：导航右上角「中文 / EN」，随浏览器语言自动选择、localStorage 记忆；文案字典在 `i18n.js`（`data-i18n` 纯文本 / `data-i18n-html` 含链接），中文文案为优雅意译
- 🛠 **文案改动一律走带断言的补丁脚本**（`scripts/patch-*.cjs`，先预览后 `--apply`）。两条必须遵守的规则：① 每处替换的 `from` 必须精确命中 1 次，命中数不符则整体中止、不写任何文件；② **同一文件的多处补丁必须累积应用**（读一次 → 依次 replace → 最后统一写回），若每处各自「读原始内容 → 写回」，后写会用旧内容覆盖先写的改动。第二条是真实踩过的坑：`patch-maiker-inline-store-links.cjs` 首版就因此把 index.html 的三处改动压成只剩版本号一处，后改为按文件累积 + `appliedTest` 幂等判据（已生效则跳过，可安全重跑）才正确
- 📱 移动端自适应：鱼蛙渐隐至文字底层、Links 两列网格左对齐、无横向溢出
- 纯静态站点：零构建、零依赖，原生 HTML/CSS/JS

## 结构

```
hongyuguo.com/
├── DESIGN.md            # 设计系统（当前生效：cursor，来自 awesome-design-md）
├── index.html           # 正式版（Cursor 风格单屏四幕滚动叙事，与 preview-cursor.html 同源）
├── discuss.html         # 留言讨论板块（话题卡片 → 话题详情 + giscus 评论 + 二维码）
├── discuss.css          # 讨论板块样式（与首页同一套 Cursor 设计系统）
├── discuss.js           # 讨论板块逻辑：话题渲染、#topic= 哈希路由、giscus 加载
├── discuss-config.js    # giscus 配置（按 DISCUSS_SETUP.md 三步启用）
├── forum.js             # 站内自由讨论论坛（#forum 列表/详情/发帖/评论，双向同步 GitHub Discussions）
├── topics.js            # 话题数据（SafeVault / MaiKer + 5 个 VS Code 扩展，中英双语）
├── i18n.js              # 全站中英文文案字典 + 语言切换（data-i18n / data-i18n-html）
├── DISCUSS_SETUP.md     # 讨论区启用与审核说明
├── preview-cursor.css   # Cursor 风格样式（正式版与预览页共用）
├── preview-cursor-pond.js  # 预览页滚动引擎：滚轮/触摸翻页、近距吸附、场景切换、鱼蛙布局
├── pond-scroll-video.js  # 正式版滚动引擎：视频 scrub(不自动播放)+三图交叉淡化托底+视口适配
├── styles.css           # 旧 Apple 风格样式（已退役，保留备用）
├── preview-cursor.html  # Cursor 风格预览页（与正式版同源，带英文预览横幅）
├── preview-replicate.html  # Replicate 风格预览页（候补风格）
├── preview-replicate.css   # Replicate 风格预览样式
├── preview-3d.html      # 3D 特效预览页（Replicate 基底 + Vanta 粒子网 + Atropos 视差）
├── preview-3d.css       # 3D 特效预览样式
├── preview-cyber.html   # 赛博朋克 3D 预览页（程序化机械头颅 + 能量管线 + 鼠标视差）
├── preview-cyber.css    # 赛博朋克预览样式
├── preview-cyber.js     # 赛博朋克 Three.js 场景（零外部模型，本地 three.min.js）
├── deploy/
│   ├── deploy.sh            # 部署脚本（SERVER=root@ip 一键上传+解压+备份）
│   ├── make-package.sh      # 打包部署文件为 hongyuguo-site.tar.gz
│   ├── nginx-github-graphql.conf.md  # 论坛 GitHub GraphQL 同源反代配置（大陆访问必需）
│   └── hongyuguo-site.tar.gz # 部署包（index.html + css + js + assets + 三张荷花图）
├── source/              # 源素材（不部署，仅存档）
│   ├── 头像.jpg         # 头像原图（assets/avatar.jpg 为 640px 压缩版）
│   ├── HongyuGuo-signature.png  # 签名原图（旧黑白 favicon 方案，已弃用）
│   ├── favicon.png       # 当前标签图标源图（纯黑前景，assets/favicon-black/white.png 为裁剪黑白版）
│   ├── 鲤鱼.png         # 鲤鱼源图（assets/carp.png 为拷贝）
│   ├── 鲤鱼.jpg / 青蛙.jpg           # 早期渲染图
│   ├── 青蛙 01带阴影.png / 青蛙 02带阴影.png  # 青蛙源图（assets/frog1/2.png 为拷贝）
│   └── 青蛙 01.png / 青蛙 02.png     # 旧镂空版（已弃用，存档）
├── design/
│   └── candidates/
│       ├── cursor.md    # Cursor 设计系统候选（来自 awesome-design-md）
│       └── replicate.md # Replicate 设计系统候选（来自 awesome-design-md）
└── assets/
    ├── avatar.webp      # 真人头像（640px WebP，源文件在 source/头像.jpg）
    ├── favicon-black.png / favicon-white.png  # 标签图标（随 prefers-color-scheme 自动切换黑/白）
    ├── carp.webp        # 鲤鱼装饰（作者本人 CGmodel 模型渲染图，源图在 source/鲤鱼.png）
    ├── frog1.webp / frog2.webp  # 青蛙双帧（带阴影，6s 交替渐隐动画，源图在 source/）
    ├── video/           # 荷花池视频 scrub 资源
    │   ├── hehuachi-orbit.mp4   # 101 帧渲染序列压缩视频（1280×852，967KB）
    │   ├── hehuachi-poster.jpg  # 首屏 poster（与视频首帧同帧，56KB）
    │   └── hehuachi/            # 101 帧序列（仅本地留存供重压视频，不部署）
    ├── extensions/      # 5 个 VS Code 扩展图标（WebP 128×128；DeepSeek-HWChat 由仓库 resources/logo.png 转出）
    ├── products/        # SafeVault / MaiKer 产品图标（WebP）
│   ├── qr/              # 讨论区二维码（scripts/gen-qr.py 生成）
│   ├── giscus/theme.css # giscus 自定义主题（奶油底 + 墨色 + 橙，与本站一致）
    ├── icons/           # 社交图标（x/github/instagram/tiktok/bilibili/red，共 6 个）
    └── vendor/          # 3D 库本地化（仅 3D 预览页需要，Cursor 版不依赖）
        ├── three.min.js      # three.js 0.137（Vanta 依赖）
        ├── vanta.net.min.js  # Vanta NET 粒子网背景（0.5.24，MIT）
        ├── atropos.min.js    # Atropos 3D 视差（2.0.2，MIT）
        ├── atropos.min.css   # Atropos 样式
        ├── MTLLoader.js     # three.js 0.137 MTL 材质加载器
        └── OBJLoader.js     # three.js 0.137 OBJ 模型加载器
├── pond/              # 荷花池塘场景（三张压缩图被正式版托底与预览版引用）
│   ├── ctd2.jpg / ct7.jpg / ct8.jpg  # 滚动漫游背景图（28/50/56KB，ct8 为新改版 16:9 横图）
│   ├── sc/               # OBJ/MTL/贴图（仅 3D 版需要）
│   └── Map/              # 原始 PSD 贴图（仅源文件不部署）
└── 3d-model-prompts.md  # 3D 模型生成提示词（机器人方案已弃用，保留备用）
```

## 风格切换

当前正式风格为 **Cursor**（已上线）。历史风格：Apple（旧正式版，`styles.css` 保留）。候选风格可本地预览：
- Cursor（正式）：`http://127.0.0.1:8711/`
- Replicate：`http://127.0.0.1:8711/preview-replicate.html`
- 3D 特效：`http://127.0.0.1:8711/preview-3d.html`
- 赛博朋克 3D：`http://127.0.0.1:8711/preview-cyber.html`

若日后切换风格：把对应 preview-*.html 内容替换 `index.html`（3D 版需连同 `assets/vendor/` 与 `sc/` 一起部署）。
3D 特效用法与性能规则见技能 `~/.copilot/skills/web-3d-effects/SKILL.md`。

### 荷花池塘部署注意

正式版（index.html）hero 背景为**压缩视频滚动 scrub**：101 帧 3D 环绕镜头渲染序列已压成
H.264 MP4（`assets/video/hehuachi-orbit.mp4`，约 967KB/1280×852，原帧序列 10MB/101 请求），视频
**不自动播放**，仅随滚动进度 seek 到对应帧（`pond-scroll-video.js`）；首屏以
`hehuachi-poster.jpg` 作 poster 垫底。**托底方案**：视频加载失败（重试一次）或 4 秒内未出首帧
（极慢网）时，自动切换**三张图交叉淡化 + Ken Burns 推进**（`pond/ctd2.jpg` 28KB / `ct7.jpg`
50KB / `ct8.jpg` 56KB，共 134KB）；101 帧序列已不再部署（仅本地留存供重压视频）。不再依赖
three.js 与 OBJ 模型。

Cursor 预览版（preview-cursor.html）仍为三张图片滚动漫游（ctd2 → ct7 → ct8 交叉淡化 +
缓慢推进），需部署 `preview-cursor-pond.js` 与 `pond/ctd2.jpg / ct7.jpg / ct8.jpg`。
`assets/vendor/` 中的 OBJ/MTL 加载器与 `sc/` 模型文件仅 3D 版预览页（preview-3d / preview-cyber）需要。

## 内容板块（单屏四幕滚动叙事）

页面永远只显示一屏（sticky 视窗 + 400vh 滚动轨道），滚动依次呈现：
1. **第一幕**：荷花池环绕镜头起始帧 + 姓名/一句话（Hero）
2. **第二幕**：镜头推进 + About 玻璃卡文案
3. **第三幕**：镜头继续环绕 + Projects 两个产品卡 + 底部一行 VS Code 扩展案例小字
4. **第四幕**：结尾帧渐隐变白 + Now / Links / 留言讨论入口（含扫码）/ 页脚
背景为 101 帧压缩视频按滚动进度 scrub（视频不自动播放，仅随滚动 seek 到对应帧）。
导航（About/Projects/Now/Links/Community）点击平滑滚动到对应幕；Community 进入留言讨论板块。

## 留言讨论板块（discuss.html，独立页面）

- **软件产品**：SafeVault、MaiKer 两个话题卡片；
- **VS Code 扩展**：扩展选择助手、部署环境一键迁移、本地skill快捷调用、毛主席思想指导，紧凑话题行；
- **其他话题**：自由讨论入口直达 GitHub Discussions（General 分类），访客可发起任意话题；
- **点进话题**：同一页面内切换到话题详情，嵌入 giscus 评论区（登录 GitHub 即可留言，首次评论自动创建 discussion）；
- **手机扫码**：每张话题卡与详情页均带二维码（`assets/qr/`），扫码直达对应话题；
- **安全与容量**：数据全部存 GitHub Discussions（登录防垃圾、后台可审核），本站 0.5G 静态服务器零负担；
- **启用步骤**：见 `DISCUSS_SETUP.md`（公开仓库 + 开 Discussions + 装 giscus app + 填 `discuss-config.js`）。

## 部署（阿里云轻量 · 新加坡）

生产环境：**阿里云轻量应用服务器（新加坡 ap-southeast-1，公网 IP 47.84.21.65，2C0.5G，Alibaba Cloud Linux 4）**，免备案（海外节点）。

- 环境：仅 **Nginx**（无面板），站点根目录 `/www/wwwroot/hongyuguo.com`；
- Nginx 站点配置：`/etc/nginx/conf.d/hongyuguo.com.conf`（80 强制跳 443 + 443 SSL + `.well-known/acme-challenge/` 静态放行）；
- SSL：**acme.sh + Let's Encrypt**，证书文件 `/etc/nginx/cert/hongyuguo.com.{pem,key}`；acme.sh 自带每天 cron 续期任务，到期自动续签并 `systemctl reload nginx`，无需人工干预；
- 历史：曾部署在国内阿里云 ECS，因**域名未 ICP 备案被阿里云拦截（403 Non-compliance ICP Filing）**导致外网与 LE 验证全部失败，2026-09-01 迁至新加坡服务器。

部署方式（纯静态站，无需构建）：

```bash
# 方式零：打包（新增/修改文件后先生成部署包）
./deploy/make-package.sh

# 方式一：一键脚本（推荐，自动备份旧版本）
SERVER=root@47.84.21.65 ./deploy/deploy.sh
# 网站根目录不是默认 /www/wwwroot/hongyuguo.com 时：
SERVER=root@服务器IP SITE_DIR=/www/wwwroot/其他目录 ./deploy/deploy.sh

# 方式二：手动（scp 上传 deploy/hongyuguo-site.tar.gz 到服务器 /tmp 后解压）
scp deploy/hongyuguo-site.tar.gz root@47.84.21.65:/tmp/
ssh root@47.84.21.65 "tar xzf /tmp/hongyuguo-site-full.tar.gz -C /www/wwwroot/hongyuguo.com"
```

部署包 `deploy/hongyuguo-site.tar.gz` 含：`index.html`、`preview-cursor.css`、`pond-scroll-video.js`、`assets/`（头像/鱼/蛙/图标/**荷花池压缩视频**）与三张压缩后的荷花图（`pond/ctd2|ct7|ct8.jpg`，托底与 Cursor 预览版用）；自动排除 `pond/Map`、`pond/sc`（3D 源素材）与 `assets/video/hehuachi/`（101 帧序列，已不再部署）。
改代码后重新生成部署包：

```bash
cd "/Users/guohongyu/AI projects/hongyuguo.com" && \
tar czf deploy/hongyuguo-site.tar.gz index.html preview-cursor.css pond-scroll-video.js assets "pond/ctd2.jpg" "pond/ct7.jpg" "pond/ct8.jpg"
```

⚠️ 服务器登录：默认用户是 `admin`，安装软件需先 `su - root`；root SSH 密码登录可用。

⚠️ acme.sh 踩坑记录：注册账号必须指定 `--server letsencrypt`（默认 ZeroSSL 会报 EAB 错误）；邮箱必须纯 ASCII；首次装好后账号邮箱若填错，需改 `/root/.acme.sh/account.conf` 的 `ACCOUNT_EMAIL` 再 `--register-account`。

⚠️ Links 板块的 6 个社交链接已替换为真实账号（X/GitHub/Instagram/TikTok/哔哩哔哩/小红书）。

⚠️ 改 CSS 后注意：部署包必须同时包含最新 `preview-cursor.css` 与 `pond-scroll-video.js`，避免线上样式/脚本与 HTML 不匹配。

## 致谢

- 荷花池塘模型与鱼蛙素材：作者本人创作（[CGmodel 作品页](https://www.cgmodel.com/model/551075.html)）
- 设计系统：[awesome-design-md](https://github.com/VoltAgent/awesome-design-md)（MIT）

## License

站点代码与素材 © Hongyu Guo，保留所有权利。

## giscus 自定义主题跨域（Nginx 必需配置）

评论区使用自定义主题 `assets/giscus/theme.css`（与网站奶油底/橙色一致）。
giscus.app 跨域拉取该 CSS，服务器必须放行 CORS，否则浏览器拦截、评论区显示默认样式。
在 `/etc/nginx/conf.d/hongyuguo.com.conf` 的 `server { }` 块内加：

```nginx
# giscus 自定义主题跨域加载
location = /assets/giscus/theme.css {
    add_header Access-Control-Allow-Origin "https://giscus.app";
}
```

改完执行 `nginx -t && systemctl reload nginx`。

# hongyuguo.com

> 郭宏宇（Hongyu Guo）的个人网站 — 单屏四幕滚动叙事，荷花池塘视觉。
> Building small software for a better digital life.

**在线地址**：[https://hongyuguo.com](https://hongyuguo.com) · **源码仓库**：[Gsaecy/hongyuguo.com](https://github.com/Gsaecy/hongyuguo.com)

## 特性

- 🎞 **单屏四幕滚动叙事**：fixed 视窗 + 400vh 轨道，滚动依次呈现 Hero → About → Projects → Now/Links
- 🖱 **翻页式滚动**：滚轮方向 = 翻页命令（与滚动距离无关），约 3.2s 平滑动画，背景图全程交叉淡化
- 🌸 **荷花池塘背景**：三张渲染图随幕切换，Ken Burns 缓慢推进；第三幕 ct8 全屏 cover 最小裁剪
- 🐟 **鱼蛙装饰**：CGmodel 模型渲染图（作者本人创作），镜像/摆动/双帧交替动画，随视窗缩小自适应尺寸与透明度，点击跳转 CGmodel 作品页
- 🎨 **Cursor 设计系统**：奶油底 + 墨色文字 + 橙色点缀，源自 [awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
- 🌓 **明暗主题自适应 favicon**：`prefers-color-scheme` 切换黑/白签名图标
- 📱 移动端自适应：鱼蛙渐隐至文字底层、无横向溢出
- 纯静态站点：零构建、零依赖，原生 HTML/CSS/JS

## 结构

```
hongyuguo.com/
├── DESIGN.md            # 设计系统（当前生效：cursor，来自 awesome-design-md）
├── index.html           # 正式版（Cursor 风格单屏四幕滚动叙事，与 preview-cursor.html 同源）
├── preview-cursor.css   # Cursor 风格样式（正式版与预览页共用）
├── preview-cursor-pond.js  # 滚动叙事引擎：四幕场景切换 + 鱼蛙装饰自适应布局/点击跳转
├── styles.css           # 旧 Apple 风格样式（已退役，保留备用）
├── preview-cursor.html  # Cursor 风格预览页（与正式版同源，带预览横幅）
├── preview-replicate.html  # Replicate 风格预览页（候补风格）
├── preview-replicate.css   # Replicate 风格预览样式
├── preview-3d.html      # 3D 特效预览页（Replicate 基底 + Vanta 粒子网 + Atropos 视差）
├── preview-3d.css       # 3D 特效预览样式
├── preview-cyber.html   # 赛博朋克 3D 预览页（程序化机械头颅 + 能量管线 + 鼠标视差）
├── preview-cyber.css    # 赛博朋克预览样式
├── preview-cyber.js     # 赛博朋克 Three.js 场景（零外部模型，本地 three.min.js）
├── deploy/
│   ├── deploy.sh            # 宝塔部署脚本（SERVER=root@ip 一键上传+解压+备份）
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
    ├── avatar.jpg       # 真人头像（640px 压缩版，源文件在 source/头像.jpg）
    ├── favicon-black.png / favicon-white.png  # 标签图标（随 prefers-color-scheme 自动切换黑/白）
    ├── carp.png         # 鲤鱼装饰（作者本人 CGmodel 模型渲染图，源图在 source/鲤鱼.png）
    ├── frog1.png / frog2.png  # 青蛙双帧（带阴影，6s 交替渐隐动画，源图在 source/）
    ├── icons/           # 社交图标（x/github/instagram/tiktok/bilibili/red，共 6 个）
    └── vendor/          # 3D 库本地化（仅 3D 预览页需要，Cursor 版不依赖）
        ├── three.min.js      # three.js 0.137（Vanta 依赖）
        ├── vanta.net.min.js  # Vanta NET 粒子网背景（0.5.24，MIT）
        ├── atropos.min.js    # Atropos 3D 视差（2.0.2，MIT）
        ├── atropos.min.css   # Atropos 样式
        ├── MTLLoader.js     # three.js 0.137 MTL 材质加载器
        └── OBJLoader.js     # three.js 0.137 OBJ 模型加载器
├── pond/              # 荷花池塘场景（三张渲染图被正式版引用）
│   ├── ctd2.jpg / ct7.jpg / ct8.png  # 滚动漫游背景图（ct8 为新改版 16:9 横图）
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

Cursor 版 hero 已改为**三张图片滚动漫游**（ctd2 → ct7 → ct8 交叉淡化 + 缓慢推进），
不再依赖 three.js 与 OBJ 模型。部署时上传：`index.html`、`styles.css`、
`preview-cursor-pond.js`（若选 Cursor 版）及 `pond/ctd2.jpg / ct7.jpg / ct8.png`。
`assets/vendor/` 中的 OBJ/MTL 加载器与 `sc/` 模型文件仅 3D 版预览页（preview-3d / preview-cyber）需要。

## 内容板块（单屏四幕滚动叙事）

页面永远只显示一屏（sticky 视窗 + 400vh 滚动轨道），滚动依次呈现：
1. **第一幕**：ctd2 荷花图 + 姓名/一句话（Hero）
2. **第二幕**：切换到 ct7 图 + About 玻璃卡文案
3. **第三幕**：切换到 ct8 图 + Projects 两个产品卡
4. **第四幕**：ct8 渐隐变白 + Now / Links / 页脚
导航（About/Projects/Now/Links）点击平滑滚动到对应幕。

## 部署（宝塔）

纯静态站点，无需构建。宝塔建站（域名 + SSL 已配置）后执行：

```bash
# 方式一：一键脚本（推荐，自动备份旧版本）
SERVER=root@服务器IP ./deploy/deploy.sh
# 网站根目录不是默认 /www/wwwroot/hongyuguo.com 时：
SERVER=root@服务器IP SITE_DIR=/www/wwwroot/其他目录 ./deploy/deploy.sh

# 方式二：手动（宝塔面板 → 文件，上传 deploy/hongyuguo-site.tar.gz 到网站根目录后解压）
```

部署包 `deploy/hongyuguo-site.tar.gz` 含：`index.html`、`preview-cursor.css`、`preview-cursor-pond.js`、`assets/`（头像/鱼/蛙/图标）与三张荷花图（`pond/ctd2|ct7.jpg`、`pond/ct8.png`）。
改代码后重新生成部署包：

```bash
cd "/Users/guohongyu/AI projects/hongyuguo.com" && \
tar czf deploy/hongyuguo-site.tar.gz index.html preview-cursor.css preview-cursor-pond.js assets "pond/ctd2.jpg" "pond/ct7.jpg" "pond/ct8.png"
```

⚠️ Links 板块的 6 个社交链接已替换为真实账号（X/GitHub/Instagram/TikTok/哔哩哔哩/小红书）。

⚠️ 改 CSS 后注意：部署包必须同时包含最新 `preview-cursor.css` 与 `preview-cursor-pond.js`，避免线上样式/脚本与 HTML 不匹配。

## 致谢

- 荷花池塘模型与鱼蛙素材：作者本人创作（[CGmodel 作品页](https://www.cgmodel.com/model/551075.html)）
- 设计系统：[awesome-design-md](https://github.com/VoltAgent/awesome-design-md)（MIT）

## License

站点代码与素材 © Hongyu Guo，保留所有权利。

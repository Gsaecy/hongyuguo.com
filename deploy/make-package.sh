#!/usr/bin/env bash
# 生成 hongyuguo.com 部署包 deploy/hongyuguo-site.tar.gz
# 在仓库根目录执行: ./deploy/make-package.sh
set -euo pipefail

cd "$(dirname "$0")/.."

# 部署文件清单（静态站点，无构建）
FILES=(
  index.html
  discuss.html
  preview-cursor.css
  discuss.css
  pond-scroll-video.js
  i18n.js
  forum.js
  discuss.js
  discuss-config.js
  topics.js
  preview-cursor.html
  preview-cursor-pond.js
  preview-replicate.html
  preview-replicate.css
  preview-3d.html
  preview-3d.css
  preview-cyber.html
  preview-cyber.css
  preview-cyber.js
  assets/
  pond/
)

echo "→ 打包部署文件…"
mkdir -p deploy
rm -f deploy/hongyuguo-site.tar.gz
# 排除 pond/Map、pond/sc(3ds Max/FBX/PSD 等源素材)与 101 帧序列(视频已替代,仅本地留存)
tar czf deploy/hongyuguo-site.tar.gz --exclude='pond/Map' --exclude='pond/sc' --exclude='assets/video/hehuachi' "${FILES[@]}"
echo "✓ 已生成 deploy/hongyuguo-site.tar.gz"
du -h deploy/hongyuguo-site.tar.gz

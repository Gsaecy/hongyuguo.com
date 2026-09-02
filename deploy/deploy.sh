#!/usr/bin/env bash
# hongyuguo.com 部署脚本（阿里云轻量 · 新加坡，Nginx 环境）
# 用法:
#   SERVER=root@1.2.3.4 ./deploy/deploy.sh        # 默认网站目录 /www/wwwroot/hongyuguo.com
#   SERVER=root@1.2.3.4 SITE_DIR=/www/wwwroot/xxx ./deploy/deploy.sh
set -euo pipefail

SERVER="${SERVER:?请设置 SERVER，例如 SERVER=root@1.2.3.4}"
SITE_DIR="${SITE_DIR:-/www/wwwroot/hongyuguo.com}"
LOCAL_TAR="$(cd "$(dirname "$0")" && pwd)/hongyuguo-site.tar.gz"

[ -f "$LOCAL_TAR" ] || { echo "找不到 $LOCAL_TAR，请先在 deploy/ 下生成部署包"; exit 1; }

echo "→ 上传到 ${SERVER}:/tmp/hongyuguo-incoming.tar.gz"
scp "$LOCAL_TAR" "${SERVER}:/tmp/hongyuguo-incoming.tar.gz"

echo "→ 服务器解压到 ${SITE_DIR}（旧版本自动备份）"
ssh "$SERVER" "set -e; \
  rm -rf /tmp/hongyuguo-incoming && mkdir -p /tmp/hongyuguo-incoming && \
  tar xzf /tmp/hongyuguo-incoming.tar.gz -C /tmp/hongyuguo-incoming && \
  [ -d '${SITE_DIR}' ] && cp -r '${SITE_DIR}' '${SITE_DIR}_backup_\$(date +%Y%m%d_%H%M%S)' || true; \
  mkdir -p '${SITE_DIR}' && cp -r /tmp/hongyuguo-incoming/* '${SITE_DIR}/'"

echo "✓ 部署完成，请访问 https://hongyuguo.com 验证"

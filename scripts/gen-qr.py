# -*- coding: utf-8 -*-
"""生成 hongyuguo.com 讨论区二维码（本地静态 PNG，不依赖任何外部服务）。

用法: python scripts/gen-qr.py
输出: assets/qr/*.png
"""
import os

import qrcode

BASE = "https://hongyuguo.com"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "qr")

# 其他话题走 GitHub Discussions（与 discuss-config.js 的 discussionsUrl 保持一致）
GITHUB_DISCUSSIONS = "https://github.com/Gsaecy/hongyuguo.com/discussions"

TOPICS = [
    ("discuss", f"{BASE}/discuss.html"),
    ("safevault", f"{BASE}/discuss.html#topic=safevault"),
    ("maiker", f"{BASE}/discuss.html#topic=maiker"),
    ("ext-trans-picker", f"{BASE}/discuss.html#topic=ext-trans-picker"),
    ("dev-env-sync", f"{BASE}/discuss.html#topic=dev-env-sync"),
    ("local-skill-quick-launch", f"{BASE}/discuss.html#topic=local-skill-quick-launch"),
    ("chairmanmao-guide-life", f"{BASE}/discuss.html#topic=chairmanmao-guide-life"),
    ("general", GITHUB_DISCUSSIONS),
]

os.makedirs(OUT, exist_ok=True)

for slug, url in TOPICS:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=1,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#26251e", back_color="#ffffff")
    img.save(os.path.join(OUT, f"{slug}.png"))
    print(f"OK assets/qr/{slug}.png  <-  {url}")

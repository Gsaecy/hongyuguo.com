# -*- coding: utf-8 -*-
"""生成 SafeVault 方形话题图标：群青蓝(#00387B)盾牌 + 白色对勾。
源：safevault-service.online/public/favicon.svg（44x44 viewBox）。
输出：assets/products/safevault.png（256x256 透明底 PNG）
"""
import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "products", "safevault.png")

NAVY = (0, 56, 123, 255)  # #00387B
WHITE = (255, 255, 255, 255)

S = 1024  # 4x 超采样抗锯齿
K = S / 44.0  # viewBox 44 -> 1024


def P(x, y):
    return (x * K, y * K)


def bezier(p0, p1, p2, p3, n=48):
    pts = []
    for i in range(n + 1):
        t = i / n
        mt = 1 - t
        x = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
        y = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# 盾牌轮廓（右半边曲线 -> 底尖 -> 左半边曲线 -> 顶部）
shield = [P(22, 3.5), P(37, 8.4), P(37, 19.2)]
shield += bezier((37, 19.2), (37, 28.4), (31.2, 35.8), (22, 40.5))
shield += bezier((22, 40.5), (12.8, 35.8), (7, 28.4), (7, 19.2))
shield += [P(7, 8.4)]
d.polygon(shield, fill=NAVY)

# 白色对勾
w = int(4.0 * K)
d.line([P(13.5, 21.5), P(19.7, 27.7), P(31.5, 13.5)], fill=WHITE, width=w,
       joint="curve")

img = img.resize((256, 256), Image.LANCZOS)
img.save(OUT)
print("OK", OUT)

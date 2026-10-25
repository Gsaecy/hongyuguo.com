#!/usr/bin/env node
/**
 * MaiKer 文案改版 v2
 * 需求：原文案只讲新增的 3D 互动壁纸，需覆盖其余基本功能与特色，且控制字数。
 * 事实来源：https://macwall.skin 官网功能分区
 *   01 动态壁纸：云端精选静态与动态壁纸，每日上新
 *   02 循环特效：花瓣飘落、萤火漫游、雪花轻舞、爱心闪耀……十种氛围特效
 *   03 鼠标互动：星尘光尾 II、七彩蝴蝶、火星四溅
 *   04 音乐律动时钟：玲珑幻彩、时空波纹、霓虹灯牌，时钟随音乐节奏律动
 *   轻巧：CPU 占用极低，不打扰工作
 * 每处替换必须精确命中 1 次，否则整体中止、不写任何文件。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const ZH_OLD =
  '锦鲤池、浅滩游鱼、深海风景——三张实时渲染的 3D 互动壁纸：光标停在哪儿，锦鲤就游向哪儿；点一下水面，涟漪慢慢荡开；四季与日光随日期自己流转。再配上飘雪与萤火、随鼠标绽放的星光、踩着音乐节拍律动的时钟——每一次点亮屏幕，都是一场新的相遇。';

const ZH_NEW =
  '锦鲤池、浅滩游鱼、深海风景——三张实时渲染的 3D 互动壁纸，光标到哪儿鱼群跟到哪儿，点一下水面涟漪荡开。再配上每日上新的动态壁纸、花瓣与萤火等十种氛围特效、随鼠标绽放的星尘蝴蝶，以及跟着节拍律动的桌面时钟。占用极低，安静陪你工作。';

const EN_OLD =
  'Koi pond, shallow shoals, deep sea — three real-time 3D interactive wallpapers: koi swim toward wherever your cursor rests, a click sends ripples across the water, and seasons and daylight drift with the calendar. Add drifting snow and fireflies, stardust blooming under your cursor, and a clock pulsing to your music — every wake of the screen is a new encounter.';

const EN_NEW =
  'Koi pond, shallow shoals, deep sea — three real-time 3D interactive wallpapers where fish follow your cursor and a click sends ripples across the water. Plus daily-refreshed live wallpapers, ten ambient effects like falling petals and drifting fireflies, stardust and butterflies that bloom under your mouse, and a clock pulsing to your music. Light on CPU, quiet while you work.';

const TOPIC_ZH_OLD =
  '三张实时渲染的 3D 互动壁纸（锦鲤池、浅滩游鱼、深海风景），还有动态壁纸与音乐律动时钟。';
const TOPIC_ZH_NEW =
  '3D 互动壁纸、每日上新动态壁纸、氛围与鼠标特效、音乐律动时钟——让桌面活起来。';

const TOPIC_EN_OLD =
  'Three real-time 3D interactive wallpapers — koi pond, shallows, deep sea — plus live wallpapers and music-reactive clocks.';
const TOPIC_EN_NEW =
  '3D interactive wallpapers, daily-refreshed live wallpapers, ambient and cursor effects, and music-reactive clocks.';

/** 每项：[文件, 旧串, 新串, 期望命中次数] */
const edits = [
  ['i18n.js', ZH_OLD, ZH_NEW, 1],
  ['i18n.js', EN_OLD, EN_NEW, 1],
  ['index.html', EN_OLD, EN_NEW, 1],
  ['topics.js', TOPIC_ZH_OLD, TOPIC_ZH_NEW, 1],
  ['topics.js', TOPIC_EN_OLD, TOPIC_EN_NEW, 1],
  // 缓存版本号：不升会继续用旧 i18n / topics
  ['index.html', 'i18n.js?v=20', 'i18n.js?v=21', 1],
  ['discuss.html', 'i18n.js?v=20', 'i18n.js?v=21', 1],
  ['discuss.html', 'topics.js?v=9', 'topics.js?v=10', 1],
];

const cache = new Map();
function read(f) {
  if (!cache.has(f)) cache.set(f, fs.readFileSync(path.join(ROOT, f), 'utf8'));
  return cache.get(f);
}

// 1) 先全量校验命中次数，任一不符即中止
let bad = 0;
for (const [file, from, , expect] of edits) {
  const n = read(file).split(from).length - 1;
  if (n !== expect) {
    bad++;
    console.error(`✗ ${file} 命中 ${n} 次，期望 ${expect}：「${from.slice(0, 40)}…」`);
  }
}
if (bad) {
  console.error('\n中止：未写入任何文件。');
  process.exit(1);
}
console.log('✓ 8 处替换全部精确命中 1 次\n');

// 2) 逐项写入
for (const [file, from, to] of edits) {
  cache.set(file, read(file).split(from).join(to));
}
for (const [file, text] of cache) {
  fs.writeFileSync(path.join(ROOT, file), text);
}

// 3) 字数对比
const zhLen = (s) => s.replace(/\s/g, '').length;
console.log('中文：旧 %d 字 → 新 %d 字', zhLen(ZH_OLD), zhLen(ZH_NEW));
console.log('英文：旧 %d 字符 → 新 %d 字符', EN_OLD.length, EN_NEW.length);
console.log('\n写入完成：' + [...cache.keys()].join(', '));

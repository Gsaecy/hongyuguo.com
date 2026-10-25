#!/usr/bin/env node
/**
 * 移除 MaiKer 文案中的「每日上新」承诺（精力有限，无法每日更新）。
 * 保留「动态壁纸」这一核心能力，改为「精选动态壁纸」——不承诺更新频率。
 *
 * 每条替换必须精确命中预期次数，任一不符即整体中止，不写任何文件。
 * 用法: node scripts/patch-maiker-no-daily.cjs [--apply]
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const edits = [
  {
    file: 'i18n.js',
    label: 'i18n 中文 · 每日上新 → 精选',
    from: '再配上每日上新的动态壁纸、',
    to: '再配上精选动态壁纸、',
    count: 1,
  },
  {
    file: 'i18n.js',
    label: 'i18n 英文 · daily-refreshed → curated',
    from: 'Plus daily-refreshed live wallpapers, ',
    to: 'Plus a curated set of live wallpapers, ',
    count: 1,
  },
  {
    file: 'index.html',
    label: 'index.html 静态兜底（英文）',
    from: 'Plus daily-refreshed live wallpapers, ',
    to: 'Plus a curated set of live wallpapers, ',
    count: 1,
  },
  {
    file: 'topics.js',
    label: 'topics 中文 taglineZh',
    from: '3D 互动壁纸、每日上新动态壁纸、',
    to: '3D 互动壁纸、精选动态壁纸、',
    count: 1,
  },
  {
    file: 'topics.js',
    label: 'topics 英文 tagline',
    from: '3D interactive wallpapers, daily-refreshed live wallpapers, ',
    to: '3D interactive wallpapers, curated live wallpapers, ',
    count: 1,
  },
  {
    file: 'README.md',
    label: 'README 功能覆盖说明',
    from: '每日上新的动态壁纸',
    to: '精选动态壁纸',
    count: 1,
  },
];

// 缓存版本：i18n.js 21→22，topics.js 10→11
const versionEdits = [
  {
    file: 'index.html',
    label: 'index.html 缓存版本',
    from: 'i18n.js?v=21',
    to: 'i18n.js?v=22',
    count: 1,
  },
  {
    file: 'discuss.html',
    label: 'discuss.html i18n 缓存版本',
    from: 'i18n.js?v=21',
    to: 'i18n.js?v=22',
    count: 1,
  },
  {
    file: 'discuss.html',
    label: 'discuss.html topics 缓存版本',
    from: 'topics.js?v=10',
    to: 'topics.js?v=11',
    count: 1,
  },
];

const all = [...edits, ...versionEdits];
const buffers = new Map();
const problems = [];

for (const e of all) {
  if (!buffers.has(e.file)) {
    const abs = path.join(root, e.file);
    buffers.set(e.file, fs.readFileSync(abs, 'utf8'));
  }
  const src = buffers.get(e.file);
  const actual = src.split(e.from).length - 1;
  if (actual !== e.count) {
    problems.push(`${e.file} :: ${e.label} —— 预期命中 ${e.count} 次，实际 ${actual} 次`);
  }
}

if (problems.length) {
  console.error('❌ 中止：替换前提不成立，未写入任何文件。');
  for (const p of problems) console.error('   - ' + p);
  process.exit(1);
}

for (const e of all) {
  const src = buffers.get(e.file);
  buffers.set(e.file, src.replace(e.from, e.to));
  console.log(`✅ ${e.file} :: ${e.label}`);
}

if (APPLY) {
  for (const [file, content] of buffers) {
    fs.writeFileSync(path.join(root, file), content);
  }
  console.log('\n💾 已写入磁盘。');
} else {
  console.log('\n🔎 预览模式：全部命中校验通过，未写入任何文件。加 --apply 才会写入。');
}

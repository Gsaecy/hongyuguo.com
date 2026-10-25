#!/usr/bin/env node
/* 把「App Store」拆成 iOS App Store 与 Mac App Store 两个直链；命中数不符则整体中止、不写文件。 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IOS_CN = 'https://apps.apple.com/cn/app/safevault%E5%AF%86%E7%A0%81%E7%AE%A1%E7%90%86%E5%99%A8/id6793554270';
const IOS_OLD = 'https://apps.apple.com/app/id6793554270';
const MAC_CN = 'https://apps.apple.com/cn/app/safevault-%E5%AF%86%E7%A0%81%E7%AE%A1%E7%90%86/id6793116909?mt=12';

const a = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

const edits = [
  {
    file: 'i18n.js',
    old: `现已上架 ${a(IOS_CN, 'App Store')}、<a href="https://play.google.com`,
    new: `现已上架 ${a(IOS_CN, 'iOS App Store')}、${a(MAC_CN, 'Mac App Store')}、<a href="https://play.google.com`,
    count: 1,
  },
  {
    file: 'i18n.js',
    old: `Now listed on the ${a(IOS_OLD, 'App Store')}, <a href="https://play.google.com`,
    new: `Now listed on the ${a(IOS_CN, 'iOS App Store')}, ${a(MAC_CN, 'Mac App Store')}, <a href="https://play.google.com`,
    count: 1,
  },
  {
    file: 'index.html',
    old: `Now listed on the ${a(IOS_OLD, 'App Store')}, <a href="https://play.google.com`,
    new: `Now listed on the ${a(IOS_CN, 'iOS App Store')}, ${a(MAC_CN, 'Mac App Store')}, <a href="https://play.google.com`,
    count: 1,
  },
  {
    file: 'topics.js',
    old: 'now on the App Store, Google Play, and Microsoft Store.',
    new: 'now on the iOS App Store, Mac App Store, Google Play, and Microsoft Store.',
    count: 1,
  },
  {
    file: 'topics.js',
    old: '已在 App Store、Google Play、Microsoft Store 上架',
    new: '已在 iOS App Store、Mac App Store、Google Play、Microsoft Store 上架',
    count: 1,
  },
  {
    file: 'index.html',
    old: 'i18n.js?v=18',
    new: 'i18n.js?v=19',
    count: 1,
  },
  {
    file: 'discuss.html',
    old: 'i18n.js?v=18',
    new: 'i18n.js?v=19',
    count: 1,
  },
  {
    file: 'discuss.html',
    old: 'topics.js?v=8',
    new: 'topics.js?v=9',
    count: 1,
  },
];

// 第一阶段：全部校验，任一不符立即中止
const staged = new Map();
for (const e of edits) {
  const p = path.join(ROOT, e.file);
  if (!staged.has(e.file)) staged.set(e.file, fs.readFileSync(p, 'utf8'));
  const src = staged.get(e.file);
  const hits = src.split(e.old).length - 1;
  if (hits !== e.count) {
    console.error(`✗ ${e.file}: 期望命中 ${e.count} 次，实际 ${hits} 次 → 中止，未写入任何文件`);
    console.error(`  片段: ${e.old.slice(0, 90)}`);
    process.exit(1);
  }
  staged.set(e.file, src.split(e.old).join(e.new));
}
// 第二阶段：写入
for (const [file, content] of staged) {
  fs.writeFileSync(path.join(ROOT, file), content);
  console.log(`✓ ${file} 已更新`);
}
console.log(`完成：${edits.length} 处替换全部精确命中`);

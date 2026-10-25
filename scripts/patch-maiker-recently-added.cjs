#!/usr/bin/env node
/**
 * 把 MaiKer 卡片开头的「锦鲤池、浅滩游鱼、深海风景——三张…」
 * 改为「最近上新「锦鲤池」、「浅滩游鱼」、「深海风景」——三张…」
 *
 * 设计要点：
 *  - 每处替换必须「精确命中 1 次」，否则整体中止、不写任何文件；
 *  - 默认预览模式，加 --apply 才真正写入。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const OLD_ZH =
  '锦鲤池、浅滩游鱼、深海风景——三张实时渲染的 3D 互动壁纸，光标到哪儿鱼群跟到哪儿，点一下水面涟漪荡开。';
const NEW_ZH =
  '最近上新「锦鲤池」、「浅滩游鱼」、「深海风景」——三张实时渲染的 3D 互动壁纸，光标到哪儿鱼群跟到哪儿，点一下水面涟漪荡开。';

const OLD_EN =
  'Koi pond, shallow shoals, deep sea — three real-time 3D interactive wallpapers where fish follow your cursor';
const NEW_EN =
  'Recently added — koi pond, shallow shoals, and deep sea: three real-time 3D interactive wallpapers where fish follow your cursor';

/** [相对路径, 旧串, 新串, 说明] */
const PATCHES = [
  ['i18n.js', OLD_ZH, NEW_ZH, 'i18n 中文 projects.maiker'],
  ['i18n.js', OLD_EN, NEW_EN, 'i18n 英文 projects.maiker'],
  ['index.html', OLD_EN, NEW_EN, 'index.html 静态兜底（无 JS 时）'],
  // 缓存版本号：正文变了必须升，否则线上继续用旧 i18n
  ['index.html', 'i18n.js?v=22', 'i18n.js?v=23', 'index.html 缓存版本'],
  ['discuss.html', 'i18n.js?v=22', 'i18n.js?v=23', 'discuss.html 缓存版本'],
];

const files = new Map();
const counts = [];
let failed = false;

for (const [rel, oldStr, newStr, label] of PATCHES) {
  const abs = path.join(ROOT, rel);
  if (!files.has(abs)) files.set(abs, fs.readFileSync(abs, 'utf8'));
  const src = files.get(abs);
  const hits = src.split(oldStr).length - 1;
  counts.push({ label, rel, hits });
  if (hits !== 1) failed = true;
  else files.set(abs, src.split(oldStr).join(newStr));
}

console.log(APPLY ? '=== 写入模式 ===' : '=== 预览模式（不写文件）===');
for (const c of counts) {
  const ok = c.hits === 1 ? '✅' : '❌';
  console.log(`${ok} ${c.rel.padEnd(14)} 命中 ${c.hits} 次  ${c.label}`);
}

// 字数（仅中文，不含标点差异带来的误导，用 CJK 字符数衡量）
const cjk = (s) => (s.match(/[\u4e00-\u9fff]/g) || []).length;
console.log(`\n中文字数：旧 ${cjk(OLD_ZH)} → 新 ${cjk(NEW_ZH)}（本句）`);

if (failed) {
  console.error('\n存在命中次数不为 1 的替换，已中止，未写入任何文件。');
  process.exit(1);
}

if (!APPLY) {
  console.log('\n预览通过。加 --apply 写入。');
  process.exit(0);
}

for (const [abs, content] of files) fs.writeFileSync(abs, content);
console.log(`\n已写入 ${files.size} 个文件。`);

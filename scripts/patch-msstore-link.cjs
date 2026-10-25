#!/usr/bin/env node
/**
 * 把 Microsoft Store 链接换成带地区参数的写法。
 *  - 中文版：hl=zh-CN&gl=HK（用户提供的原文）
 *  - 英文版：hl=en-US&gl=HK（同地区、英文界面，实测 200 且命中应用页）
 *
 * 注意：href 里的 & 必须写成 &amp;，否则 HTML 序列化不规范。
 *        浏览器解析后 getAttribute('href') 应为单个 &。
 *
 * 每处替换必须精确命中指定次数，否则整体中止、不写任何文件。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const OLD = '<a href="https://apps.microsoft.com/detail/9NSRDWH35HXH" target="_blank" rel="noopener">Microsoft Store</a>';

const ZH_NEW = '<a href="https://apps.microsoft.com/detail/9nsrdwh35hxh?hl=zh-CN&amp;gl=HK" target="_blank" rel="noopener">Microsoft Store</a>';
const EN_NEW = '<a href="https://apps.microsoft.com/detail/9nsrdwh35hxh?hl=en-US&amp;gl=HK" target="_blank" rel="noopener">Microsoft Store</a>';

const edits = [
  {
    file: 'i18n.js',
    // 中文条目以「与 ...Microsoft Store</a>，」结尾
    from: '与 ' + OLD + '，',
    to: '与 ' + ZH_NEW + '，',
    times: 1,
  },
  {
    file: 'i18n.js',
    // 英文条目以「, and ...Microsoft Store</a> — download ...Windows.',」结尾
    from: ', and ' + OLD + " — download it on iOS, macOS, Android, and Windows.'",
    to: ', and ' + EN_NEW + " — download it on iOS, macOS, Android, and Windows.'",
    times: 1,
  },
  {
    file: 'index.html',
    // 静态兜底（无 JS 时的英文）
    from: ', and ' + OLD + ' — download it on iOS, macOS, Android, and Windows.</p>',
    to: ', and ' + EN_NEW + ' — download it on iOS, macOS, Android, and Windows.</p>',
    times: 1,
  },
  // 升 i18n.js 缓存版本，否则线上继续读旧文件
  { file: 'index.html', from: 'i18n.js?v=19', to: 'i18n.js?v=20', times: 1 },
  { file: 'discuss.html', from: 'i18n.js?v=19', to: 'i18n.js?v=20', times: 1 },
];

// ---- 第一遍：全部校验命中数 ----
const contents = new Map();
const errors = [];
for (const e of edits) {
  if (!contents.has(e.file)) {
    contents.set(e.file, fs.readFileSync(path.join(ROOT, e.file), 'utf8'));
  }
  const src = contents.get(e.file);
  const hit = src.split(e.from).length - 1;
  if (hit !== e.times) {
    errors.push(`${e.file}: 期望命中 ${e.times} 次，实际 ${hit} 次\n  片段: ${e.from.slice(0, 90)}...`);
  }
}
if (errors.length) {
  console.error('❌ 中止，未写入任何文件：');
  for (const m of errors) console.error(' - ' + m);
  process.exit(1);
}

// ---- 第二遍：写入 ----
for (const e of edits) {
  const src = contents.get(e.file);
  contents.set(e.file, src.split(e.from).join(e.to));
}
for (const [file, body] of contents) {
  fs.writeFileSync(path.join(ROOT, file), body);
  console.log(`✅ 已写入 ${file}`);
}

// ---- 第三遍：结果断言 ----
const i18n = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const checks = [
  ['旧的无参 MS 链接已清除', !/apps\.microsoft\.com\/detail\/9NSRDWH35HXH/.test(i18n + index)],
  ['中文版 MS 链接 = hl=zh-CN&gl=HK', i18n.includes('9nsrdwh35hxh?hl=zh-CN&amp;gl=HK')],
  ['英文版 MS 链接 = hl=en-US&gl=HK', i18n.includes('9nsrdwh35hxh?hl=en-US&amp;gl=HK')],
  ['index.html 静态兜底用英文链接', index.includes('9nsrdwh35hxh?hl=en-US&amp;gl=HK')],
  ['i18n.js 版本已升到 20', index.includes('i18n.js?v=20')],
];
let ok = true;
for (const [name, pass] of checks) {
  console.log(`${pass ? '✅' : '❌'} ${name}`);
  if (!pass) ok = false;
}
process.exit(ok ? 0 : 1);

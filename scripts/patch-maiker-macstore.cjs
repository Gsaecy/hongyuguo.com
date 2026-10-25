#!/usr/bin/env node
/**
 * 给 MaiKer 产品卡加 macOS App Store 下载入口（第二个 CTA 按钮）。
 *
 * 用法：
 *   node scripts/patch-maiker-macstore.cjs           # 预览：只检查断言，不写文件
 *   node scripts/patch-maiker-macstore.cjs --apply   # 写入
 *
 * 断言规则：每处 `from` 必须精确命中 1 次；`to` 必须尚未存在（幂等）。
 * 任一不符即整体中止，不写任何文件。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const STORE_URL =
  'https://apps.apple.com/cn/app/%E9%BA%A6%E5%A3%B3%E5%A3%81%E7%BA%B8-maiker-%E9%AB%98%E7%BA%A7%E6%84%9F%E5%8A%A8%E6%80%81%E5%A3%81%E7%BA%B8/id6804357926?mt=12';

const patches = [
  {
    file: 'index.html',
    desc: 'MaiKer 卡片 CTA：Visit site 旁增加 Mac App Store 下载按钮',
    from: [
      '                  <a class="btn-primary" href="https://macwall.skin" target="_blank" rel="noopener" data-i18n="projects.visit">Visit site →</a>',
    ].join('\n'),
    to: [
      '                  <a class="btn-primary" href="https://macwall.skin" target="_blank" rel="noopener" data-i18n="projects.visit">Visit site →</a>',
      `                  <a class="btn-secondary" href="${STORE_URL}" target="_blank" rel="noopener">Mac App Store →</a>`,
    ].join('\n'),
  },
];

let failed = false;
const originals = new Map();

for (const p of patches) {
  const abs = path.join(ROOT, p.file);
  const src = fs.readFileSync(abs, 'utf8');
  originals.set(p.file, src);

  const hits = src.split(p.from).length - 1;
  const hasTo = src.includes(p.to);

  console.log(`\n[${p.file}] ${p.desc}`);
  console.log(`  from 命中 ${hits} 次${hits === 1 ? ' ✅' : ' ❌ 期望 1 次'}`);
  console.log(`  to 已存在: ${hasTo}${hasTo ? ' ❌ 已打过补丁' : ' ✅'}`);
  console.log(`  旧按钮 href 指向 macwall.skin: ${src.includes('href="https://macwall.skin"')}`);
  console.log(`  Mac App Store 按钮数（应为 0）: ${(src.match(/Mac App Store →/g) || []).length}`);

  if (hits !== 1 || hasTo) failed = true;
}

if (failed) {
  console.error('\n❌ 断言未通过，未写入任何文件。');
  process.exit(1);
}

if (!APPLY) {
  console.log('\n🔍 预览模式：断言全部通过，未写入文件。加 --apply 才会写入。');
  process.exit(0);
}

for (const p of patches) {
  const abs = path.join(ROOT, p.file);
  const next = originals.get(p.file).replace(p.from, p.to);
  fs.writeFileSync(abs, next, 'utf8');
  console.log(`\n✍️  已写入 ${p.file}（${originals.get(p.file).length} → ${next.length} 字节）`);
}

// 写入后自检
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
console.log('\n== 写入后自检 ==');
console.log(`Mac App Store 按钮数: ${(html.match(/Mac App Store →/g) || []).length} (期望 1)`);
console.log(`Store URL 出现: ${html.includes('id6804357926?mt=12')}`);
console.log(`maiker 卡片内按钮总数: ${(html.match(/class="btn-(primary|secondary)"/g) || []).length} (期望 3: SafeVault 1 + MaiKer 2)`);

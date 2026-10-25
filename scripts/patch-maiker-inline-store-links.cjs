#!/usr/bin/env node
/**
 * 撤掉 MaiKer 卡片上的「Mac App Store →」按钮，改为把下载链接分别挂到
 * 三张 3D 壁纸的名称上（「锦鲤池」、「浅滩游鱼」、「深海风景」各自独立链接）。
 *
 * 设计意图（用户要求）：
 *   - 不要再有独立的商店按钮，商店入口隐入文案；
 *   - 三个名称各自是一个独立 <a>，不是三个字共用一个大链接。
 *
 * 用法：
 *   node scripts/patch-maiker-inline-store-links.cjs           # 预览：只检查断言
 *   node scripts/patch-maiker-inline-store-links.cjs --apply   # 写入
 *
 * 断言规则：
 *   - 每个补丁带 appliedTest（该处是否已生效）：
 *       已生效 → 跳过（可安全重复运行）；
 *       未生效 → `from` 必须精确命中 1 次，否则整体中止，不写任何文件。
 *   - 同一文件的多处补丁按顺序累积应用（注意：不能各写各的，
 *     否则后写会用「原始内容」覆盖先写的改动）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const STORE_URL =
  'https://apps.apple.com/cn/app/%E9%BA%A6%E5%A3%B3%E5%A3%81%E7%BA%B8-maiker-%E9%AB%98%E7%BA%A7%E6%84%9F%E5%8A%A8%E6%80%81%E5%A3%81%E7%BA%B8/id6804357926?mt=12';

/** 行内链接：与原 `.product-tagline a` 用法一致（下划线 + 加粗）。 */
const link = (text) =>
  `<a href="${STORE_URL}" target="_blank" rel="noopener">${text}</a>`;

// ── 三个壁纸名称（中 / 英），各自独立成链 ──────────────────────────────
const zhNames = ['「锦鲤池」', '「浅滩游鱼」', '「深海风景」'].map(link);
const enNames = ['koi pond', 'shallow shoals', 'deep sea'].map(link);

const zhFrom =
  '最近上新「锦鲤池」、「浅滩游鱼」、「深海风景」——三张实时渲染的 3D 互动壁纸，光标到哪儿鱼群跟到哪儿，点一下水面涟漪荡开。再配上精选动态壁纸、花瓣与萤火等十种氛围特效、随鼠标绽放的星尘蝴蝶，以及跟着节拍律动的桌面时钟。占用极低，安静陪你工作。';

const zhTo =
  `最近上新${zhNames[0]}、${zhNames[1]}、${zhNames[2]}——三张实时渲染的 3D 互动壁纸，` +
  '光标到哪儿鱼群跟到哪儿，点一下水面涟漪荡开。再配上精选动态壁纸、花瓣与萤火等十种氛围特效、' +
  '随鼠标绽放的星尘蝴蝶，以及跟着节拍律动的桌面时钟。占用极低，安静陪你工作。';

const enFrom =
  'Recently added — koi pond, shallow shoals, and deep sea: three real-time 3D interactive wallpapers where fish follow your cursor and a click sends ripples across the water. Plus a curated set of live wallpapers, ten ambient effects like falling petals and drifting fireflies, stardust and butterflies that bloom under your mouse, and a clock pulsing to your music. Light on CPU, quiet while you work.';

const enTo =
  `Recently added — ${enNames[0]}, ${enNames[1]}, and ${enNames[2]}: three real-time 3D interactive ` +
  'wallpapers where fish follow your cursor and a click sends ripples across the water. Plus a curated ' +
  'set of live wallpapers, ten ambient effects like falling petals and drifting fireflies, stardust and ' +
  'butterflies that bloom under your mouse, and a clock pulsing to your music. Light on CPU, quiet while you work.';

const patches = [
  {
    file: 'index.html',
    desc: '移除 MaiKer 卡片上的「Mac App Store →」按钮（商店入口改为文案内联）',
    appliedTest: (s) => !/Mac App Store →<\/a>/.test(s),
    from: [
      '                  <a class="btn-primary" href="https://macwall.skin" target="_blank" rel="noopener" data-i18n="projects.visit">Visit site →</a>',
      `                  <a class="btn-secondary" href="${STORE_URL}" target="_blank" rel="noopener">Mac App Store →</a>`,
    ].join('\n'),
    to: '                  <a class="btn-primary" href="https://macwall.skin" target="_blank" rel="noopener" data-i18n="projects.visit">Visit site →</a>',
  },
  {
    file: 'index.html',
    desc: 'MaiKer 静态兜底改为富文本 + 三个名称独立链接（data-i18n → data-i18n-html）',
    appliedTest: (s) => /data-i18n-html="projects\.maiker"/.test(s),
    from: `                <p class="product-tagline" data-i18n="projects.maiker">${enFrom}</p>`,
    to: `                <p class="product-tagline" data-i18n-html="projects.maiker">${enTo}</p>`,
  },
  {
    file: 'i18n.js',
    desc: '中文 projects.maiker：三个壁纸名称各自挂载商店链接',
    appliedTest: (s) => s.includes(`最近上新${zhNames[0]}`),
    from: `      'projects.maiker': '${zhFrom}',`,
    to: `      'projects.maiker': '${zhTo}',`,
  },
  {
    file: 'i18n.js',
    desc: '英文 projects.maiker：三个壁纸名称各自挂载商店链接',
    appliedTest: (s) => s.includes(`Recently added — ${enNames[0]}`),
    from: `      'projects.maiker': '${enFrom}',`,
    to: `      'projects.maiker': '${enTo}',`,
  },
  {
    file: 'index.html',
    desc: '缓存版本 i18n.js?v=23 → 24（i18n.js 内容已变）',
    appliedTest: (s) => s.includes('i18n.js?v=24'),
    from: '<script src="i18n.js?v=23"></script>',
    to: '<script src="i18n.js?v=24"></script>',
  },
  {
    file: 'discuss.html',
    desc: '缓存版本 i18n.js?v=23 → 24（与首页保持一致）',
    appliedTest: (s) => s.includes('i18n.js?v=24'),
    from: '<script src="i18n.js?v=23"></script>',
    to: '<script src="i18n.js?v=24"></script>',
  },
];

// ── 校验与计划（按文件累积，避免同文件多补丁互相覆盖）────────────────
const buffers = new Map();
const plans = [];
let failed = false;

for (const p of patches) {
  const abs = path.join(ROOT, p.file);
  if (!buffers.has(abs)) buffers.set(abs, fs.readFileSync(abs, 'utf8'));
  const cur = buffers.get(abs);

  if (p.appliedTest(cur)) {
    console.log(`⏭  ${p.file} — 已生效，跳过：${p.desc}`);
    continue;
  }

  const fromCount = cur.split(p.from).length - 1;
  if (fromCount !== 1) {
    failed = true;
    console.log(`❌ ${p.file} — ${p.desc}`);
    console.log(`     ↳ from 命中 ${fromCount} 次（应为 1）`);
    continue;
  }

  const next = cur.replace(p.from, p.to);
  if (next === cur) {
    failed = true;
    console.log(`❌ ${p.file} — ${p.desc}`);
    console.log('     ↳ 替换后内容未变化');
    continue;
  }

  buffers.set(abs, next);
  plans.push({ abs, p });
  console.log(`✅ ${p.file} — 待应用：${p.desc}`);
}

if (failed) {
  console.log('\n中止：存在断言不通过，未写入任何文件。');
  process.exit(1);
}

const changed = new Set(plans.map((x) => x.abs));

if (!APPLY) {
  console.log(
    `\n预览模式：待应用 ${plans.length} 处，涉及 ${changed.size} 个文件，未写入。`
  );
  console.log('加 --apply 写入。');
  process.exit(0);
}

for (const abs of changed) fs.writeFileSync(abs, buffers.get(abs), 'utf8');
console.log(
  `\n已写入：${plans.length} 处改动，${changed.size} 个文件（${[...changed]
    .map((a) => path.relative(ROOT, a))
    .join(', ')}）。`
);

// ── 写入后自检（读回磁盘，而不是看内存）──────────────────────────────
const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const i18n = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
const dsc = fs.readFileSync(path.join(ROOT, 'discuss.html'), 'utf8');
const maikerCard = (idx.split('<h3 class="product-name">MaiKer</h3>')[1] || '').split(
  '</article>'
)[0];
const checks = [
  ['index.html 已无「Mac App Store →」按钮', !/Mac App Store →<\/a>/.test(idx)],
  ['index.html 已无指向商店的 btn-secondary', !/btn-secondary[^>]*apps\.apple\.com/.test(idx)],
  ['index.html 用 data-i18n-html 渲染 MaiKer', /data-i18n-html="projects\.maiker"/.test(idx)],
  ['index.html 已无 data-i18n（纯文本）版 MaiKer', !/data-i18n="projects\.maiker"/.test(idx)],
  ['i18n.js 内联链接数 = 6（中 3 + 英 3）', i18n.split(STORE_URL).length - 1 === 6],
  ['index.html 指向 i18n.js?v=24', idx.includes('i18n.js?v=24')],
  ['discuss.html 指向 i18n.js?v=24', dsc.includes('i18n.js?v=24')],
  [
    'MaiKer 卡片内按钮数 = 1（仅保留 Visit site）',
    (maikerCard.match(/class="btn-/g) || []).length === 1,
  ],
];
console.log('\n写入后自检：');
let bad = false;
for (const [name, pass] of checks) {
  if (!pass) bad = true;
  console.log(`  ${pass ? '✅' : '❌'} ${name}`);
}
process.exit(bad ? 1 : 0);

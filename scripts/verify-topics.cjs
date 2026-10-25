/* 临时校验脚本：话题数据 / 资源 / i18n 键一致性 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
let fail = 0;
const ok = (m) => console.log('  ✓ ' + m);
const bad = (m) => { fail++; console.log('  ✗ ' + m); };

const stubEl = {
  getAttribute: () => null,
  setAttribute() {},
  style: {},
  classList: { add() {}, remove() {}, contains: () => false },
  textContent: '',
  innerHTML: '',
  appendChild() {},
  addEventListener() {},
};

// ---------- topics.js ----------
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'topics.js'), 'utf8'), ctx);
const topics = ctx.window.HY_TOPICS;
console.log('\n[topics] 共 ' + topics.length + ' 个话题');
const slugs = new Set();
for (const t of topics) {
  if (slugs.has(t.slug)) bad('重复 slug: ' + t.slug);
  slugs.add(t.slug);
  if (!['product', 'extension'].includes(t.group)) bad(t.slug + ' group 异常: ' + t.group);
  const need = ['slug', 'name', 'taglineZh', 'link', 'linkLabel'];
  if (t.group === 'extension') need.push('taglineEn', 'nameEn', 'icon');
  for (const k of need) if (!t[k]) bad(t.slug + ' 缺字段 ' + k);
  if (t.icon && !fs.existsSync(path.join(root, t.icon))) bad(t.slug + ' 图标缺失: ' + t.icon);
  if (!fs.existsSync(path.join(root, 'assets/qr/' + t.slug + '.png'))) bad(t.slug + ' 二维码缺失');
  if (t.discussions && !/^https:\/\//.test(t.discussions)) bad(t.slug + ' discussions 非 https');
}
const hw = topics.find((t) => t.slug === 'deepseek-hwchat');
if (!hw) bad('未找到 deepseek-hwchat 话题');
else {
  ok('deepseek-hwchat 已注册 (group=' + hw.group + ', 共 ' + topics.length + ' 个话题)');
  if (hw.discussions === 'https://github.com/Gsaecy/DeepSeek-HWChat/discussions') ok('discussions 字段正确');
  else bad('discussions 字段异常: ' + hw.discussions);
  if (/^https:\/\/github\.com\/Gsaecy\/DeepSeek-HWChat$/.test(hw.link)) ok('仓库链接正确');
  else bad('link 异常: ' + hw.link);
}

// ---------- i18n.js ----------
const ictx = {
  window: {},
  document: { documentElement: stubEl, addEventListener() {}, dispatchEvent() {}, querySelectorAll: () => [], querySelector: () => stubEl },
  CustomEvent: class { constructor(type, opt) { this.type = type; Object.assign(this, opt || {}); } },
  navigator: { language: 'zh-CN' },
  localStorage: { getItem: () => null, setItem() {} },
  addEventListener() {},
};
ictx.window.document = ictx.document;
ictx.window.navigator = ictx.navigator;
ictx.window.localStorage = ictx.localStorage;
vm.createContext(ictx);
vm.runInContext(fs.readFileSync(path.join(root, 'i18n.js'), 'utf8'), ictx);
const dict = ictx.window.HY_I18N || ictx.window.I18N || ictx.window.i18n || ictx.window.I18N_DICT;
console.log('\n[i18n] 导出: ' + (dict ? Object.keys(dict).join(',') : '无'));

// 用真实 t() 取值验证（内部 DICT 不导出）
let zh = null, en = null;
if (dict && dict.setLang && dict.t) {
  dict.setLang('zh');
  zh = { probe: true };
  dict.setLang('en');
  en = { probe: true };
  dict.setLang('zh');
}
const tLive = (key, l) => {
  dict.setLang(l);
  const v = dict.t(key);
  dict.setLang('zh');
  return v;
};

// 同时从源码抽取两份键集做一致性比对
const isrc = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
const iZh = isrc.indexOf('zh: {'), iEn = isrc.indexOf('en: {');
const keySet = (s) => new Set([...s.matchAll(/'([a-zA-Z0-9_]+\.[a-zA-Z0-9_.]+)':/g)].map((m) => m[1]));
const zhKeys = keySet(isrc.slice(iZh, iEn));
const enKeys = keySet(isrc.slice(iEn));

const need = ['ext.note', 'discuss.projectDiscussions'];
for (const k of need) {
  const a = zhKeys.has(k), b = enKeys.has(k);
  const live = dict && dict.setLang ? (tLive(k, 'zh') !== k && tLive(k, 'en') !== k) : false;
  if (a && b && live) ok(k + '（zh/en 均在且 t() 可取到）');
  else bad(k + ' 异常 (zhKey=' + a + ', enKey=' + b + ', t()可用=' + live + ')');
}
// 扩展不进平级项目卡，因此这些卡片专属 key 应当已被移除
const gone = ['projects.tag.hwchat', 'projects.hwchat', 'projects.repo', 'projects.discuss'];
const leftover = gone.filter((k) => zhKeys.has(k) || enKeys.has(k));
if (leftover.length) bad('卡片专属 key 未清理: ' + leftover.join(', '));
else ok('卡片专属 key 已清理（DeepSeek-HWChat 不再占用项目卡文案）');

// ext.note 会覆盖静态 HTML，必须确保字典里真的带着新链接
for (const lang of ['zh', 'en']) {
  const v = dict && dict.setLang ? tLive('ext.note', lang) : '';
  if (/github\.com\/Gsaecy\/DeepSeek-HWChat/.test(v) && /ext-trans-picker/.test(v))
    ok('ext.note[' + lang + '] 含 DeepSeek-HWChat 与其它扩展案例');
  else bad('ext.note[' + lang + '] 缺少 DeepSeek-HWChat 链接');
}
const diff = [...zhKeys].filter((k) => !enKeys.has(k));
if (diff.length) bad('en 缺少 ' + diff.length + ' 个 key: ' + diff.slice(0, 6).join(','));
else ok('zh/en 键集一致 (zh=' + zhKeys.size + ', en=' + enKeys.size + ')');

// ---------- index.html ----------
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
console.log('\n[index.html]');
const cards = [...index.matchAll(/<article class="product-card[^"]*"/g)];
if (cards.length === 2 && !/product-card--wide/.test(index)) ok('项目区仅 SafeVault / MaiKer 两张平级卡（DeepSeek-HWChat 未升格为卡片）');
else bad('项目卡数量或样式异常 (cards=' + cards.length + ', wide=' + /product-card--wide/.test(index) + ')');
const extBlock = (index.match(/<p class="ext-note">[\s\S]*?<\/p>/) || [''])[0];
if (/data-i18n-html="ext\.note"/.test(extBlock) && /github\.com\/Gsaecy\/DeepSeek-HWChat/.test(extBlock))
  ok('扩展案例行包含 DeepSeek-HWChat 链接');
else bad('扩展案例行缺少 DeepSeek-HWChat 链接');
if (/assets\/icons\/vscode\.png/.test(extBlock)) ok('扩展案例行保留 VS Code 图标');
else bad('扩展案例行缺少 VS Code 图标');
const used = [...index.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map((m) => m[1]);
const missing = [...new Set(used)].filter((k) => !zhKeys.has(k));
if (missing.length) bad('index.html 引用但 zh 缺失: ' + missing.join(', '));
else ok('index.html 全部 ' + new Set(used).size + ' 个 i18n 键可解析');

// ---------- discuss.html / discuss.js ----------
const dh = fs.readFileSync(path.join(root, 'discuss.html'), 'utf8');
const dj = fs.readFileSync(path.join(root, 'discuss.js'), 'utf8');
const dc = fs.readFileSync(path.join(root, 'discuss.css'), 'utf8');
console.log('\n[discuss 详情页]');
if (/id="tv-discussions"[^>]*hidden/.test(dh)) ok('tv-discussions 节点存在且默认 hidden');
else bad('tv-discussions 节点缺失或未默认 hidden');
if (/t\.discussions/.test(dj)) ok('discuss.js 按 topics.discussions 控制显隐');
else bad('discuss.js 未处理 discussions 字段');
if (/\[hidden\]\s*\{\s*display:\s*none/.test(dc)) ok('[hidden] display:none 覆盖已加入');
else bad('缺 [hidden] 覆盖，隐藏按钮会被 .btn-secondary 覆盖显示');

// ---------- 产物 ----------
console.log('\n[assets]');
for (const f of ['assets/extensions/deepseek-hwchat.webp', 'assets/qr/deepseek-hwchat.png']) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) ok(f + ' (' + fs.statSync(p).size + ' B)');
  else bad('缺 ' + f);
}

// ---------- 部署清单 ----------
const mp = fs.readFileSync(path.join(root, 'deploy/make-package.sh'), 'utf8');
console.log('\n[deploy]');
if (/^\s*assets\/$/m.test(mp)) ok('make-package.sh 含 assets/，新图标与二维码会自动入包');
else bad('make-package.sh 未包含 assets/');

console.log('\n' + (fail ? '❌ 失败 ' + fail + ' 项' : '✅ 全部通过'));
process.exit(fail ? 1 : 0);

/* ==========================================================================
   discuss.js — 留言讨论板块逻辑（hongyuguo.com）
   1. 渲染话题卡片（数据来自 topics.js）
   2. #topic=<slug> 哈希路由：列表视图 ↔ 话题详情视图
   3. 加载 giscus（配置见 discuss-config.js，未启用时显示兜底入口）
   4. 复制链接 / 二维码扫码入口
   ========================================================================== */
(function () {
  'use strict';

  var TOPICS = window.HY_TOPICS || [];
  var CFG = window.DISCUSS_CONFIG || {};
  var I18N = window.HY_I18N;
  var gridProducts = document.getElementById('grid-products');
  var gridExtensions = document.getElementById('grid-extensions');
  var boardView = document.getElementById('board-view');
  var topicView = document.getElementById('topic-view');
  var giscusBox = document.getElementById('giscus-box');
  var giscusFallback = document.getElementById('giscus-fallback');

  function lang() { return I18N ? I18N.getLang() : 'zh'; }
  function tr(key) { return I18N ? I18N.t(key) : key; }

  /* 话题名/简介按语言取 */
  function tName(t) { return lang() === 'zh' ? t.name : (t.nameEn || t.name); }
  function tTag(t) { return lang() === 'zh' ? (t.taglineZh || t.tagline) : (t.taglineEn || t.tagline); }
  function tKind(t) { return lang() === 'zh' ? (t.kindZh || t.kind) : t.kind; }
  function tLink(t) { return lang() === 'zh' ? (t.linkLabel || '了解更多') : (t.linkLabelEn || 'Learn more'); }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function bySlug(slug) {
    for (var i = 0; i < TOPICS.length; i++) {
      if (TOPICS[i].slug === slug) return TOPICS[i];
    }
    return null;
  }

  /* ---------- 渲染话题卡片（产品 + 扩展分组） ---------- */
  function buildCards() {
    if (gridProducts) {
      var html = '';
      TOPICS.forEach(function (t) {
        if (t.group === 'extension') return;
        html +=
          '<article class="topic-card">' +
            '<a class="topic-card-main" href="discuss.html#topic=' + encodeURIComponent(t.slug) + '">' +
              '<div class="topic-card-top">' +
                '<img class="topic-icon" src="' + esc(t.icon) + '" alt="' + esc(tName(t)) + ' 图标">' +
                '<div>' +
                  '<span class="topic-kind">' + esc(tKind(t)) + '</span>' +
                  '<h2 class="topic-name">' + esc(tName(t)) + '</h2>' +
                  (t.en ? '<p class="topic-en">' + esc(t.en) + '</p>' : '') +
                '</div>' +
              '</div>' +
              '<p class="topic-tagline">' + esc(tTag(t)) + '</p>' +
            '</a>' +
            '<div class="topic-card-foot">' +
              '<a class="btn-primary btn-sm" href="discuss.html#topic=' + encodeURIComponent(t.slug) + '">' + esc(tr('discuss.join')) + '</a>' +
              '<a class="topic-qr" href="discuss.html#topic=' + encodeURIComponent(t.slug) + '" title="' + esc(tr('discuss.scan')) + '">' +
                '<img src="assets/qr/' + encodeURIComponent(t.slug) + '.png?v=2" alt="' + esc(tName(t)) + '">' + esc(tr('discuss.scan')) + '</a>' +
            '</div>' +
          '</article>';
      });
      gridProducts.innerHTML = html;
    }

    if (gridExtensions) {
      var ehtml = '';
      TOPICS.forEach(function (t) {
        if (t.group !== 'extension') return;
        ehtml +=
          '<a class="ext-topic" href="discuss.html#topic=' + encodeURIComponent(t.slug) + '">' +
            '<img class="ext-topic-icon" src="' + esc(t.icon) + '" alt="' + esc(tName(t)) + ' 图标">' +
            '<span class="ext-topic-copy">' +
              '<span class="ext-topic-name">' + esc(tName(t)) + '</span>' +
              '<span class="ext-topic-en">' + esc(t.en) + '</span>' +
            '</span>' +
            '<span class="ext-topic-go">' + esc(tr('discuss.join')) + ' →</span>' +
          '</a>';
      });
      gridExtensions.innerHTML = ehtml;
    }

    var gl = document.getElementById('general-link');
    if (gl) gl.href = CFG.discussionsUrl || 'https://github.com/Gsaecy/hongyuguo.com/discussions';
  }

  /* ---------- giscus ---------- */
  function giscusReady() {
    return !!(CFG.enabled && CFG.repo && CFG.repoId && CFG.category && CFG.categoryId);
  }

  function isLocal() {
    return /^(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(location.hostname);
  }

  function renderGiscus(slug) {
    // 清理上一次的 giscus
    var old = giscusBox.querySelector('script');
    if (old) old.remove();
    giscusBox.querySelectorAll('iframe').forEach(function (f) { f.remove(); });

    if (!giscusReady()) {
      giscusBox.hidden = true;
      giscusFallback.hidden = false;
      var fb = document.getElementById('fb-link');
      if (fb) fb.href = CFG.discussionsUrl || 'https://github.com/Gsaecy/hongyuguo.com/discussions';
      return;
    }

    giscusBox.hidden = false;
    giscusFallback.hidden = true;

    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.setAttribute('data-repo', CFG.repo);
    s.setAttribute('data-repo-id', CFG.repoId);
    s.setAttribute('data-category', CFG.category);
    s.setAttribute('data-category-id', CFG.categoryId);
    s.setAttribute('data-mapping', CFG.mapping || 'specific');
    s.setAttribute('data-term', slug);
    s.setAttribute('data-strict', CFG.strict || '0');
    s.setAttribute('data-reactions-enabled', CFG.reactionsEnabled || '1');
    s.setAttribute('data-emit-metadata', CFG.emitMetadata || '0');
    s.setAttribute('data-input-position', CFG.inputPosition || 'top');
    s.setAttribute('data-lang', CFG.lang || 'zh-CN');
    s.setAttribute('data-theme', isLocal() && CFG.fallbackTheme ? CFG.fallbackTheme : (CFG.theme || 'light'));
    s.crossOrigin = 'anonymous';
    s.async = true;
    giscusBox.appendChild(s);
  }

  /* ---------- 话题详情视图 ---------- */
  function showTopic(slug) {
    var t = bySlug(slug);
    if (!t) { showBoard(); return; }

    if (window.HY_FORUM) window.HY_FORUM.close();
    boardView.hidden = true;
    topicView.hidden = false;

    document.getElementById('tv-icon').src = t.icon;
    document.getElementById('tv-icon').alt = tName(t) + ' 图标';
    document.getElementById('tv-kind').textContent = tKind(t);
    document.getElementById('tv-name').textContent = tName(t);
    document.getElementById('tv-en').textContent = t.en || '';
    document.getElementById('tv-en').style.display = t.en ? '' : 'none';
    document.getElementById('tv-tagline').textContent = tTag(t);
    var link = document.getElementById('tv-link');
    link.href = t.link;
    link.textContent = tLink(t);

    var qr = document.getElementById('side-qr');
    qr.src = 'assets/qr/' + encodeURIComponent(t.slug) + '.png?v=2';
    qr.alt = tName(t);

    document.title = tName(t) + ' · ' + tr('discuss.titleSuffix');

    try { sessionStorage.setItem('hy-last-topic', t.slug); } catch (e) { /* ignore */ }

    renderGiscus(t.slug);
    window.scrollTo(0, 0);
  }

  function showBoard() {
    if (window.HY_FORUM) window.HY_FORUM.close();
    topicView.hidden = true;
    boardView.hidden = false;
    document.title = tr('discuss.titleSuffix');
    window.scrollTo(0, 0);
  }

  /* ---------- 哈希路由 ---------- */
  function route() {
    // 自由讨论论坛（站内）：#forum 列表 / #forum=<编号> 详情
    var fm = location.hash.match(/^#forum(?:=(\d+))?$/);
    if (fm && window.HY_FORUM) {
      boardView.hidden = true;
      topicView.hidden = true;
      if (fm[1]) window.HY_FORUM.openDiscussion(fm[1]);
      else window.HY_FORUM.open();
      return;
    }

    var m = location.hash.match(/^#topic=([\w-]+)/);
    if (m && bySlug(m[1])) {
      showTopic(m[1]);
      return;
    }

    // giscus OAuth 登录回调：URL 带 ?giscus= 或 hash 为 #giscus-box。
    // 此时必须恢复上次话题并重新挂载评论区（client.js 才会读取会话完成登录）
    var isOAuthReturn = /[?&]giscus=/.test(location.search) || /^#giscus/.test(location.hash);
    if (isOAuthReturn) {
      var last = null;
      try { last = sessionStorage.getItem('hy-last-topic'); } catch (e) { /* ignore */ }
      if (last && bySlug(last)) {
        showTopic(last);
        return;
      }
    }

    showBoard();
  }

  /* ---------- 复制链接 ---------- */
  var toast = document.createElement('div');
  toast.className = 'copy-toast';
  document.body.appendChild(toast);

  function showToast() {
    toast.textContent = tr('discuss.toast');
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 1600);
  }

  var copyBtn = document.getElementById('copy-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var url = location.href;
      var done = function () {
        showToast();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url); done(); });
      } else {
        fallbackCopy(url); done();
      }
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ---------- 启动 ---------- */
  buildCards();
  addEventListener('hashchange', route);

  /* 初次路由延后到 DOM 就绪，确保 forum.js 已加载（#forum 路由依赖 HY_FORUM） */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', route);
  } else {
    route();
  }

  /* 语言切换：重渲染话题卡片与当前视图 */
  document.addEventListener('hy:langchange', function () {
    buildCards();
    route();
  });
})();

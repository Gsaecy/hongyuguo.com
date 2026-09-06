/* ==========================================================================
   forum.js — 站内自由讨论论坛（数据后端：GitHub Discussions · General 分类）
   --------------------------------------------------------------------------
   - 浏览讨论列表 / 查看评论：匿名即可（公开仓库 GraphQL）
   - 登录：复用 giscus 登录流程（giscus.app/api/oauth/authorize），
     回调后把 ?giscus= 会话存入 localStorage（与 giscus client.js 相同的 key）
   - 发起新讨论 / 发表评论：用会话向 giscus.app/api/oauth/token 换取令牌，
     再调用 GitHub GraphQL（createDiscussion / addDiscussionComment）
   - 双向同步：GitHub 用户的发言直接读取自 GitHub，本站发言写入 GitHub
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.DISCUSS_CONFIG || {};
  var I18N = window.HY_I18N;
  var OWNER = (CFG.repo || 'Gsaecy/hongyuguo.com').split('/')[0];
  var REPO = (CFG.repo || 'Gsaecy/hongyuguo.com').split('/')[1];
  var REPO_ID = CFG.repoId || '';
  var GITHUB_DISCUSSIONS = CFG.discussionsUrl || 'https://github.com/' + OWNER + '/' + REPO + '/discussions';
  var SESSION_KEY = 'giscus-session';
  var GISCUS_ORIGIN = 'https://giscus.app';
  var GRAPHQL_URL = 'https://api.github.com/graphql';

  var viewEl = document.getElementById('forum-view');
  var listEl = document.getElementById('forum-list');
  var userEl = document.getElementById('forum-user');
  var githubLink = document.getElementById('forum-github-link');

  var state = { catId: null, token: null };

  function lang() { return I18N ? I18N.getLang() : 'zh'; }
  function t(key) { return I18N ? I18N.t(key) : key; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- 会话（与 giscus client.js 同 key/格式） ---------- */
  var session = initSession();

  function initSession() {
    try {
      var url = new URL(location.href);
      var sess = url.searchParams.get('giscus');
      if (sess) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
        url.searchParams.delete('giscus');
        history.replaceState(null, document.title, url.toString());
        return sess;
      }
      var saved = localStorage.getItem(SESSION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return null;
  }

  function loggedIn() { return !!session; }

  function loginUrl() {
    var back = location.origin + location.pathname + '#forum';
    return GISCUS_ORIGIN + '/api/oauth/authorize?redirect_uri=' + encodeURIComponent(back);
  }

  function clearSession() {
    session = null;
    state.token = null;
    try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }

  function logout() {
    clearSession();
    renderUser();
    showList();
  }

  async function ensureToken() {
    if (!loggedIn()) return null;
    if (state.token) return state.token;
    /* giscus.app 的令牌接口 CORS 只允许其自身域名，故优先走同源代理 /giscus-token（Nginx） */
    var urls = ['/giscus-token', GISCUS_ORIGIN + '/api/oauth/token'];
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetch(urls[i], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session: session }),
        });
        var d = await r.json().catch(function () { return null; });
        if (d && d.token) { state.token = d.token; return d.token; }
        if (d && d.error) { clearSession(); return null; } // 会话无效，清除登录态
        // 其他（404/HTML/非JSON）：继续尝试下一路径
      } catch (e) { /* CORS/网络错误：继续尝试下一路径 */ }
    }
    return null; // 都不通：保留会话，由调用方提示
  }

  /* ---------- GitHub GraphQL ---------- */
  /* 直连 api.github.com（海外可用）；失败时回退到同源代理 /github-graphql
     （需在服务器 Nginx 配置反向代理，中国大陆访问必需，见 README/DISCUSS_SETUP.md） */
  function isRateLimited(err) {
    return !!(err && err.message && /rate limit|abuse|secondary rate/i.test(err.message));
  }

  async function gql(query, variables, token) {
    var headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) headers.Authorization = 'Bearer ' + token;

    var lastError = null;
    var urls = [GRAPHQL_URL, '/github-graphql'];
    for (var i = 0; i < urls.length; i++) {
      try {
        var r = await fetch(urls[i], {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ query: query, variables: variables }),
        });
        var d = await r.json().catch(function () { return null; });
        if (d && d.errors && d.errors.length) {
          lastError = new Error(d.errors[0].message || 'GraphQL error');
        } else if (d && d.data) {
          return d.data;
        } else {
          lastError = new Error('GitHub API error (' + r.status + ')');
        }
      } catch (e) {
        lastError = e;
      }
      if (isRateLimited(lastError)) break; // 限流：两条路径都会命中，不再重试
    }
    throw lastError || new Error('GitHub API unreachable');
  }

  async function getCategoryId() {
    if (state.catId) return state.catId;
    try {
      var cached = sessionStorage.getItem('hy-forum-cat') || localStorage.getItem('hy-forum-cat');
      if (cached) { state.catId = cached; return cached; }
    } catch (e) { /* ignore */ }
    var data = await gql(
      'query($o:String!,$n:String!){ repository(owner:$o,name:$n){ discussionCategories(first:20){ nodes{ id slug name } } } }',
      { o: OWNER, n: REPO }
    );
    var cats = data.repository.discussionCategories.nodes;
    var c = cats.find(function (x) { return x.slug === 'general'; })
         || cats.find(function (x) { return x.slug === 'announcements'; })
         || cats[0];
    if (!c) throw new Error('No discussion category found');
    state.catId = c.id;
    try { sessionStorage.setItem('hy-forum-cat', c.id); } catch (e) { /* ignore */ }
    try { localStorage.setItem('hy-forum-cat', c.id); } catch (e) { /* ignore */ }
    return c.id;
  }

  /* ---------- 本地缓存（降低匿名请求量防限流；登录用户不走缓存，始终最新） ---------- */
  var CACHE_TTL = 10 * 60 * 1000; // 10 分钟内直接命中缓存，不发请求

  function cacheGet(key) {
    try {
      var raw = localStorage.getItem('hy-forum:' + key);
      if (!raw) return null;
      var o = JSON.parse(raw);
      return (o && typeof o.v !== 'undefined') ? o : null;
    } catch (e) { return null; }
  }

  function cacheSet(key, val) {
    try { localStorage.setItem('hy-forum:' + key, JSON.stringify({ t: Date.now(), v: val })); } catch (e) { /* ignore */ }
  }

  function cacheClearAll() {
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('hy-forum:') === 0) localStorage.removeItem(k);
      });
    } catch (e) { /* ignore */ }
  }

  /* 缓存新鲜（TTL 内）直接使用；否则请求网络，失败回退过期缓存。登录用户强制走网络。 */
  async function loadWithCache(key, loader) {
    if (!loggedIn()) {
      var cached = cacheGet(key);
      if (cached && Date.now() - cached.t < CACHE_TTL) {
        return { data: cached.v, fresh: true };
      }
    }
    var stale = loggedIn() ? null : cacheGet(key);
    try {
      var data = await loader();
      if (!loggedIn()) cacheSet(key, data);
      return { data: data, fresh: true };
    } catch (e) {
      if (stale && stale.v) return { data: stale.v, fresh: false };
      throw e;
    }
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(lang() === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch (e) { return String(iso || '').slice(0, 10); }
  }

  function bodyToHtml(text) {
    // 仅做基础渲染：转义 + 换行，杜绝 XSS
    return esc(text).replace(/\n/g, '<br>');
  }

  function avatarHtml(author, size) {
    if (!author) return '';
    var url = author.avatarUrl ? esc(author.avatarUrl) : '';
    var name = author.login ? esc(author.login) : '?';
    return url
      ? '<img class="f-avatar" src="' + url + '&s=' + size + '" alt="' + name + '" width="' + size + '" height="' + size + '">'
      : '<span class="f-avatar f-avatar-empty" style="width:' + size + 'px;height:' + size + 'px">' + name.charAt(0).toUpperCase() + '</span>';
  }

  /* ---------- 渲染登录状态 ---------- */
  function renderUser() {
    if (!userEl) return;
    if (loggedIn()) {
      userEl.innerHTML =
        '<span class="f-user-dot"></span><span class="f-user-name">' + t('forum.loggedIn') + '</span>' +
        '<button class="f-link" type="button" data-f-act="logout">' + t('forum.logout') + '</button>';
    } else {
      userEl.innerHTML =
        '<a class="f-login" href="' + esc(loginUrl()) + '">' + t('forum.login') + '</a>';
    }
  }

  /* ---------- 列表 ---------- */
  async function showList() {
    if (!listEl) return;
    listEl.innerHTML = '<p class="f-loading">' + t('forum.loading') + '</p>';
    var res;
    try {
      res = await loadWithCache('list', async function () {
        var catId = await getCategoryId();
        var data = await gql(
          'query($o:String!,$n:String!,$cat:ID!){ repository(owner:$o,name:$n){ discussions(first:30, categoryId:$cat, orderBy:{field:UPDATED_AT,direction:DESC}){ nodes{ number id title bodyText author{ login avatarUrl } createdAt comments(first:1){ totalCount } } } } }',
          { o: OWNER, n: REPO, cat: catId }
        );
        return data.repository.discussions.nodes;
      });
    } catch (e) {
      renderError(e, false);
      return;
    }
    renderList(res.data, res.fresh);
  }

  function renderList(nodes, fresh) {
    if (!nodes.length) {
      listEl.innerHTML = '<div class="f-empty">' + t('forum.list.empty') + '</div>';
      return;
    }
    var html = '<div class="f-list">';
      nodes.forEach(function (d) {
        html +=
          '<a class="f-item" href="discuss.html#forum=' + d.number + '">' +
            '<div class="f-item-main">' +
              '<h3 class="f-item-title">' + esc(d.title) + '</h3>' +
              '<p class="f-item-meta">' +
                (d.author ? '<span class="f-item-author">' + esc(d.author.login) + '</span> · ' : '') +
                esc(fmtDate(d.createdAt)) + ' · ' +
                (d.comments.totalCount || 0) + ' ' + esc(t('forum.list.comments')) +
              '</p>' +
            '</div>' +
            '<span class="f-item-go">→</span>' +
          '</a>';
      });
      html += '</div>';
      if (!fresh) html = '<p class="f-cache-note">' + t('forum.cached') + '</p>' + html;
      listEl.innerHTML = html;
  }

  /* ---------- 错误渲染 ---------- */
  function renderError(e, withBack) {
    var msg = (e && e.message) ? e.message : '';
    var detail = isRateLimited(e) ? t('forum.rateLimited') : esc(msg);
    listEl.innerHTML = '<div class="f-error">' + esc(t('forum.err')) +
      (detail ? '<p class="f-error-detail">' + detail + '</p>' : '') +
      '<p style="margin-top:12px"><a class="btn-secondary btn-sm" href="' + esc(GITHUB_DISCUSSIONS) + '" target="_blank" rel="noopener">' + esc(t('forum.github')) + '</a></p>' +
      (withBack ? '<a class="back-link" href="discuss.html#forum">' + esc(t('forum.backToList')) + '</a>' : '') +
      '</div>';
  }

  /* ---------- 详情 ---------- */
  async function showDetail(num) {
    if (!listEl) return;
    listEl.innerHTML = '<p class="f-loading">' + t('forum.loading') + '</p>';
    var res;
    try {
      res = await loadWithCache('d:' + num, function () {
        return gql(
          'query($o:String!,$n:String!,$num:Int!){ repository(owner:$o,name:$n){ discussion(number:$num){ number id title bodyText url author{ login avatarUrl } createdAt comments(first:50){ totalCount nodes{ id author{ login avatarUrl } bodyText createdAt replies(first:10){ totalCount nodes{ id author{ login avatarUrl } bodyText createdAt } } } } } } }',
          { o: OWNER, n: REPO, num: parseInt(num, 10) }
        ).then(function (data) {
          var d = data.repository.discussion;
          if (!d) throw new Error('Discussion not found');
          return d;
        });
      });
    } catch (e) {
      renderError(e, true);
      return;
    }
    var d = res.data;
    state.discussionId = d.id;
    state.discussionNum = d.number;

      var html = '<a class="back-link" href="discuss.html#forum" data-href data-i18n="forum.backToList">← ' + esc(t('forum.backToList').replace('← ', '')) + '</a>';
      html += '<div class="f-detail">';
      html += '<h2 class="f-detail-title">' + esc(d.title) + '</h2>';
      html += '<p class="f-item-meta">' + (d.author ? esc(d.author.login) + ' · ' : '') + esc(fmtDate(d.createdAt)) + ' · <a href="' + esc(d.url) + '" target="_blank" rel="noopener">' + t('forum.github') + '</a></p>';
      html += '<div class="f-body">' + bodyToHtml(d.bodyText) + '</div>';
      html += '</div>';

      html += '<h3 class="f-comments-title">' + t('forum.detail.comments') + '（' + (d.comments.totalCount || 0) + '）</h3>';

      if (loggedIn()) {
        html += commentBoxHtml(null, '');
      } else {
        html += '<div class="f-login-banner"><a class="f-login" href="' + esc(loginUrl()) + '">' + t('forum.login') + '</a></div>';
      }

      html += '<div class="f-comments">';
      var comments = d.comments.nodes || [];
      if (!comments.length) {
        html += '<p class="f-empty">' + t('forum.noComments') + '</p>';
      }
      comments.forEach(function (c) {
        html += commentHtml(c, true);
      });
      html += '</div>';

      if (!res.fresh) html = '<p class="f-cache-note">' + t('forum.cached') + '</p>' + html;

      listEl.innerHTML = html;
      bindDetailActions(num);
  }

  function commentHtml(c, withReplies) {
    var html = '<div class="f-comment">';
    html += '<div class="f-comment-head">' + avatarHtml(c.author, 32) + '<span class="f-comment-author">' + esc(c.author ? c.author.login : '?') + '</span><span class="f-comment-time">' + esc(fmtDate(c.createdAt)) + '</span></div>';
    html += '<div class="f-comment-body">' + bodyToHtml(c.bodyText) + '</div>';
    if (withReplies && c.replies && c.replies.nodes && c.replies.nodes.length) {
      html += '<div class="f-replies">';
      c.replies.nodes.forEach(function (r) { html += commentHtml(r, false); });
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function commentBoxHtml(replyToId, placeholder) {
    return '<div class="f-comment-box" data-reply-to="' + esc(replyToId || '') + '">' +
      '<textarea class="f-input" rows="3" placeholder="' + esc(placeholder || t('forum.comment.ph')) + '"></textarea>' +
      '<div class="f-comment-box-actions">' +
        '<button class="btn-primary btn-sm" type="button" data-f-act="submit-comment">' + esc(t('forum.comment.submit')) + '</button>' +
      '</div></div>';
  }

  function bindDetailActions() {
    if (!listEl) return;
    listEl.querySelectorAll('[data-f-act="submit-comment"]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var box = btn.closest('.f-comment-box');
        var ta = box.querySelector('textarea');
        var body = (ta.value || '').trim();
        if (!body) return;
        var replyTo = box.getAttribute('data-reply-to') || null;
        btn.disabled = true;
        try {
          var token = await ensureToken();
          if (!token) {
            btn.disabled = false;
            box.insertAdjacentHTML('beforeend', '<p class="f-error">' + esc(t('forum.tokenFail')) + '</p>');
            return;
          }
          await gql(
            'mutation($id:ID!,$body:String!,$replyTo:ID){ addDiscussionComment(input:{ discussionId:$id, body:$body, replyToId:$replyTo }){ comment{ id } } }',
            { id: state.discussionId, body: body, replyTo: replyTo },
            token
          );
          cacheClearAll(); // 清缓存，确保自己刚发的评论立即可见
          showDetail(state.discussionNum);
        } catch (e) {
          btn.disabled = false;
          box.insertAdjacentHTML('beforeend', '<p class="f-error">' + esc(e.message || t('forum.err')) + '</p>');
        }
      });
    });
  }

  /* ---------- 发起新讨论 ---------- */
  function showNewForm() {
    if (!listEl) return;
    var html = '<a class="back-link" href="discuss.html#forum">' + esc(t('forum.backToList')) + '</a>';
    if (!loggedIn()) {
      html += '<div class="f-login-banner"><a class="f-login" href="' + esc(loginUrl()) + '">' + t('forum.login') + '</a></div>';
    } else {
      html += '<div class="f-form">' +
        '<label class="f-label">' + esc(t('forum.form.title')) + '</label>' +
        '<input class="f-input" id="f-title" maxlength="200" placeholder="' + esc(t('forum.form.title.ph')) + '">' +
        '<label class="f-label">' + esc(t('forum.form.body')) + '</label>' +
        '<textarea class="f-input" id="f-body" rows="6" placeholder="' + esc(t('forum.form.body.ph')) + '"></textarea>' +
        '<div class="f-form-actions">' +
          '<button class="btn-primary" type="button" data-f-act="create">' + esc(t('forum.form.submit')) + '</button>' +
          '<a class="btn-secondary" href="discuss.html#forum">' + esc(t('forum.form.cancel')) + '</a>' +
        '</div>' +
      '</div>';
    }
    listEl.innerHTML = html;

    var btn = listEl.querySelector('[data-f-act="create"]');
    if (btn) {
      btn.addEventListener('click', async function () {
        var title = (document.getElementById('f-title').value || '').trim();
        var body = (document.getElementById('f-body').value || '').trim();
        if (!title) { document.getElementById('f-title').focus(); return; }
        btn.disabled = true;
        try {
          var token = await ensureToken();
          if (!token) {
            btn.disabled = false;
            listEl.insertAdjacentHTML('beforeend', '<p class="f-error">' + esc(t('forum.tokenFail')) + '</p>');
            return;
          }
          var catId = await getCategoryId();
          var res = await gql(
            'mutation($repoId:ID!,$cat:ID!,$title:String!,$body:String!){ createDiscussion(input:{ repositoryId:$repoId, categoryId:$cat, title:$title, body:$body }){ discussion{ number id url } } }',
            { repoId: REPO_ID, cat: catId, title: title, body: body },
            token
          );
          cacheClearAll(); // 清缓存，确保新讨论立即出现在列表
          var num = res.createDiscussion.discussion.number;
          location.hash = '#forum=' + num;
        } catch (e) {
          btn.disabled = false;
          listEl.insertAdjacentHTML('beforeend', '<p class="f-error">' + esc(e.message || t('forum.err')) + '</p>');
        }
      });
    }
  }

  /* ---------- 事件委托 ---------- */
  if (listEl) {
    listEl.addEventListener('click', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('[data-f-act]') : null;
      if (!el) return;
      var act = el.getAttribute('data-f-act');
      if (act === 'logout') logout();
    });
  }
  if (viewEl) {
    viewEl.querySelectorAll('[data-f-act]').forEach(function (el) {
      el.addEventListener('click', function () {
        var act = el.getAttribute('data-f-act');
        if (act === 'new') showNewForm();
      });
    });
  }

  /* ---------- 对外接口 ---------- */
  window.HY_FORUM = {
    open: function () {
      if (!viewEl) return;
      viewEl.hidden = false;
      if (githubLink) githubLink.href = GITHUB_DISCUSSIONS;
      renderUser();
      showList();
      window.scrollTo(0, 0);
    },
    close: function () {
      if (viewEl) viewEl.hidden = true;
    },
    openDiscussion: function (num) {
      if (!viewEl) return;
      viewEl.hidden = false;
      if (githubLink) githubLink.href = GITHUB_DISCUSSIONS;
      renderUser();
      showDetail(num);
      window.scrollTo(0, 0);
    },
    openNew: function () {
      if (!viewEl) return;
      viewEl.hidden = false;
      renderUser();
      showNewForm();
      window.scrollTo(0, 0);
    },
  };
})();

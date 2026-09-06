/* ==========================================================================
   i18n.js — 全站中英文切换（hongyuguo.com）
   - 文案字典：zh / en，通过 data-i18n（纯文本）与 data-i18n-html（含链接）标记
   - 语言选择：localStorage（hy-lang）> 浏览器语言；首次访问中文用户默认中文
   - 切换按钮：[data-lang] 元素，点击后 apply() 并派发 hy:langchange 事件
   ========================================================================== */
(function () {
  'use strict';

  var DICT = {
    zh: {
      'meta.title.index': 'Hongyu Guo · 独立开发者',
      'nav.about': '关于',
      'nav.projects': '作品',
      'nav.now': '此刻',
      'nav.links': '链接',
      'nav.community': '社区',

      'hero.role': '独立开发者',
      'hero.tagline': '做小而美的软件，让数字生活更好。',
      'hero.poem': '让数字生活，好用如诗，好看如画',
      'hero.cta.work': '看看我的作品',
      'hero.cta.touch': '与我联系',

      'scene.about': '01 — 关于',
      'scene.projects': '02 — 作品',
      'scene.now': '03 — 此刻',
      'scene.links': '04 — 链接',
      'scene.community': '05 — 社区',
      'title.about': '关于',
      'title.projects': '作品',
      'title.now': '此刻',
      'title.links': '链接',
      'title.community': '留言讨论',
      'links.bilibili': '哔哩哔哩',
      'links.red': '小红书',

      'about.p1': '你好，我是郭宏宇——一名来自湖北黄冈、暂居武汉的独立开发者。我设计并打造了两款小而美的软件，让数字生活更安全便捷、也更赏心悦目：一款是本地加密、密文上云、跨设备本地解密的密码管理器 SafeVault，另一款是让 Mac 桌面活起来的壁纸应用 MaiKer。两款软件均由我独立设计、编写、打包与上架，由深圳市宏荣天秀贸易有限公司运营。',
      'about.p2': '<a href="https://safevault-service.online" target="_blank" rel="noopener">SafeVault</a> 与 <a href="https://macwall.skin" target="_blank" rel="noopener">MaiKer</a>——两款作品均由我独立设计、开发，已在 iOS、macOS、Android、Windows 四个平台上线。若你也对开发感兴趣，欢迎与我联系，一起探讨、一起学习。',

      'projects.tag.safevault': '密码管理器',
      'projects.tag.maiker': '壁纸应用',
      'projects.safevault': '深夜合盖，密码以密文安睡云端——采用<a href="https://csrc.nist.gov/publications/detail/fips/197/final" target="_blank" rel="noopener">加密标准 AES-256-GCM</a> 认证加密与 PBKDF2 密钥派生，明文从不离开设备；四端同步只传输密文，服务器被攻破也无法还原一条密码。',
      'projects.maiker': '晨起雪山初醒，午后麦浪翻涌，入夜萤火浮游——动态壁纸把桌面变成流动的风景；飘雪、萤火、随鼠标绽放的星光，还有踩着音乐节拍律动的时钟，每一次点亮屏幕，都是一场新的相遇。',
      'projects.visit': '访问网站 →',

      'ext.note': 'vscode 扩展开发案例：<a href="https://marketplace.visualstudio.com/items?itemName=honor-world.ext-trans-picker" target="_blank" rel="noopener">扩展选择助手</a>、<a href="https://marketplace.visualstudio.com/items?itemName=honor-world.dev-env-sync" target="_blank" rel="noopener">部署环境一键迁移</a>、<a href="https://marketplace.visualstudio.com/items?itemName=honor-world.local-skill-quick-launch" target="_blank" rel="noopener">本地skill快捷调用</a>、<a href="https://marketplace.visualstudio.com/items?itemName=honor-world.ChairmanMao-guide-life" target="_blank" rel="noopener">毛主席思想指导</a>',

      'now.copy': '正在打磨 SafeVault 在四个平台的下一个版本，精修 MaiKer 的内容管线，每天学一点新东西。',

      'community.copy': '对我开发的软件有建议、问题或功能愿望？每个产品都有专属话题，等你来聊。',
      'community.enter': '进入讨论区 →',
      'community.qr': '手机扫码留言',

      'footer.copyright': '© 2026 郭宏宇 —— 做小而美的软件，让数字生活更好。',
      'footer.credit': '鲤鱼、青蛙和荷花池塘 3D 模型由作者（Hongyu Guo）创作 · <a href="https://www.cgmodel.com/model/551075.html" target="_blank" rel="noopener">CGmodel</a>',

      /* ---- 留言讨论页 ---- */
      'discuss.eyebrow': '社区',
      'discuss.sub': '对我开发的软件有想法？选一个话题，留下你的建议、吐槽或功能愿望。',
      'discuss.sub2': '产品建议 · 扩展反馈 · 自由讨论 · 手机扫码随时参与 · 由 GitHub 守护内容安全',
      'discuss.group.products': '软件产品',
      'discuss.group.extensions': 'VS Code 扩展',
      'discuss.group.other': '其他话题',
      'discuss.join': '进入讨论',
      'discuss.scan': '扫码',
      'discuss.general.title': '自由讨论',
      'discuss.general.sub': '与具体产品无关的想法、建议或闲聊？在 GitHub Discussions 发起或浏览任意话题，作者同样会看到并回复。',
      'discuss.general.btn': '发起 / 浏览自由讨论 →',
      'discuss.general.qr': '手机扫码，直达自由讨论',
      'discuss.qr.strong': '手机扫码，随时随地留言',
      'discuss.qr.p': '扫描二维码直接进入讨论区，在手机上即可参与任意话题讨论。',
      'discuss.back': '← 全部话题',
      'discuss.mainTitle': '讨论区',
      'discuss.note': '登录 GitHub 即可留言。你的建议会实时出现在这里，也可以前往 GitHub 参与管理。',
      'discuss.fallback.title': '讨论区正在搭建中……',
      'discuss.fallback.copy': '留言功能将由 GitHub Discussions 提供（无需本站服务器、防垃圾、可审核）。在此之前，欢迎直接到 GitHub 上参与讨论。',
      'discuss.fallback.btn': '前往 GitHub Discussions',
      'discuss.copy': '复制本页链接',
      'discuss.toast': '链接已复制',
      'discuss.side.how': '参与方式',
      'discuss.side.s1': '点击「登录」用 GitHub 账号授权',
      'discuss.side.s2': '写下建议或问题，点击发表',
      'discuss.side.s3': '对他人评论点赞、回应或提出新的想法',
      'discuss.side.safety': '内容安全',
      'discuss.side.safety.copy': '评论由 GitHub 托管与审核，作者本人可在后台随时管理；仅需 GitHub 账号，杜绝匿名垃圾信息。',
      'discuss.side.qr': '手机扫码，直接进入本话题',
      'discuss.titleSuffix': '留言讨论 · hongyuguo.com',

      /* ---- 自由讨论论坛（站内，数据同步 GitHub） ---- */
      'forum.eyebrow': '论坛',
      'forum.title': '自由讨论',
      'forum.sub': '与产品无关的话题，在这里发起、浏览与回复，发言实时同步到 GitHub Discussions。',
      'forum.sub2': '任何话题都可以在这里发起。发言与回复实时同步到 GitHub Discussions，两边都能看到。',
      'forum.new': '发起新讨论',
      'forum.github': '在 GitHub 查看',
      'forum.login': '使用 GitHub 登录后发言',
      'forum.logout': '退出登录',
      'forum.loggedIn': '已登录',
      'forum.tokenFail': '获取发布权限失败，请刷新页面后重试',
      'forum.list.empty': '还没有讨论，来发第一帖吧。',
      'forum.list.comments': '条评论',
      'forum.loading': '加载中…',
      'forum.err': '加载失败，请稍后再试',
      'forum.rateLimited': '访问太频繁，GitHub 限流中，请稍后再试',
      'forum.cached': '网络不太给力，先展示稍早的缓存内容',
      'forum.backToList': '← 返回讨论列表',
      'forum.detail.comments': '评论',
      'forum.noComments': '还没有评论，来抢沙发。',
      'forum.comment.ph': '写下你的回复……',
      'forum.comment.submit': '发表评论',
      'forum.form.title': '标题',
      'forum.form.title.ph': '一句话说清楚你想聊什么',
      'forum.form.body': '内容',
      'forum.form.body.ph': '详细说说你的想法……',
      'forum.form.submit': '发布',
      'forum.form.cancel': '取消',
    },

    en: {
      'meta.title.index': 'Hongyu Guo · Indie Developer',
      'nav.about': 'About',
      'nav.projects': 'Projects',
      'nav.now': 'Now',
      'nav.links': 'Links',
      'nav.community': 'Community',

      'hero.role': 'Indie Developer',
      'hero.tagline': 'Building small software for a better digital life.',
      'hero.poem': 'Digital life, as useful as poetry, as beautiful as painting.',
      'hero.cta.work': 'See my work',
      'hero.cta.touch': 'Get in touch',

      'scene.about': '01 — About',
      'scene.projects': '02 — Projects',
      'scene.now': '03 — Now',
      'scene.links': '04 — Links',
      'scene.community': '05 — Community',
      'title.about': 'About',
      'title.projects': 'Projects',
      'title.now': 'Now',
      'title.links': 'Links',
      'title.community': 'Community',
      'links.bilibili': 'Bilibili',
      'links.red': 'RED',

      'about.p1': 'Hi, I’m Hongyu Guo — an indie developer from Huanggang, Hubei, China, currently based in Wuhan. I design and build small software that makes digital life safer, simpler, and a little more beautiful: SafeVault, a password manager that encrypts on your device, syncs ciphertext to the cloud, and decrypts locally across devices; and MaiKer, wallpapers that make your Mac feel alive. Both are designed, coded, packaged, and published by myself, and operated by Shenzhen Honor World Trading Co., Ltd.',
      'about.p2': '<a href="https://safevault-service.online" target="_blank" rel="noopener">SafeVault</a> and <a href="https://macwall.skin" target="_blank" rel="noopener">MaiKer</a> — both designed and built by myself, live on iOS, macOS, Android, and Windows. If you’re into building things too, feel free to reach out — let’s explore and learn together.',

      'projects.tag.safevault': 'Password manager',
      'projects.tag.maiker': 'Wallpaper app',
      'projects.safevault': 'Close the lid at night — your passwords rest in the cloud as ciphertext. Built on the <a href="https://csrc.nist.gov/publications/detail/fips/197/final" target="_blank" rel="noopener">AES-256-GCM standard</a> with authenticated encryption and PBKDF2 key derivation, plaintext never leaves your device; sync transmits ciphertext only, so a breached server can recover not a single password.',
      'projects.maiker': 'Dawn on snowy peaks, wheat rippling at noon, fireflies drifting at dusk — live wallpapers turn your desktop into flowing scenery: drifting snow, fireflies, stardust blooming under your cursor, and a clock pulsing to your music. Every wake of the screen is a new encounter.',
      'projects.visit': 'Visit site →',

      'ext.note': 'VS Code extension case studies: <a href="https://marketplace.visualstudio.com/items?itemName=honor-world.ext-trans-picker" target="_blank" rel="noopener">Extension Picker</a>, <a href="https://marketplace.visualstudio.com/items?itemName=honor-world.dev-env-sync" target="_blank" rel="noopener">Dev Env Sync</a>, <a href="https://marketplace.visualstudio.com/items?itemName=honor-world.local-skill-quick-launch" target="_blank" rel="noopener">Local Skill Quick Launch</a>, <a href="https://marketplace.visualstudio.com/items?itemName=honor-world.ChairmanMao-guide-life" target="_blank" rel="noopener">Mao’s Thought Guidance</a>',

      'now.copy': 'Shipping the next SafeVault update across four platforms, refining the MaiKer content pipeline, and learning something new every day.',

      'community.copy': 'Thoughts, questions, or feature wishes about my software? Every product has its own topic — come chat.',
      'community.enter': 'Join the discussion →',
      'community.qr': 'Scan to comment',

      'footer.copyright': '© 2026 Hongyu Guo — Building small software for a better digital life.',
      'footer.credit': 'Carp, Frog &amp; Lotus Pond 3D models by the author (Hongyu Guo) · <a href="https://www.cgmodel.com/model/551075.html" target="_blank" rel="noopener">CGmodel</a>',

      /* ---- Discussion page ---- */
      'discuss.eyebrow': 'Community',
      'discuss.sub': 'Ideas about my software? Pick a topic and leave your suggestions, rants, or feature wishes.',
      'discuss.sub2': 'Product feedback · Extension talk · Open topics · Scan to join on mobile · Powered by GitHub Discussions',
      'discuss.group.products': 'Apps & Products',
      'discuss.group.extensions': 'VS Code Extensions',
      'discuss.group.other': 'Other Topics',
      'discuss.join': 'Discuss',
      'discuss.scan': 'Scan',
      'discuss.general.title': 'Open Discussion',
      'discuss.general.sub': 'Ideas, suggestions, or chit-chat not tied to a specific product? Start or browse any topic on GitHub Discussions — I read and reply there too.',
      'discuss.general.btn': 'Start / browse discussions →',
      'discuss.general.qr': 'Scan to open discussions',
      'discuss.qr.strong': 'Scan to comment, anytime',
      'discuss.qr.p': 'Scan the code to enter the discussion area and join any topic from your phone.',
      'discuss.back': '← All topics',
      'discuss.mainTitle': 'Discussion',
      'discuss.note': 'Sign in with GitHub to comment. Your feedback appears here in real time, and you can manage it on GitHub too.',
      'discuss.fallback.title': 'Discussions are being set up…',
      'discuss.fallback.copy': 'Comments will be powered by GitHub Discussions — no server load on this site, spam-resistant and moderated. Until it goes live, feel free to join the conversation on GitHub.',
      'discuss.fallback.btn': 'Go to GitHub Discussions',
      'discuss.copy': 'Copy link',
      'discuss.toast': 'Link copied',
      'discuss.side.how': 'How it works',
      'discuss.side.s1': 'Sign in with your GitHub account',
      'discuss.side.s2': 'Write your suggestion or question, then post',
      'discuss.side.s3': 'React to comments, reply, or raise new ideas',
      'discuss.side.safety': 'Content safety',
      'discuss.side.safety.copy': 'Comments are hosted and moderated by GitHub. The author can manage everything from the dashboard — a GitHub account keeps anonymous spam out.',
      'discuss.side.qr': 'Scan to open this topic on your phone',
      'discuss.titleSuffix': 'Community · hongyuguo.com',

      /* ---- Open forum (on-site, synced with GitHub) ---- */
      'forum.eyebrow': 'Forum',
      'forum.title': 'Open Discussion',
      'forum.sub': 'Anything not tied to a product: start, browse, and reply here. Posts sync to GitHub Discussions in real time.',
      'forum.sub2': 'Start any topic here. Posts and replies sync in real time with GitHub Discussions — visible from both sides.',
      'forum.new': 'New discussion',
      'forum.github': 'View on GitHub',
      'forum.login': 'Sign in with GitHub to post',
      'forum.logout': 'Sign out',
      'forum.loggedIn': 'Signed in',
      'forum.tokenFail': 'Could not get posting permission — refresh and try again',
      'forum.list.empty': 'No discussions yet — start the first one.',
      'forum.list.comments': 'comments',
      'forum.loading': 'Loading…',
      'forum.err': 'Failed to load, please try again',
      'forum.rateLimited': 'Too many requests — GitHub rate limiting, try again later',
      'forum.cached': 'Network hiccup — showing cached content from a moment ago',
      'forum.backToList': '← Back to discussions',
      'forum.detail.comments': 'Comments',
      'forum.noComments': 'No comments yet — be the first.',
      'forum.comment.ph': 'Write a reply…',
      'forum.comment.submit': 'Comment',
      'forum.form.title': 'Title',
      'forum.form.title.ph': 'What do you want to discuss?',
      'forum.form.body': 'Content',
      'forum.form.body.ph': 'Share your thoughts…',
      'forum.form.submit': 'Post',
      'forum.form.cancel': 'Cancel',
    },
  };

  var STORAGE_KEY = 'hy-lang';

  function detectLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'zh' || saved === 'en') return saved;
    } catch (e) { /* ignore */ }
    return (navigator.language || 'en').slice(0, 2).toLowerCase() === 'zh' ? 'zh' : 'en';
  }

  var lang = detectLang();

  function t(key) {
    return (DICT[lang] && DICT[lang][key]) || (DICT.en[key] != null ? DICT.en[key] : key);
  }

  function apply() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    // 纯文本
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var v = t(nodes[i].getAttribute('data-i18n'));
      if (v != null) nodes[i].textContent = v;
    }

    // 含链接的富文本（文案来自本站字典，安全）
    var rich = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < rich.length; j++) {
      var hv = t(rich[j].getAttribute('data-i18n-html'));
      if (hv != null) rich[j].innerHTML = hv;
    }

    // 页面标题（discuss 详情页由 discuss.js 接管）
    var titleKey = document.documentElement.getAttribute('data-title-key');
    if (titleKey) {
      var tv = t(titleKey);
      if (tv) document.title = tv;
    }

    // 语言切换高亮
    var links = document.querySelectorAll('.lang-switch [data-lang]');
    for (var k = 0; k < links.length; k++) {
      links[k].classList.toggle('active', links[k].getAttribute('data-lang') === lang);
    }
  }

  function setLang(next) {
    if (next !== 'zh' && next !== 'en') return;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    apply();
    document.dispatchEvent(new CustomEvent('hy:langchange', { detail: { lang: lang } }));
  }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('.lang-switch [data-lang]') : null;
    if (el) {
      e.preventDefault();
      setLang(el.getAttribute('data-lang'));
    }
  });

  window.HY_I18N = {
    getLang: function () { return lang; },
    t: t,
    setLang: setLang,
    apply: apply,
  };

  apply();
})();

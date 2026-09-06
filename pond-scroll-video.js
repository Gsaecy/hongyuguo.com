/* pond-scroll-video.js — 滚动驱动视频 scrub（荷花池 3D 环绕镜头）
 * 101 帧渲染序列已压缩为 H.264 MP4（assets/video/hehuachi-orbit.mp4,约 1.4MB）。
 * 视频不自动播放,仅随滚动进度 seek 到对应帧(帧号 f ↔ 时间 f/FPS 秒);
 * 视频加载失败时回退为按需加载 JPG 帧序列(assets/video/hehuachi/,不预载全部)。
 */
(function () {
  'use strict';

  var FRAME_COUNT = 101;
  var FPS = 30;
  var BASE = 'assets/video/hehuachi/hehuachi';

  var hero = document.getElementById('hero-pond');
  var vid = document.getElementById('pond-video');
  var frameEl = document.getElementById('pond-frame');
  var veil = document.getElementById('white-veil');
  var screens = {
    hero: document.getElementById('screen-hero'),
    about: document.getElementById('screen-about'),
    projects: document.getElementById('screen-projects'),
    end: document.getElementById('screen-end'),
  };

  /* ---------- 装饰元素(鲤鱼/青蛙)布局:大小位置沿用旧版逻辑 ---------- */
  var carpEl = document.querySelector('.carp-img');
  var frogEl = document.querySelector('.frog-frames');
  var nowZone = document.querySelector('.now-zone');
  var linksZone = document.querySelector('.links-zone');
  var carpInit = null, frogInit = null;
  var carpBase = 0, frogBase = 0; // 布局得出的目标不透明度(空间不足时<1)
  var layoutFrame = 0;

  /* 鲤鱼/青蛙为纯装饰，不可点击；CGmodel 出处见页脚版权行 */

  function layoutDecor() {
    if (!carpEl || !frogEl || !nowZone || !linksZone) return;
    if (!carpInit && carpEl.complete && carpEl.naturalWidth) {
      var lb0 = linksZone.querySelector('.end-block').getBoundingClientRect();
      var ch = lb0.height * 0.75;
      carpInit = { h: ch, w: ch * carpEl.naturalWidth / carpEl.naturalHeight };
    }
    if (!frogInit && frogEl.querySelector('.frog-frame').complete) {
      var lb = linksZone.querySelector('.end-block').getBoundingClientRect();
      var fw = frogEl.querySelector('.frog-frame').naturalWidth;
      var fh = frogEl.querySelector('.frog-frame').naturalHeight;
      frogInit = { h: lb.height * 0.75, w: lb.height * 0.75 * fw / fh };
    }

    var GAP = 20;
    if (carpInit) {
      var zr = nowZone.getBoundingClientRect();
      var copyRect = nowZone.querySelector('.now-copy').getBoundingClientRect();
      var availL = Math.max(0, (copyRect.left - zr.left) * 2);
      var minW1 = carpInit.w * 0.7;
      var w1 = Math.max(minW1, Math.min(carpInit.w, availL));
      carpEl.style.width = w1.toFixed(1) + 'px';
      carpEl.style.height = (w1 * carpInit.h / carpInit.w).toFixed(1) + 'px';
      var carpLeft = copyRect.left - zr.left - w1 / 2;
      carpEl.style.left = Math.max(0, carpLeft).toFixed(1) + 'px';
      carpBase = availL >= carpInit.w ? 1
        : availL <= minW1 ? 0.5
        : (0.5 + 0.5 * (availL - minW1) / (carpInit.w - minW1));
    }
    if (frogInit) {
      var innerRect = document.querySelector('.end-inner').getBoundingClientRect();
      var footerLine = document.querySelector('.end-footer p');
      var frng = document.createRange();
      frng.selectNodeContents(footerLine);
      var footerText = frng.getBoundingClientRect();
      var footerBox = footerLine.getBoundingClientRect();
      var linksRect = linksZone.querySelector('.end-block').getBoundingClientRect();
      frogEl.style.bottom = (innerRect.bottom - footerBox.bottom).toFixed(1) + 'px';
      var availR = innerRect.right - Math.max(linksRect.right, footerText.right) - GAP;
      var minW2 = frogInit.w * 0.7;
      var w2 = Math.max(minW2, Math.min(frogInit.w, availR));
      frogEl.style.width = w2.toFixed(1) + 'px';
      frogEl.style.height = (w2 * frogInit.h / frogInit.w).toFixed(1) + 'px';
      frogBase = availR >= frogInit.w ? 1
        : availR <= minW2 ? 0.5
        : (0.5 + 0.5 * (availR - minW2) / (frogInit.w - minW2));
    }
  }

  addEventListener('resize', function () { layoutDecor(); fitScreens(); });
  [carpEl, frogEl.querySelector('.frog-frame.f1'), frogEl.querySelector('.frog-frame.f2')].forEach(function (el) {
    if (el) el.addEventListener('load', function () { layoutDecor(); update(); });
  });

  /* ---------- 视频 scrub(不自动播放,只 seek) ---------- */
  var videoOK = false;
  var fallbackActive = false;
  var seeking = false;
  var pendingTime = null;
  var lastShownVideo = -1; // 视频已 seek 到的帧
  var lastTarget = 0;      // 最近一次 update 的目标帧
  var fallbackFrames = {}; // 回退模式:已加载/加载中的帧
  var shownFallback = -1;  // 回退模式:当前显示的帧

  var pad = function (i) { return String(i).length < 4 ? new Array(4 - String(i).length + 1).join('0') + i : String(i); };
  var targetTime = function (f) { return f / FPS; };

  vid.addEventListener('loadeddata', function () {
    if (videoOK) return;
    videoOK = true;
    vid.style.opacity = '1'; // 从 poster 淡入真实首帧
    showFrameVideo(lastTarget);
  });

  vid.addEventListener('seeked', function () {
    seeking = false;
    if (pendingTime !== null) {
      var t = pendingTime; pendingTime = null;
      doSeek(t);
    }
  });

  /* 缓冲未覆盖目标帧时不 seek（避免滚动时触发网络 Range 请求造成卡顿），
     等 progress 事件缓冲到位后再补 seek */
  var pendingFrame = null;

  function isBufferedAt(t) {
    try {
      for (var i = 0; i < vid.buffered.length; i++) {
        if (t >= vid.buffered.start(i) && t <= vid.buffered.end(i)) return true;
      }
    } catch (e) {}
    return false;
  }

  vid.addEventListener('progress', function () {
    if (pendingFrame === null) return;
    if (isBufferedAt(targetTime(pendingFrame))) {
      var f = pendingFrame; pendingFrame = null;
      lastShownVideo = -1;
      showFrameVideo(f);
    }
  });

  vid.addEventListener('error', function () {
    if (videoOK) return; // 已正常工作,忽略后续错误
    enableFallback();
  });

  function enableFallback() {
    if (fallbackActive) return;
    fallbackActive = true;
    vid.style.display = 'none';
    showFrameFallback(lastTarget);
  }

  function doSeek(t) {
    if (seeking) { pendingTime = t; return; }
    seeking = true;
    var done = true;
    try {
      vid.currentTime = t;
      done = Math.abs(vid.currentTime - t) < 0.05; // 已就位则无需等 seeked
    } catch (e) { done = true; }
    if (done) {
      seeking = false;
      if (pendingTime !== null) { var pt = pendingTime; pendingTime = null; doSeek(pt); }
    }
  }

  function showFrameVideo(f) {
    if (f === lastShownVideo) return;
    lastShownVideo = f;
    var t = targetTime(f);
    if (!isBufferedAt(t)) { pendingFrame = f; return; }
    doSeek(t);
  }

  /* ---------- 回退:按需加载 JPG 帧(目标帧±1,不预载全部) ---------- */
  function loadFallback(f) {
    if (fallbackFrames[f]) return;
    var img = new Image();
    img.onload = function () {
      if (f === lastTarget && shownFallback !== f) {
        shownFallback = f;
        frameEl.src = img.src;
      }
    };
    img.src = BASE + pad(f) + '.jpg';
    fallbackFrames[f] = img;
  }

  function showFrameFallback(f) {
    if (shownFallback === f) return;
    var img = fallbackFrames[f];
    if (img && img.complete && img.naturalWidth) {
      shownFallback = f;
      frameEl.src = img.src;
      return;
    }
    loadFallback(f);
    if (f > 0) loadFallback(f - 1);
    if (f < FRAME_COUNT - 1) loadFallback(f + 1);
  }

  /* ---------- 内容面板适配：内容超出视口时整体缩放，避免出现第二条滚动条 ---------- */
  /* 面板内部块(panel-inner/end-inner)：按“视口高 - 块顶部偏移”为可用高度缩放 */
  function fitInner(key, innerSel) {
    var screen = screens[key];
    var inner = screen && screen.querySelector(innerSel);
    if (!inner) return;
    inner.style.transform = 'none';
    inner.style.marginTop = '';
    inner.style.marginBottom = '';
    var avail = screen.clientHeight - inner.getBoundingClientRect().top;
    var h = inner.offsetHeight;
    if (h <= avail) return;
    var s = Math.max(0.6, avail / h);
    inner.style.transform = 'scale(' + s.toFixed(4) + ')';
    inner.style.transformOrigin = 'top center';
    inner.style.marginTop = Math.max(0, (avail - h * s) / 2).toFixed(1) + 'px';
    inner.style.marginBottom = '0';
  }

  /* 第 1 幕 hero：整屏内容居中缩放 */
  function fitHero() {
    var hero = screens.hero;
    hero.style.transform = 'none';
    var avail = hero.clientHeight;
    var h = hero.scrollHeight;
    if (h <= avail) return;
    var s = Math.max(0.62, avail / h);
    hero.style.transform = 'scale(' + s.toFixed(4) + ')';
    hero.style.transformOrigin = 'center center';
  }

  function fitScreens() {
    fitHero();
    fitInner('about', '.panel-inner');
    fitInner('projects', '.panel-inner');
    fitInner('end', '.end-inner');
  }

  /* ---------- 内容场景区间 ---------- */
  var SCREENS_RANGE = [
    ['hero', -0.5, 0.17],
    ['about', 0.17, 0.42],
    ['projects', 0.42, 0.68],
    ['end', 0.68, 1.1], // 结尾不淡出:白幕只盖 3D 背景,内容保持显示
  ];

  function applyScreens(p) {
    for (var k = 0; k < SCREENS_RANGE.length; k++) {
      var key = SCREENS_RANGE[k][0], lo = SCREENS_RANGE[k][1], hi = SCREENS_RANGE[k][2];
      var fade = key === 'hero' ? 0.05 : 0.06;
      var a = Math.min(1, Math.max(0, (p - lo) / fade)) *
              Math.min(1, Math.max(0, (hi - p) / fade));
      screens[key].style.opacity = a.toFixed(3);
      screens[key].classList.toggle('visible', a > 0.5);
    }
    veil.style.opacity = Math.min(1, Math.max(0, (p - 0.9) / 0.08)).toFixed(3);
  }

  /* ---------- 导航 / CTA：点击 data-scene 锚点平滑滚动到对应幕 ---------- */
  var SCENE_P = { hero: 0, about: 0.3, projects: 0.55, now: 0.92, links: 0.96, end: 0.98 };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[data-scene]') : null;
    if (!a) return;
    var scene = a.getAttribute('data-scene');
    if (!(scene in SCENE_P)) return;
    e.preventDefault();
    var maxScroll = Math.max(1, hero.offsetHeight - innerHeight);
    window.scrollTo(0, Math.round(SCENE_P[scene] * maxScroll));
  });

  /* ---------- 滚动 scrub ---------- */
  var ticking = false;

  function update() {
    ticking = false;
    var maxScroll = Math.max(1, hero.offsetHeight - innerHeight);
    var p = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    var f = Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1)));
    lastTarget = f;
    applyScreens(p);

    if (videoOK) showFrameVideo(f);
    else if (fallbackActive) showFrameFallback(f);

    // 鱼和青蛙:结尾白幕渐显时由透明渐变到不透明(仅最后一页出现)
    if (++layoutFrame % 12 === 0) layoutDecor();
    if (layoutFrame % 60 === 0) fitScreens();
    var decor = Math.min(1, Math.max(0, (p - 0.78) / 0.14));
    decor = decor * decor * (3 - 2 * decor);
    carpEl.style.opacity = decor.toFixed(2);
    frogEl.style.opacity = decor.toFixed(2);
  }

  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  addEventListener('resize', update);
  addEventListener('load', fitScreens);
  setTimeout(fitScreens, 600);
  setTimeout(fitScreens, 1600);

  // 视频可能早于本脚本注册监听前就快速失败(preload 与 error 竞态),初始化兑底检查
  if (vid.error || vid.networkState === 3 /* NETWORK_NO_SOURCE */) enableFallback();

  // 视频也可能在脚本执行前就完成首帧解码(缓存命中),loadeddata 早于监听注册,兑底启用视频路径
  if (!fallbackActive && !videoOK && vid.readyState >= 2 && !vid.error) {
    videoOK = true;
    vid.style.opacity = '1';
    showFrameVideo(lastTarget);
  }

  fitScreens();
  update();
})();

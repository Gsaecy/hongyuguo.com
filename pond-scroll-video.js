/* pond-scroll-video.js — 滚动驱动视频 scrub（荷花池 3D 环绕镜头）
 * 101 帧渲染序列已压缩为 H.264 MP4（assets/video/hehuachi-orbit.mp4,约 1.4MB）。
 * 视频不自动播放,仅随滚动进度 seek 到对应帧(帧号 f ↔ 时间 f/FPS 秒);
 * 视频加载失败时回退为按需加载 JPG 帧序列(assets/video/hehuachi/,不预载全部)。
 */
(function () {
  'use strict';

  var FRAME_COUNT = 101;
  var FPS = 30;

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
  var stillEls = [];       // 托底模式:三张交叉淡化图

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
      return;
    }
    // 目标帧未缓冲：向目标方向找最近的已缓冲帧渐进逼近，避免弱网下画面冻结
    var dir = pendingFrame > lastShownVideo ? 1 : -1;
    var found = -1;
    for (var g = lastShownVideo + dir; g >= 0 && g < FRAME_COUNT; g += dir) {
      if (isBufferedAt(targetTime(g))) { found = g; break; }
    }
    if (found !== -1) {
      lastShownVideo = -1;
      showFrameVideo(found);
    }
  });

  var videoRetried = false;

  vid.addEventListener('error', function () {
    if (fallbackActive) return; // 托底已启用,忽略停止下载引发的 error
    if (videoOK) return; // 已正常工作,忽略后续错误
    if (!videoRetried) {
      // 瞬时网络错误重试一次,仍失败才降级回退
      videoRetried = true;
      vid.load();
      return;
    }
    enableFallback();
  });

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

  /* ---------- 托底:三张图交叉淡化 + Ken Burns 推进(视频失败或极慢网时启用) ---------- */
  var STILLS = ['pond/ctd2.jpg', 'pond/ct7.jpg', 'pond/ct8.jpg'];

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function smoothstep(x) { return x * x * (3 - 2 * x); }

  function enableFallback() {
    if (fallbackActive) return;
    fallbackActive = true;
    vid.style.display = 'none';
    // 停止视频下载节省慢网带宽(会触发 error,已被上方 guard 拦截)
    vid.removeAttribute('src');
    vid.load();
    var scene = document.querySelector('.pond-scene');
    STILLS.forEach(function (src, i) {
      var img = document.createElement('img');
      img.className = 'pond-img';
      img.setAttribute('data-i', String(i));
      img.src = src;
      img.alt = '';
      img.style.opacity = '0';
      scene.appendChild(img);
      stillEls.push(img);
    });
    update();
  }

  function showStills(p) {
    if (!stillEls.length) return;
    // 三段交叉淡化:ctd2(0~0.25) → ct7(0.2~0.5) → ct8(0.45~)
    var ops = [
      Math.min(1, smoothstep(clamp01((0.25 - p) / 0.08))),
      Math.min(1, smoothstep(clamp01((p - 0.20) / 0.08))) * Math.min(1, smoothstep(clamp01((0.50 - p) / 0.08))),
      Math.min(1, smoothstep(clamp01((p - 0.45) / 0.08))),
    ];
    for (var i = 0; i < 3; i++) {
      var img = stillEls[i];
      img.style.opacity = ops[i].toFixed(3);
      var local = i === 0 ? clamp01(p / 0.21) : i === 1 ? clamp01((p - 0.21) / 0.25) : clamp01((p - 0.46) / 0.34);
      var s = i === 2 ? 1 : 1.16 + local * 0.08;
      img.style.transform = 'scale(' + s.toFixed(4) + ')';
    }
  }

  /* ---------- 内容面板适配：内容超出视口时按比例缩放。
     zoom 会同步缩小布局高度(彻底消除内层滚动条),旧浏览器回退 transform ---------- */
  var supportsZoom = (function () {
    var d = document.createElement('div');
    return typeof d.style.zoom === 'string';
  })();

  function setScale(el, s) {
    if (s >= 1) {
      el.style.zoom = '';
      el.style.transform = '';
      return;
    }
    if (supportsZoom) {
      el.style.zoom = (Math.round(s * 1000) / 1000).toString();
      el.style.transform = '';
    } else {
      el.style.transform = 'scale(' + s.toFixed(4) + ')';
      el.style.transformOrigin = 'center center';
    }
  }

  /* 面板内部块(panel-inner/end-inner)：可用高度 = 视口高 - 面板上下内边距，
     zoom 后显式对称 margin 居中，使 scrollHeight 精确等于视口高(彻底无溢出) */
  function fitInner(key, innerSel) {
    var screen = screens[key];
    var inner = screen && screen.querySelector(innerSel);
    if (!inner) return;
    setScale(inner, 1);
    inner.style.marginTop = '';
    inner.style.marginBottom = '';
    var cs = getComputedStyle(screen);
    var padTop = parseFloat(cs.paddingTop) || 0;
    var padBottom = parseFloat(cs.paddingBottom) || 0;
    var avail = screen.clientHeight - padTop - padBottom;
    var h = inner.offsetHeight;
    if (h <= avail) return; // 自然高度可容纳，交给 auto margin 居中
    var s = Math.max(0.5, avail / h);
    setScale(inner, s);
    var mt = Math.max(0, (avail - h * s) / 2);
    inner.style.marginTop = mt.toFixed(1) + 'px';
    inner.style.marginBottom = mt.toFixed(1) + 'px';
  }

  /* 第 1 幕 hero：内容包裹层按可用高度等比缩放 */
  function fitHero() {
    var hero = screens.hero;
    var inner = hero && hero.querySelector('.hero-inner');
    if (!inner) return;
    setScale(inner, 1);
    var cs = getComputedStyle(hero);
    var avail = hero.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
    var h = inner.offsetHeight;
    if (h <= avail) return;
    setScale(inner, Math.max(0.5, avail / h));
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
    else if (fallbackActive) showStills(p);

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
  document.addEventListener('hy:langchange', fitScreens); // 语言切换文案高度变化后重新适配
  setTimeout(fitScreens, 600);
  setTimeout(fitScreens, 1600);

  // 极慢网络托底:4 秒内视频未出首帧,切换三图交叉淡化
  setTimeout(function () {
    if (!videoOK && !fallbackActive) enableFallback();
  }, 4000);

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

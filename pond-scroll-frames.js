/* pond-scroll-frames.js — 滚动驱动帧序列(3D 环绕镜头 scrub)
 * 101 帧 PNG→JPEG,滚动进度映射帧号;4 个内容场景按区间显隐。
 */
(function () {
  'use strict';

  var FRAME_COUNT = 101;
  var BASE = 'assets/video/hehuachi/hehuachi';

  var hero = document.getElementById('hero-pond');
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

  var MODEL_URL = 'https://www.cgmodel.com/model/551075.html';
  function openModel() { window.open(MODEL_URL, '_blank', 'noopener'); }
  carpEl.addEventListener('click', openModel);
  frogEl.addEventListener('click', openModel);

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

  addEventListener('resize', layoutDecor);
  [carpEl, frogEl.querySelector('.frog-frame.f1'), frogEl.querySelector('.frog-frame.f2')].forEach(function (el) {
    if (el) el.addEventListener('load', function () { layoutDecor(); update(); });
  });

  /* ---------- 预加载全部帧 ---------- */
  var frames = new Array(FRAME_COUNT);
  var loadedCount = 0;
  var pad = function (i) { return String(i).length < 4 ? new Array(4 - String(i).length + 1).join('0') + i : String(i); };

  var loadBar = document.createElement('div');
  loadBar.style.cssText = 'position:fixed;left:0;top:0;height:3px;background:#e5631f;width:0;z-index:300';
  document.body.appendChild(loadBar);

  for (var i = 0; i < FRAME_COUNT; i++) {
    (function (idx) {
      var img = new Image();
      img.onload = function () {
        loadedCount++;
        loadBar.style.width = Math.round(loadedCount / FRAME_COUNT * 100) + '%';
        if (loadedCount === FRAME_COUNT) { loadBar.style.display = 'none'; }
      };
      img.onerror = function () { loadedCount++; };
      img.src = BASE + pad(idx) + '.jpg';
      frames[idx] = img;
    })(i);
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

  /* ---------- 滚动 scrub ---------- */
  var currentFrame = -1;
  var ticking = false;

  function update() {
    ticking = false;
    var maxScroll = Math.max(1, hero.offsetHeight - innerHeight);
    var p = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    var f = Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1)));
    if (f !== currentFrame && frames[f] && frames[f].complete) {
      currentFrame = f;
      frameEl.src = frames[f].src;
    }
    applyScreens(p);

    // 鱼和青蛙:结尾白幕渐显时由透明渐变到不透明(仅最后一页出现)
    if (++layoutFrame % 12 === 0) layoutDecor();
    var decor = Math.min(1, Math.max(0, (p - 0.78) / 0.14));
    decor = decor * decor * (3 - 2 * decor);
    carpEl.style.opacity = decor.toFixed(2);
    frogEl.style.opacity = decor.toFixed(2);
  }

  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });

  addEventListener('resize', update);
  update();
})();

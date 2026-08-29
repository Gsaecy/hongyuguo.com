/* ==========================================================================
   Scroll story for preview-cursor.html — 4 scenes in one sticky viewport
   Scene 1 (0.00–0.25): ctd2 still + intro copy
   Scene 2 (0.25–0.50): ctd2 → ct7 cross-fade + About (glass card)
   Scene 3 (0.50–0.75): ct7  → ct8 cross-fade + Projects (glass card)
   Scene 4 (0.75–1.00): ct8 fades to white + Now / Links / footer
   Nav links scroll to the matching scene.
   ========================================================================== */
(function () {
  'use strict';

  var imgs = Array.prototype.slice.call(document.querySelectorAll('.pond-img'));
  var shadeEl = document.getElementById('pond-shade');
  var veilEl = document.getElementById('white-veil');
  var scenes = {
    hero: document.getElementById('screen-hero'),
    about: document.getElementById('screen-about'),
    projects: document.getElementById('screen-projects'),
    end: document.getElementById('screen-end')
  };
  var heroTrack = document.querySelector('.hero-pond');

  function clamp01(x) { return Math.max(0, Math.min(1, x)); }
  function smooth(x) { return x * x * (3 - 2 * x); }

  function scrollProgress() {
    if (!heroTrack) return 0;
    var rect = heroTrack.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    var scrollY = window.scrollY || window.pageYOffset;
    var docTop = rect.top + scrollY; // track's document offset (nav sits above it)
    return clamp01((scrollY - docTop) / total);
  }

  // opacity envelope: fade in before `a`, hold until `b`, fade out after `b`
  function envelope(p, a, b, fade) {
    return Math.min(smooth(clamp01((p - (a - fade)) / fade)), smooth(clamp01((b + fade - p) / fade)));
  }

  var FADE = 0.06;

  // scene anchors: hero / about / projects / end
  var anchors = [0.03, 0.36, 0.61, 0.88];
  function nearestAnchor(p) {
    var bi = 0, bd = Math.abs(p - anchors[0]);
    for (var i = 1; i < anchors.length; i++) {
      var d = Math.abs(p - anchors[i]);
      if (d < bd) { bd = d; bi = i; }
    }
    return bi;
  }

  // during a page-turn, the backdrop stays on the STARTING page's pond image;
  // only that image's Ken Burns process animation plays; in the final 30% of
  // the glide it cross-fades to the destination page's image.
  var glidePage = null, glideK = null, glideTargetP = null;

  function tick() {
    if (document.hidden) { requestAnimationFrame(tick); return; }
    var p = scrollProgress();

    // --- backdrop stills ---
    var active, activeO = 1, targetImg = -1, targetO = 0;
    if (gliding && glidePage !== null && glideK !== null) {
      active = glidePage; // starting page's image
      { // 100% of the glide is a cross-fade to the destination image
        var cross = smooth(glideK);
        activeO = 1 - cross;
        var ti = nearestAnchor(glideTargetP);
        if (ti !== active && ti < anchors.length - 1) { targetImg = ti; targetO = cross; }
      }
    } else {
      active = nearestAnchor(p);
    }
    imgs.forEach(function (img, i) {
      var o = 0;
      if (i === active) o = activeO;
      if (i === targetImg) o = targetO;
      img.style.opacity = String(o);
      var local = i === 0 ? clamp01(p / 0.21) :
                  i === 1 ? clamp01((p - 0.21) / 0.25) :
                            clamp01((p - 0.46) / 0.34);
      // 第三张图全屏 cover，不参与 Ken Burns 放大
      var s = i === 2 ? 1 : 1.16 + local * 0.08;
      img.style.transform = 'scale(' + s.toFixed(4) + ')';
    });

    // --- cream veil: full at intro, mostly gone while reading scenes ---
    var shadeO = 1 - 0.9 * smooth(clamp01((p - 0.02) / 0.16));
    if (shadeEl) shadeEl.style.opacity = String(Math.max(0.06, shadeO));

    // --- white-out for the final scene ---
    if (veilEl) veilEl.style.opacity = String(smooth(clamp01((p - 0.72) / 0.14)));

    // --- content scenes ---
    var sceneOps = {
      hero: envelope(p, 0.00, 0.12, 0.05),
      about: envelope(p, 0.29, 0.43, 0.06),
      projects: envelope(p, 0.54, 0.68, 0.06),
      end: smooth(clamp01((p - 0.76) / 0.10))
    };
    Object.keys(sceneOps).forEach(function (key) {
      var el = scenes[key];
      if (!el) return;
      var o = sceneOps[key];
      el.style.opacity = String(o);
      el.classList.toggle('visible', o > 0.5);
    });

    // keep decorative images sized to available space
    if (++layoutFrame % 15 === 0) layoutDecor();

    requestAnimationFrame(tick);
  }
  tick();

  // --- decorative carp & frog: fit beside text, fade out when no room ---
  var carpEl = document.querySelector('.carp-img');
  var frogEl = document.querySelector('.frog-frames');
  var nowZone = document.querySelector('.now-zone');
  var linksZone = document.querySelector('.links-zone');
  var carpInit = null, frogInit = null;
  var layoutFrame = 0;

  // click the carp or frog to open the CGmodel source page
  var MODEL_URL = 'https://www.cgmodel.com/model/551075.html';
  function openModel() { window.open(MODEL_URL, '_blank', 'noopener'); }
  carpEl.addEventListener('click', openModel);
  frogEl.addEventListener('click', openModel);

  function layoutDecor() {
    if (!carpEl || !frogEl || !nowZone || !linksZone) return;
    if (!carpInit && carpEl.complete && carpEl.naturalWidth) {
      var lb0 = linksZone.querySelector('.end-block').getBoundingClientRect();
      // carp is same size as the frog: 75% of the links block height (doubled from 0.375)
      var ch = lb0.height * 0.75;
      carpInit = { h: ch, w: ch * carpEl.naturalWidth / carpEl.naturalHeight };
    }
    if (!frogInit && frogEl.querySelector('.frog-frame').complete) {
      var lb = linksZone.querySelector('.end-block').getBoundingClientRect();
      var fw = frogEl.querySelector('.frog-frame').naturalWidth;
      var fh = frogEl.querySelector('.frog-frame').naturalHeight;
      // frog is 75% of the links block height (was 50%, enlarged 1.5x)
      frogInit = { h: lb.height * 0.75, w: lb.height * 0.75 * fw / fh };
    }

    var GAP = 20;
    if (carpInit) {
      var zr = nowZone.getBoundingClientRect();
      var copyRect = nowZone.querySelector('.now-copy').getBoundingClientRect();
      // carp's horizontal center aligns with the copy's left edge;
      // available width = twice the distance from zone edge to that line
      var availL = Math.max(0, (copyRect.left - zr.left) * 2);
      var minW1 = carpInit.w * 0.7; // shrink at most 30%
      var w1 = Math.max(minW1, Math.min(carpInit.w, availL));
      carpEl.style.width = w1.toFixed(1) + 'px';
      carpEl.style.height = (w1 * carpInit.h / carpInit.w).toFixed(1) + 'px';
      var carpLeft = copyRect.left - zr.left - w1 / 2;
      carpEl.style.left = Math.max(0, carpLeft).toFixed(1) + 'px';
      carpEl.style.opacity = availL >= carpInit.w ? '1'
        : availL <= minW1 ? '0.5'
        : (0.5 + 0.5 * (availL - minW1) / (carpInit.w - minW1)).toFixed(2);
    }
    if (frogInit) {
      var innerRect = document.querySelector('.end-inner').getBoundingClientRect();
      var footerLine = document.querySelector('.end-footer p');
      var frng = document.createRange();
      frng.selectNodeContents(footerLine);
      var footerText = frng.getBoundingClientRect(); // text extent, not full block width
      var footerBox = footerLine.getBoundingClientRect();
      var linksRect = linksZone.querySelector('.end-block').getBoundingClientRect();
      // bottom edge aligned with the copyright line's bottom
      frogEl.style.bottom = (innerRect.bottom - footerBox.bottom).toFixed(1) + 'px';
      var availR = innerRect.right - Math.max(linksRect.right, footerText.right) - GAP;
      var minW2 = frogInit.w * 0.7; // shrink at most 30%
      var w2 = Math.max(minW2, Math.min(frogInit.w, availR));
      frogEl.style.width = w2.toFixed(1) + 'px';
      frogEl.style.height = (w2 * frogInit.h / frogInit.w).toFixed(1) + 'px';
      frogEl.style.opacity = availR >= frogInit.w ? '1'
        : availR <= minW2 ? '0.5'
        : (0.5 + 0.5 * (availR - minW2) / (frogInit.w - minW2)).toFixed(2);
    }
  }

  window.addEventListener('resize', layoutDecor);

  // --- rAF eased glide with configurable duration (text/nav are fixed layers now) ---
  var glideRAF = null, gliding = false;
  var GLIDE_MS = 3200; // page-turn duration (slowed 2x again: ~1/8 of native speed)
  function glideTo(targetY, duration) {
    if (glideRAF) cancelAnimationFrame(glideRAF);
    var dur = duration || GLIDE_MS;
    var startY = window.scrollY || window.pageYOffset;
    var dist = targetY - startY;
    var t0 = null;
    gliding = true;
    glidePage = nearestAnchor(scrollProgress()); // lock the starting page's image
    glideTargetP = clamp01((targetY - (heroTrack.getBoundingClientRect().top + startY)) / (heroTrack.getBoundingClientRect().height - window.innerHeight));
    glideK = 0;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      glideK = k;
      var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; // easeInOutCubic
      window.scrollTo(0, Math.round(startY + dist * e));
      if (k < 1) {
        glideRAF = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetY); // exact landing
        gliding = false; glideRAF = null; glidePage = null; glideK = null; glideTargetP = null;
        scheduleSnap();
      }
    }
    glideRAF = requestAnimationFrame(step);
  }
  function cancelGlide() {
    if (glideRAF) { cancelAnimationFrame(glideRAF); glideRAF = null; }
    gliding = false;
    glidePage = null; glideK = null; glideTargetP = null;
  }

  // --- auto-snap: only when the scroll stops NEAR a full scene, glide in ---
  var SNAP_RANGE = 0.14; // snap when within ~14% of an anchor (blind zones stay small)
  var snapTimer = null;
  function scheduleSnap() {
    if (snapTimer) clearTimeout(snapTimer);
    snapTimer = setTimeout(function () {
      if (gliding) return; // still animating
      var p = scrollProgress();
      var idx = nearestAnchor(p);
      var best = anchors[idx];
      var bestD = Math.abs(p - best);
      if (bestD > 0.015 && bestD <= SNAP_RANGE) { // close enough → glide in
        var rect = heroTrack.getBoundingClientRect();
        var total = rect.height - window.innerHeight;
        var y = rect.top + window.scrollY + total * best;
        glideTo(y);
      }
    }, 200);
  }
  // Ignore glide's own scroll frames; user scroll re-arms snap after it settles.
  window.addEventListener('scroll', function () {
    if (gliding) return;
    scheduleSnap();
  }, { passive: true });

  // --- wheel = page-turn command: any scroll in a direction flips one scene ---
  var wheelLock = false, wheelTimer = null;
  window.addEventListener('wheel', function (e) {
    e.preventDefault(); // scrolling becomes a page-turn, not a distance
    if (wheelLock) return;
    wheelLock = true;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () { wheelLock = false; }, 400);

    var dir = e.deltaY > 0 ? 1 : -1;
    var idx = nearestAnchor(scrollProgress());
    var next = Math.max(0, Math.min(anchors.length - 1, idx + dir));
    var rect = heroTrack.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    var y = rect.top + (window.scrollY || 0) + total * anchors[next];
    glideTo(y);
  }, { passive: false });

  // --- nav: scroll to the matching scene ---
  var sceneTargets = { about: 0.36, projects: 0.61, now: 0.88, links: 0.88 };
  document.querySelectorAll('.nav-links a, [data-scene]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var key = a.getAttribute('data-scene');
      if (!key || !heroTrack) return;
      e.preventDefault();
      var target = sceneTargets[key] || 0;
      var total = heroTrack.getBoundingClientRect().height - window.innerHeight;
      var y = heroTrack.getBoundingClientRect().top + window.scrollY + total * target;
      cancelGlide();
      glideTo(y);
    });
  });
})();

/* ==========================================================================
   Cyberpunk 3D hero scene v2 — friendly service-robot head
   - Robot head with screen-eyes, antenna, translucent shell
   - 6 link nodes (screens) in depth, each = a site (SafeVault/MaiKer/X/…)
   - Energy tubes from head to nodes, pulses travelling inside
   - Hover a node → robot raises a sign showing that site's icon
   - Click a node → open the site; mouse parallax throughout
   Uses local three.min.js (0.137) + local favicons in assets/icons/*.png
   ========================================================================== */
(function () {
  'use strict';

  var el = document.getElementById('scene3d');
  if (!el || !window.THREE) return;

  var isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900;

  // ---- sites / link nodes ------------------------------------------------
  var SITES = [
    { key: 'safevault', name: 'SafeVault',  url: 'https://safevault-service.online', pos: new THREE.Vector3(-5.4, 1.5, -4.6), color: 0x2fd6ff },
    { key: 'maiker',    name: 'MaiKer',     url: 'https://macwall.skin',            pos: new THREE.Vector3(5.7, 1.3, -4.4),  color: 0xff6a3d },
    { key: 'x',         name: 'X (Twitter)',url: 'https://x.com/hongyuguo',         pos: new THREE.Vector3(-7.0, -0.9, -3.4), color: 0x9fd8ff },
    { key: 'github',    name: 'GitHub',     url: 'https://github.com/hongyuguo',    pos: new THREE.Vector3(6.9, -1.1, -3.6),  color: 0x8ff4ff },
    { key: 'bilibili',  name: 'Bilibili 哔哩哔哩', url: 'https://space.bilibili.com/000000000', pos: new THREE.Vector3(-3.9, -2.7, -5.0), color: 0x5fd6ff },
    { key: 'red',       name: 'RED 小红书', url: 'https://www.xiaohongshu.com/user/profile/0000000000000000', pos: new THREE.Vector3(4.0, -2.9, -5.2), color: 0xff6a6a }
  ];

  // ---- renderer / scene / camera -------------------------------------------
  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05050b);
  scene.fog = new THREE.FogExp2(0x05050b, 0.045);

  var camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 80);
  camera.position.set(0, 1.6, 9.2);

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(el.clientWidth, el.clientHeight);
  el.appendChild(renderer.domElement);

  // ---- lights ---------------------------------------------------------------
  scene.add(new THREE.AmbientLight(0x1a2a3a, 1.5));
  var keyLight = new THREE.PointLight(0x00e5ff, 1.5, 30); keyLight.position.set(2, 2.5, 4); scene.add(keyLight);
  var rimLight = new THREE.PointLight(0xff4a6e, 1.1, 30); rimLight.position.set(-5, -1.5, 3); scene.add(rimLight);
  var backLight = new THREE.PointLight(0x2fd6ff, 0.9, 30); backLight.position.set(0, 1, -4); scene.add(backLight);

  var root = new THREE.Group();
  scene.add(root);

  // ---- canvas texture helpers ------------------------------------------------
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawIconToCanvas(ctx, img, cx, cy, size) {
    if (!img) { // fallback: rounded square + letter
      ctx.fillStyle = 'rgba(0,229,255,0.25)';
      roundRect(ctx, cx - size / 2, cy - size / 2, size, size, size * 0.22);
      ctx.fill();
      ctx.fillStyle = '#eaffff';
      ctx.font = 'bold ' + Math.round(size * 0.55) + 'px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', cx, cy);
      return;
    }
    ctx.save();
    roundRect(ctx, cx - size / 2, cy - size / 2, size, size, size * 0.22);
    ctx.clip();
    ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();
  }

  function loadIcon(key, done) {
    var img = new Image();
    img.onload = function () { done(img); };
    img.onerror = function () { done(null); };
    img.src = 'assets/icons/' + key + '.png';
  }

  var nodeScreenTextures = {};
  var signTextures = {};

  function buildScreenTexture(site, done) {
    var c = document.createElement('canvas');
    c.width = 256; c.height = 176;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#0a1420';
    ctx.fillRect(0, 0, c.width, c.height);
    loadIcon(site.key, function (img) {
      drawIconToCanvas(ctx, img, 128, 88, 112);
      ctx.strokeStyle = 'rgba(0,229,255,0.12)';
      ctx.lineWidth = 1;
      for (var gx = 0; gx < c.width; gx += 32) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, c.height); ctx.stroke(); }
      for (var gy = 0; gy < c.height; gy += 32) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(c.width, gy); ctx.stroke(); }
      var tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      nodeScreenTextures[site.key] = tex;
      if (done) done(tex);
    });
  }

  function buildSignTexture(site, done) {
    var c = document.createElement('canvas');
    c.width = 1024; c.height = 480;
    var ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(8,14,24,0.92)';
    roundRect(ctx, 0, 0, c.width, c.height, 60);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,229,255,0.75)';
    ctx.lineWidth = 8;
    roundRect(ctx, 4, 4, c.width - 8, c.height - 8, 56);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,229,255,0.9)';
    ctx.lineWidth = 6;
    [[40, 40, 1, 1], [c.width - 40, 40, -1, 1]].forEach(function (p) {
      ctx.beginPath();
      ctx.moveTo(p[0] + 70 * p[2], p[1]); ctx.lineTo(p[0], p[1]); ctx.lineTo(p[0], p[1] + 70 * p[3]);
      ctx.stroke();
    });
    ctx.fillStyle = '#eaffff';
    ctx.font = '600 92px system-ui, sans-serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(site.name, 430, 240);
    loadIcon(site.key, function (img) {
      drawIconToCanvas(ctx, img, 200, 240, 280);
      var tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      signTextures[site.key] = tex;
      if (done) done(tex);
    });
  }

  // ===========================================================================
  // ROBOT HEAD — friendly service bot
  // ===========================================================================
  var bot = new THREE.Group();
  var botHome = new THREE.Vector3(isMobile ? 0 : 2.6, isMobile ? 1.15 : -0.15, 0);

  var dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 48, 48),
    new THREE.MeshPhysicalMaterial({ color: 0x9fc4d8, transparent: true, opacity: 0.16, roughness: 0.15, metalness: 0.3, clearcoat: 0.8 })
  );
  bot.add(dome);

  var botWire = new THREE.Mesh(
    new THREE.SphereGeometry(1.47, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0x2fd6ff, wireframe: true, transparent: true, opacity: 0.13 })
  );
  bot.add(botWire);

  var face = new THREE.Mesh(
    new THREE.CircleGeometry(0.78, 48),
    new THREE.MeshBasicMaterial({ color: 0x0e2a3c })
  );
  face.position.set(0, 0.12, 1.06);
  bot.add(face);

  var eyeGlowMat = new THREE.MeshBasicMaterial({ color: 0x6ff3ff });
  var eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), eyeGlowMat);
  eyeL.position.set(-0.26, 0.28, 1.32);
  bot.add(eyeL);
  var eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), eyeGlowMat);
  eyeR.position.set(0.26, 0.28, 1.32);
  bot.add(eyeR);

  var mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.045, 8, 40, Math.PI * 0.9),
    new THREE.MeshBasicMaterial({ color: 0x6ff3ff })
  );
  mouth.position.set(0, -0.2, 1.22);
  mouth.rotation.z = Math.PI;
  bot.add(mouth);

  var antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8),
    new THREE.MeshPhysicalMaterial({ color: 0x2a3d52, roughness: 0.35, metalness: 0.8 })
  );
  antenna.position.set(0.55, 1.65, 0);
  antenna.rotation.z = -0.35;
  bot.add(antenna);
  var antennaTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff6a3d })
  );
  antennaTip.position.set(0.78, 1.92, 0);
  bot.add(antennaTip);

  var collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.72, 0.5, 24),
    new THREE.MeshPhysicalMaterial({ color: 0x1e3148, roughness: 0.4, metalness: 0.7 })
  );
  collar.position.y = -1.72;
  bot.add(collar);
  var collarRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.025, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0x2fd6ff, transparent: true, opacity: 0.6 })
  );
  collarRing.position.y = -1.5;
  collarRing.rotation.x = Math.PI / 2;
  bot.add(collarRing);

  var haloCount = isMobile ? 90 : 170;
  var haloPos = new Float32Array(haloCount * 3);
  for (var h = 0; h < haloCount; h++) {
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    var r = 1.62 + Math.random() * 0.65;
    haloPos[h * 3] = r * Math.sin(phi) * Math.cos(theta);
    haloPos[h * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    haloPos[h * 3 + 2] = r * Math.cos(phi);
  }
  var haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));
  var halo = new THREE.Points(haloGeo, new THREE.PointsMaterial({
    color: 0x6ff3ff, size: 0.032, transparent: true, opacity: 0.6,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  bot.add(halo);

  bot.position.copy(botHome);
  root.add(bot);

  // ===========================================================================
  // NODES — little depth computers, one per site
  // ===========================================================================
  var hitboxes = [];

  SITES.forEach(function (site) {
    var g = new THREE.Group();

    var screenMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.92 });
    var screen = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.96), screenMat);
    screen.position.z = 0.1;
    g.add(screen);
    g.userData.screenMat = screenMat;

    var frame = new THREE.Mesh(
      new THREE.BoxGeometry(1.66, 1.12, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x2fd6ff, wireframe: true, transparent: true, opacity: 0.4 })
    );
    g.add(frame);
    g.userData.frameMat = frame.material;

    var stand = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 1.1, 0.16),
      new THREE.MeshBasicMaterial({ color: 0x22374a, wireframe: true, transparent: true, opacity: 0.5 })
    );
    stand.position.y = -1.16;
    g.add(stand);

    g.position.copy(site.pos);
    g.lookAt(botHome);
    root.add(g);

    // invisible hitbox for hover (opacity 0 material, visible mesh)
    var hit = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.8, 1.1),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.position.copy(site.pos);
    hit.lookAt(botHome);
    hit.position.add(new THREE.Vector3(0, 0, 0.35));
    root.add(hit);
    hit.userData.site = site;
    hit.userData.nodeGroup = g;
    hitboxes.push(hit);

    buildScreenTexture(site);
  });

  // ===========================================================================
  // TUBES — head to every node, energy pulses inside
  // ===========================================================================
  var flows = [];
  SITES.forEach(function (site, i) {
    var dir = site.pos.clone().sub(botHome).normalize();
    var p0 = botHome.clone().add(dir.multiplyScalar(1.35));
    var p1 = site.pos.clone();
    var mid = p0.clone().add(p1).multiplyScalar(0.5);
    mid.add(new THREE.Vector3(0, 0.6 + Math.sin(i * 2.1) * 0.8, 0.4));
    var path = new THREE.CatmullRomCurve3([p0, mid, p1]);

    var outer = new THREE.Mesh(
      new THREE.TubeGeometry(path, 64, 0.06, 10, false),
      new THREE.MeshPhysicalMaterial({ color: 0x12303e, transparent: true, opacity: 0.3, roughness: 0.25, metalness: 0.35 })
    );
    root.add(outer);
    var inner = new THREE.Mesh(
      new THREE.TubeGeometry(path, 64, 0.022, 8, false),
      new THREE.MeshBasicMaterial({ color: site.color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    root.add(inner);

    var orbCount = isMobile ? 2 : 3;
    for (var j = 0; j < orbCount; j++) {
      var orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 12, 12),
        new THREE.MeshBasicMaterial({ color: site.color, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      root.add(orb);
      flows.push({ orb: orb, curve: path, phase: j / orbCount, speed: 0.12 + Math.random() * 0.05, dir: i % 2 === 0 ? 1 : -1 });
    }
  });

  // ===========================================================================
  // SIGN — robot raises a board showing the hovered site's icon
  // ===========================================================================
  var signGroup = new THREE.Group();
  var signMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, side: THREE.DoubleSide });
  var signBoard = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.18), signMat);
  signGroup.add(signBoard);
  var handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8),
    new THREE.MeshBasicMaterial({ color: 0x2fd6ff, transparent: true, opacity: 0 })
  );
  handle.position.y = -1.3;
  signGroup.add(handle);
  signGroup.position.set(botHome.x, -2.6, 0);
  root.add(signGroup);

  SITES.forEach(function (site) { buildSignTexture(site); });

  // ===========================================================================
  // DEPTH GRID + DUST
  // ===========================================================================
  var grid = new THREE.GridHelper(60, 40, 0x1c4a5e, 0x0b1a26);
  grid.position.y = -4.8;
  root.add(grid);

  var dustCount = isMobile ? 180 : 380;
  var dustPos = new Float32Array(dustCount * 3);
  for (var d = 0; d < dustCount; d++) {
    dustPos[d * 3] = (Math.random() - 0.5) * 26;
    dustPos[d * 3 + 1] = (Math.random() - 0.5) * 14;
    dustPos[d * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0x4fd6ff, size: 0.024, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  root.add(dust);

  // ===========================================================================
  // INTERACTION — hover node → sign; click node → open site
  // ===========================================================================
  var raycaster = new THREE.Raycaster();
  var pointer = new THREE.Vector2(-9, -9);
  var hovered = null;
  var hoverT = 0;

  window.addEventListener('pointermove', function (e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });
  window.addEventListener('touchmove', function (e) {
    if (e.touches.length) {
      pointer.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
    }
  }, { passive: true });
  window.addEventListener('pointerdown', function () {
    if (hovered && hovered.userData.site) {
      window.open(hovered.userData.site.url, '_blank', 'noopener');
    }
  });

  var targetRX = 0, targetRY = 0, rx = 0, ry = 0;
  window.addEventListener('pointermove', function (e) {
    targetRY = (e.clientX / window.innerWidth - 0.5) * 0.35;
    targetRX = -(e.clientY / window.innerHeight - 0.5) * 0.2;
  });

  // ===========================================================================
  // RENDER LOOP
  // ===========================================================================
  var clock = new THREE.Clock();

  function tick() {
    if (!document.hidden) {
      var t = clock.getElapsedTime();

      rx += (targetRX - rx) * 0.04;
      ry += (targetRY - ry) * 0.04;
      root.rotation.x = rx;
      root.rotation.y = ry;

      // hover detection
      raycaster.setFromCamera(pointer, camera);
      var hits = raycaster.intersectObjects(hitboxes, false);
      var nowHovered = hits.length ? hits[0].object : null;
      if (nowHovered !== hovered) {
        hovered = nowHovered;
        el.style.cursor = hovered ? 'pointer' : 'default';
      }
      var targetHover = hovered ? 1 : 0;
      hoverT += (targetHover - hoverT) * 0.1;

      // node highlight
      hitboxes.forEach(function (hit) {
        var g = hit.userData.nodeGroup;
        var active = hit === hovered;
        g.userData.frameMat.opacity += ((active ? 0.95 : 0.4) - g.userData.frameMat.opacity) * 0.12;
        g.userData.frameMat.color.setHex(active ? 0x8ff4ff : 0x2fd6ff);
        g.userData.screenMat.opacity += ((active ? 1 : 0.85) - g.userData.screenMat.opacity) * 0.12;
        var s = active ? 1.14 : 1;
        g.scale.setScalar(g.scale.x + (s - g.scale.x) * 0.12);
      });

      // sign board
      if (hovered) {
        var site = hovered.userData.site;
        if (signMat.map !== signTextures[site.key]) {
          signMat.map = signTextures[site.key];
          signMat.needsUpdate = true;
        }
      }
      signMat.opacity += (hoverT - signMat.opacity) * 0.14;
      handle.material.opacity = signMat.opacity;
      var signY = botHome.y + (hovered ? 2.5 : -2.7);
      signGroup.position.y += (signY - signGroup.position.y) * 0.12;
      signGroup.position.x = botHome.x + 0.4;
      signGroup.lookAt(camera.position);

      // robot idle & reactions
      bot.rotation.y = Math.sin(t * 0.4) * 0.18;
      halo.rotation.y = t * 0.35;
      halo.rotation.x = t * 0.2;
      collarRing.rotation.z = t * 0.4;
      var eyeBright = hovered ? 1.3 : 0.85 + Math.sin(t * 2.2) * 0.12;
      eyeGlowMat.color.setHex(hovered ? 0xff4a6e : 0x6ff3ff);
      eyeL.scale.setScalar(eyeBright);
      eyeR.scale.setScalar(eyeBright);
      var lookX = 0, lookY = 0;
      if (hovered) {
        var v = hovered.userData.site.pos.clone().sub(botHome).normalize();
        lookX = v.x * 0.06; lookY = v.y * 0.06;
      }
      eyeL.position.x = -0.26 + lookX; eyeL.position.y = 0.28 + lookY;
      eyeR.position.x = 0.26 + lookX; eyeR.position.y = 0.28 + lookY;
      antennaTip.scale.setScalar(1 + Math.sin(t * 3.2) * 0.18);

      // energy orbs
      flows.forEach(function (f) {
        var tt = ((t * f.speed) + f.phase) % 1;
        if (f.dir < 0) tt = 1 - tt;
        f.orb.position.copy(f.curve.getPointAt(tt));
        f.orb.scale.setScalar(0.65 + 0.45 * Math.sin(t * 6 + f.phase * 12));
      });

      dust.rotation.y = t * 0.02;

      camera.position.y = 1.6 + Math.sin(t * 0.6) * 0.16;
      camera.lookAt(botHome.x * 0.8, botHome.y, 0);

      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }
  tick();

  window.addEventListener('resize', function () {
    camera.aspect = el.clientWidth / el.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(el.clientWidth, el.clientHeight);
  });
})();

// Midnight Carnival — screens, layout, input, rendering and the play log.
(function () {
  const T = window.TUNING;
  const { Show, POWERUP, botShot, mulberry32 } = window.Carnival;
  const A = window.Art;
  const S = window.Sound;

  const $ = (id) => document.getElementById(id);
  const canvas = $('stage');
  const ctx = canvas.getContext('2d');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const params = new URLSearchParams(location.search);
  const BOT = params.has('bot') ? clamp(+params.get('bot') || 0.44, 0, 1) : null;
  const SPEED = BOT != null ? clamp(+params.get('speed') || 1, 1, 8) : 1; // QA: fast-forward bot nights

  // ------------------------------------------------------------ catalogue --
  const ICON = {
    flame: '<svg viewBox="0 0 24 24"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="#ff7a1c" stroke="#5a1a00" stroke-width="1.4" stroke-linejoin="round"/><path d="M12 12c1 1.5 2.6 2.6 2.6 4.8a2.6 2.6 0 0 1-5.2 0c0-1.3 1-2.1 1.6-2.6 0 .8.5 1.2 1 1.2 0-1.3-.5-2.1 0-3.4z" fill="#ffe680"/></svg>',
    chest: '<svg viewBox="0 0 24 24"><path d="M3 10a9 5 0 0 1 18 0v2H3z" fill="#2a8fb0" stroke="#08354a" stroke-width="1.4"/><rect x="3" y="11" width="18" height="9" rx="1.5" fill="#3ab0d0" stroke="#08354a" stroke-width="1.4"/><path d="M3 14h18" stroke="#08354a" stroke-width="1.2"/><rect x="10" y="12" width="4" height="5" rx="1" fill="#ffd257" stroke="#08354a" stroke-width="1.2"/></svg>',
    train: '<svg viewBox="0 0 24 24"><rect x="3" y="9" width="12" height="8" rx="1.5" fill="#8a90a2" stroke="#2b2f3c" stroke-width="1.4"/><rect x="13" y="5" width="6" height="12" rx="1.2" fill="#a2a8b8" stroke="#2b2f3c" stroke-width="1.4"/><rect x="5" y="5" width="3" height="4" fill="#6d7486" stroke="#2b2f3c" stroke-width="1.2"/><circle cx="7" cy="18.5" r="2.2" fill="#2b2f3c"/><circle cx="16" cy="18.5" r="2.2" fill="#2b2f3c"/><rect x="14.5" y="7" width="3" height="3" fill="#ffe680"/></svg>',
    curtain: '<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="3" rx="1" fill="#e8b33c" stroke="#3d0610" stroke-width="1.2"/><path d="M3 6h8c0 6-2 11-5 14H3z" fill="#c8304a" stroke="#3d0610" stroke-width="1.3"/><path d="M21 6h-8c0 6 2 11 5 14h3z" fill="#c8304a" stroke="#3d0610" stroke-width="1.3"/></svg>',
    lock: '<svg viewBox="0 0 22 26"><path d="M5 11V8a6 6 0 0 1 12 0v3" fill="none" stroke="#2c2a33" stroke-width="2.6"/><rect x="2" y="11" width="18" height="13" rx="3" fill="#4a4754" stroke="#2c2a33" stroke-width="2"/><circle cx="11" cy="17" r="2" fill="#2c2a33"/></svg>',
    ghost: '<svg viewBox="0 0 40 40"><path d="M8 34c-2-14 3-27 12-27s14 13 12 27c-2-2-3-2-4 0-1-2-3-2-4 0-1-2-3-2-4 0-1-2-3-2-4 0-1-2-2-2-4 0z" fill="#f4f4ff" stroke="#3c3a78" stroke-width="2"/><ellipse cx="16" cy="18" rx="2" ry="3" fill="#1b1430"/><ellipse cx="24" cy="18" rx="2" ry="3" fill="#1b1430"/><ellipse cx="20" cy="24" rx="1.6" ry="2" fill="#1b1430"/></svg>',
    pumpkin: '<svg viewBox="0 0 40 40"><path d="M19 9c0-3 1-5 4-6l1 2c-2 1-2 2-2 4z" fill="#5b6b2a" stroke="#2a140a" stroke-width="1.4"/><ellipse cx="20" cy="23" rx="16" ry="13" fill="#f27d16" stroke="#2a140a" stroke-width="2"/><path d="M14 11c-3 6-3 18 0 24M26 11c3 6 3 18 0 24" stroke="#b8480b" stroke-width="1.5" fill="none"/><path d="M12 20l4-4 2 5zM28 20l-4-4-2 5zM12 27q8 6 16 0l-3 3-2-2-2 3-2-3-2 2z" fill="#ffe36b" stroke="#5a2400" stroke-width="1"/></svg>',
    bat: '<svg viewBox="0 0 40 40"><path d="M20 15c-4-6-12-6-18-2 4 1 5 4 5 7 2-2 5-2 6 1 1-3 3-3 4-1 1-2 2-2 3-2s2 0 3 2c1-2 3-2 4 1 1-3 4-3 6-1 0-3 1-6 5-7-6-4-14-4-18 2z" fill="#3d2a5c" stroke="#110818" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="20" cy="20" rx="5" ry="6" fill="#4c3570" stroke="#110818" stroke-width="1.6"/><path d="M16 15l1-5 2 4M24 15l-1-5-2 4" fill="#3d2a5c" stroke="#110818" stroke-width="1.4"/><circle cx="18" cy="19" r="1.6" fill="#ffd23a"/><circle cx="22" cy="19" r="1.6" fill="#ffd23a"/></svg>',
    candy: '<svg viewBox="0 0 40 40"><path d="M9 14l-6-4 1 8zM31 26l6 4-1-8z" fill="#ff8ac0" stroke="#5a1a30" stroke-width="1.6" stroke-linejoin="round"/><circle cx="20" cy="20" r="11" fill="#ffb347" stroke="#5a2400" stroke-width="2"/><path d="M12 15c5 2 11 8 15 14M14 10c5 3 10 9 14 15" stroke="#fff3d0" stroke-width="2.4" fill="none"/></svg>',
    moon: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#d6e2ff" opacity=".25"/><path d="M26 6a14 14 0 1 0 8 22A12 12 0 0 1 26 6z" fill="#f4f0d0" stroke="#5a6a9a" stroke-width="1.6"/><circle cx="17" cy="16" r="2" fill="#d4ceb0"/><circle cx="14" cy="25" r="2.6" fill="#d4ceb0"/></svg>',
  };
  const STAMPS = [
    { key: 'hotStreak', name: 'Hot Streak', cls: 'hot', icon: 'flame', feat: () => `Reach a ×${T.hotStreakAt} streak with aimed shots.` },
    { key: 'prizeParade', name: 'Prize Parade', cls: 'parade', icon: 'chest', feat: () => 'Take all three prizes in one night, each on a live streak.' },
    { key: 'ghostTrain', name: 'Ghost Train', cls: 'train', icon: 'train', feat: () => `Fell ${T.ghostTrainFells} targets in one Spectral Slug burst.` },
    { key: 'lastAct', name: 'Last Act', cls: 'last', icon: 'curtain', feat: () => 'Reach the third act.' },
  ];
  const PU = {
    slug: { name: 'Spectral Slug', color: '#8fd8ff', glow: 'rgba(140,220,255,.55)', icon: 'ghost' },
    buckshot: { name: 'Candy Buckshot', color: '#ffb347', glow: 'rgba(255,170,70,.55)', icon: 'candy' },
    moonstruck: { name: 'Moonstruck', color: '#dfe8ff', glow: 'rgba(200,215,255,.55)', icon: 'moon' },
  };
  const ACT_CUES = [
    { title: 'Act one', sub: 'Step right up—the crowd is easy to please!' },
    { title: 'Act two', sub: 'The crowd wants sharper shooting!' },
    { title: 'Final act', sub: 'Final act—the crowd’s patience is running out!' },
  ];

  // --------------------------------------------------------------- storage --
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  // Best score and stamps are kept per level. Nights from before levels existed, and
  // nights from the short-lived Fun Mode, all count as The Pumpkin Patch.
  if (!store.get('mc.migrated.pumpkinPatch', false)) {
    const home = 'pumpkinPatch';
    let best = store.get(`mc.best.${home}`, 0);
    const stamps = store.get(`mc.stamps.${home}`, {});
    for (const suffix of ['', '.fun']) {
      best = Math.max(best, store.get(`mc.best${suffix}`, 0));
      const old = store.get(`mc.stamps${suffix}`, {});
      for (const k of Object.keys(old)) stamps[k] = (stamps[k] || 0) + (old[k] || 0);
      localStorage.removeItem(`mc.best${suffix}`);
      localStorage.removeItem(`mc.stamps${suffix}`);
    }
    store.set(`mc.best.${home}`, best);
    store.set(`mc.stamps.${home}`, stamps);
    store.set('mc.migrated.pumpkinPatch', true);
  }
  const LEVELS = T.LEVELS;
  let level = LEVELS.some((l) => l.id === store.get('mc.level')) ? store.get('mc.level') : 'pumpkinPatch';
  let best = 0, stampCounts = {};
  function useLevel(id) {
    level = id;
    T.setLevel(id);
    store.set('mc.level', id);
    best = store.get(`mc.best.${id}`, 0);
    stampCounts = store.get(`mc.stamps.${id}`, { hotStreak: 0, prizeParade: 0, ghostTrain: 0, lastAct: 0 });
  }
  const levelMeta = () => LEVELS.find((l) => l.id === level);
  useLevel(level);

  // ----------------------------------------------------------------- state --
  let W = 0, H = 0, dpr = 1, L = null;
  let screen = 'title';
  let show = null, paused = false, ending = null; // ending: { t } while the curtain falls
  let curtainDrop = 0;
  let touchMode = matchMedia('(pointer: coarse)').matches;
  let mouse = { x: -1, y: -1, inside: false };
  let touch = null;
  let lastAim = null;
  let recoil = 0;
  let clock = 0;
  let crowdExcite = 0;
  let sign = { queue: [], cur: null, t: 0 };
  let lastResult = null;
  const fx = { parts: [], floats: [], holes: [], chains: [], fans: [], deaths: [] };
  let moonK = 0;
  let layers = {};
  let botNext = 0, botRng = mulberry32(7);
  let titleRects = null, startHover = false;

  document.body.classList.toggle('touch', touchMode);

  // ---------------------------------------------------------------- layout --
  function computeLayout() {
    const tt = T.touch, strip = tt.cancelStripPx, lowerH = Math.max(48, tt.lowerAimAreaPx);
    const portrait = W / H < 0.95;
    const compact = !portrait && H < 520;
    let hudH, roofH, frontH, postW, bw, bh;
    if (portrait) {
      hudH = 136; roofH = clamp(H * 0.085, 54, 84); frontH = clamp(H * 0.05, 26, 80);
      postW = strip;
      bw = Math.min(W - 2 * strip, 640);
      bh = Math.min(H - hudH - roofH - lowerH - frontH, bw * 1.5);
    } else {
      hudH = compact ? 52 : clamp(H * 0.12, 72, 110);
      roofH = compact ? 36 : clamp(H * 0.13, 60, 120);
      frontH = compact ? 8 : clamp(H * 0.13, 40, 130);
      const avail = H - hudH - roofH - lowerH - frontH;
      const maxW = W - 2 * 64 - 2 * Math.max(16, W * 0.07);
      bw = Math.min(maxW, avail * 1.9);
      postW = clamp(bw * 0.06, strip, 64);
      bh = Math.min(avail, bw / 1.6);
    }
    bw = Math.round(bw); bh = Math.round(bh);
    const spare = Math.max(0, H - hudH - roofH - bh - lowerH - frontH);
    const top = hudH + Math.round(spare * 0.35);
    frontH += spare - Math.round(spare * 0.35);
    const booth = { x: Math.round((W - bw) / 2), y: top + roofH, w: bw, h: bh };
    const ledgeH = clamp(lowerH * 0.36, 14, 24);
    const beamH = compact ? roofH * 0.6 : roofH * 0.42;
    const signW = portrait ? bw * 0.86 : Math.min(bw * 0.6, 560);
    const signH = roofH - 6 - (compact ? 0 : beamH * 0.25);
    L = {
      W, H, portrait, compact, hudH, roofH, frontH, postW, strip, lowerH, ledgeH, beamH, booth,
      roofTop: top,
      lower: { x: booth.x, y: booth.y + bh, w: bw, h: lowerH },
      stripL: { x: booth.x - strip, y: booth.y, w: strip, h: bh + lowerH },
      stripR: { x: booth.x + bw, y: booth.y, w: strip, h: bh + lowerH },
      sign: { x: booth.x + (bw - signW) / 2, y: top + 3, w: signW, h: signH },
      overhang: portrait ? 0 : postW * 0.9,
      bulbR: clamp(postW * 0.12, 4, 7),
    };
    // bulbs on posts and roof beam
    const bulbs = [];
    const step = clamp(bh / 7, 26, 44);
    let i = 0;
    for (let y = booth.y + 14; y < booth.y + bh - 6; y += step, i++) {
      bulbs.push({ x: booth.x - postW / 2, y, c: i % 2 ? 'p' : 'o', i });
      bulbs.push({ x: booth.x + bw + postW / 2, y, c: i % 2 ? 'o' : 'p', i });
    }
    const beamL = booth.x - postW - L.overhang, beamR = booth.x + bw + postW + L.overhang;
    const by = booth.y - beamH / 2;
    let k = 0;
    for (let x = beamL + 14; x <= beamR - 10; x += 34, k++) {
      if (x > L.sign.x - 8 && x < L.sign.x + L.sign.w + 8 && by < L.sign.y + L.sign.h) continue;
      bulbs.push({ x, y: by, c: k % 2 ? 'p' : 'o', i: k });
    }
    L.bulbs = bulbs;
    L.muzzle = { x: booth.x + bw / 2, y: booth.y + bh };
    setHudVars();
  }

  function setHudVars() {
    const r = document.documentElement.style, b = L.booth;
    const set = (k, v) => r.setProperty(k, typeof v === 'number' ? `${Math.round(v)}px` : v);
    if (L.portrait) {
      set('--hud-left', 12); set('--hud-right', 10); set('--hud-top', 8);
      set('--score-size', 28); set('--pip', 9); set('--btn', 40);
      set('--meter-x', '50%'); set('--meter-w', Math.min(W - 40, 460)); set('--meter-top', 80);
      set('--meter-h', 16); set('--meter-title', 0); set('--plaque', 13);
    } else if (L.compact) {
      set('--hud-left', 12); set('--hud-right', 12); set('--hud-top', 6);
      set('--score-size', 22); set('--pip', 7); set('--btn', 36);
      set('--meter-x', '50%'); set('--meter-w', Math.min(470, W - 400)); set('--meter-top', 8);
      set('--meter-h', 14); set('--meter-title', 0); set('--plaque', 12);
    } else {
      const s = clamp(L.hudH / 90, 0.8, 1.25);
      set('--hud-left', Math.max(16, W * 0.025)); set('--hud-right', Math.max(14, W * 0.02)); set('--hud-top', 10 * s);
      set('--score-size', 38 * s); set('--pip', 10 * s); set('--btn', 46 * s);
      set('--meter-x', '50%'); set('--meter-w', Math.min(460, b.w * 0.56)); set('--meter-top', 6 * s);
      set('--meter-h', 20 * s); set('--meter-title', 17 * s); set('--plaque', 15 * s);
    }
    $('meter').querySelector('.meter-title').hidden = L.portrait || L.compact;
    $('meter').classList.toggle('inline', L.compact);
    // Powerup badge: in the sky to the right if there is room, otherwise over the roof sign.
    const sideRoom = W - (b.x + b.w + L.postW + L.overhang);
    const pu = $('powerup');
    if (!L.portrait && sideRoom > 250) {
      const w = Math.min(280, sideRoom - 24);
      set('--pu-w', w); set('--pu-x', W - w - Math.max(14, W * 0.02)); set('--pu-y', L.hudH + 4);
      set('--pu-font', 17); set('--pu-icon', 44);
      pu.classList.remove('compact');
    } else {
      const w = Math.min(L.sign.w + 30, W - 16);
      set('--pu-w', w); set('--pu-x', (W - w) / 2); set('--pu-y', L.sign.y - 2);
      set('--pu-font', 14); set('--pu-icon', 34);
      pu.classList.toggle('compact', L.sign.h < 46);
    }
    // Cancel cue: beside the booth if there is room, else on the roof sign.
    if (!L.portrait && sideRoom > 110) { set('--cancel-x', b.x + b.w + L.postW + sideRoom / 2); set('--cancel-y', L.lower.y + L.lower.h / 2); }
    else { set('--cancel-x', W / 2); set('--cancel-y', L.sign.y + L.sign.h / 2 + 4); }
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const oldBh = L ? L.booth.h / L.booth.w : null;
    computeLayout();
    if (show && oldBh) rescaleShow(oldBh, L.booth.h / L.booth.w);
    buildLayers();
    for (const k of Object.keys(fx)) if (Array.isArray(fx[k])) fx[k].length = 0;
  }

  function rescaleShow(oldH, newH) {
    const f = newH / oldH;
    show.boothH = newH;
    for (const g of show.targets) {
      g.y *= f; g.baseY *= f;
      if (g.type === 'pumpkin') { g.floorY = newH - g.w * 0.5; g.bounceH *= f; g.y = Math.min(g.y, g.floorY); }
      if (g.amp) g.amp = Math.min(g.amp, newH * 0.22);
    }
  }

  // ---------------------------------------------------------- static art --
  function buildLayers() {
    const b = L.booth;
    const [back, bctx] = A.canvas(W, H, dpr);
    A.drawNight(bctx, W, H, { moonX: W * 0.9, moonY: Math.max(40, L.hudH * 0.9) });
    A.drawFairground(bctx, W, H, Math.min(H * 0.86, b.y + b.h * 0.85));
    const [inner, ictx] = A.canvas(b.w, b.h, dpr);
    A.drawBoothInterior(ictx, b.w, b.h);
    const [frame, fctx] = A.canvas(W, H, dpr);
    drawFrame(fctx);
    layers = { back, inner, frame };
    titleRects = null;
  }

  function drawFrame(c) {
    const b = L.booth, P = A.P;
    const pw = L.postW, ov = L.overhang;
    const beamL = b.x - pw - ov, beamR = b.x + b.w + pw + ov;
    const beamY = b.y - L.beamH;
    // gable boards behind the sign
    if (!L.compact) {
      c.save();
      c.fillStyle = P.woodDark; c.strokeStyle = P.ink; c.lineWidth = 2.5; c.lineJoin = 'round';
      c.beginPath();
      c.moveTo(beamL + ov * 0.4, beamY + 2);
      c.lineTo(L.sign.x - 10, L.roofTop + L.roofH * 0.08);
      c.lineTo(L.sign.x + L.sign.w + 10, L.roofTop + L.roofH * 0.08);
      c.lineTo(beamR - ov * 0.4, beamY + 2);
      c.closePath(); c.fill(); c.stroke();
      c.restore();
    }
    // posts
    for (const x of [b.x - pw, b.x + b.w]) {
      A.wood(c, x, beamY + 4, pw, b.h + L.beamH + L.ledgeH - 2, { vertical: true, base: '#8d5026', plank: pw / 2, seed: x | 0 });
    }
    // window trim and inner shadow
    c.strokeStyle = P.ink; c.lineWidth = 3;
    c.strokeRect(b.x - 1.5, b.y - 1.5, b.w + 3, b.h + 3);
    // roof beam
    A.wood(c, beamL, beamY, beamR - beamL, L.beamH, { base: '#a0602d', plank: L.beamH / 2, seed: 11, r: 4 });
    // painted bats on the beam
    if (!L.portrait && !L.compact) {
      const s = L.beamH * 1.1;
      A.batSilhouette(c, beamL + (L.sign.x - beamL) * 0.55, beamY + L.beamH * 0.55, s, 'rgba(40,15,5,0.65)');
      A.batSilhouette(c, beamR - (beamR - L.sign.x - L.sign.w) * 0.55, beamY + L.beamH * 0.55, s, 'rgba(40,15,5,0.65)');
    }
    // sign board
    A.signBoard(c, L.sign.x, L.sign.y, L.sign.w, L.sign.h);
    // roof pumpkins
    if (!L.compact) {
      const room = L.sign.x - beamL;
      const big = clamp(Math.min(L.roofH * 0.7, room * 0.42), 18, 70), small = big * 0.78;
      if (room > big * 0.9) {
        A.pumpkin(c, beamL + big * 0.62, beamY - big * 0.33, big, { evil: false });
        A.pumpkin(c, beamR - big * 0.62, beamY - big * 0.33, big, { evil: true });
        if (room > big * 2) {
          A.pumpkin(c, beamL + big * 1.55, beamY - small * 0.32, small, { evil: true });
          A.pumpkin(c, beamR - big * 1.55, beamY - small * 0.32, small, {});
        }
      }
    }
    // counter ledge
    const ledgeY = b.y + b.h;
    const front = { x: b.x - pw, y: ledgeY + L.ledgeH, w: b.w + pw * 2, h: H - ledgeY - L.ledgeH + 4 };
    A.wood(c, front.x, front.y, front.w, front.h, { vertical: true, base: '#7a4320', plank: clamp(b.w / 10, 22, 48), seed: 5, r: 2 });
    const ledgeL = b.x - pw - ov * 0.7, ledgeW = b.w + 2 * (pw + ov * 0.7);
    A.wood(c, ledgeL, ledgeY, ledgeW, L.ledgeH, { base: '#c07a3e', plank: L.ledgeH, seed: 9, r: 3 });
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.fillRect(front.x, front.y, front.w, 6);
    // front panel decoration below the lower aiming area
    const fy = L.lower.y + L.lower.h, fh = H - fy;
    if (fh > 96 && !L.portrait) {
      const crowdH = clamp(Math.min(W, H) * 0.022, 9, 17) * 2.7; // keep clear of the crowd's heads
      const room = fh - crowdH - 14;
      const pwid = Math.min(b.w * 0.36, 300), ph = Math.min(room, pwid * 0.34);
      const px = b.x + (b.w - pwid) / 2, py = fy + 12 + (room - ph) / 2;
      A.signBoard(c, px, py, pwid, ph, { base: '#c98a52' });
      const ink = { color: '#4a2008', ink: 'rgba(255,220,160,0.6)', stroke: 0.08, maxW: pwid * 0.8 };
      if (ph >= 52) {
        A.signText(c, 'Halloween', px + pwid / 2, py + ph * 0.33, ph * 0.32, ink);
        A.signText(c, 'Carnival', px + pwid / 2, py + ph * 0.7, ph * 0.32, ink);
      } else A.signText(c, 'Halloween Carnival', px + pwid / 2, py + ph * 0.52, ph * 0.5, ink);
      A.batSilhouette(c, b.x + b.w * 0.15, fy + fh * 0.4, Math.min(80, fh * 0.6), 'rgba(30,10,2,0.55)');
      A.batSilhouette(c, b.x + b.w * 0.85, fy + fh * 0.45, Math.min(70, fh * 0.5), 'rgba(30,10,2,0.55)');
      A.cobweb(c, front.x + 3, front.y + 3, Math.min(70, fh * 0.6), 'tl');
      A.cobweb(c, front.x + front.w - 3, front.y + 3, Math.min(70, fh * 0.6), 'tr');
    }
    // pumpkins on the ledge ends and the ground
    if (!L.portrait && !L.compact) {
      const s = clamp(pw * 1.25, 40, 76);
      A.pumpkin(c, ledgeL + s * 0.42, ledgeY - s * 0.36, s, { evil: true });
      A.pumpkin(c, ledgeL + ledgeW - s * 0.42, ledgeY - s * 0.36, s * 0.86, {});
      const side = b.x - pw - ov;
      if (side > 110) {
        const g = Math.min(side * 0.5, H * 0.14);
        A.pumpkin(c, side * 0.38, H - g * 0.45, g, {});
        A.pumpkin(c, side * 0.38 + g * 0.85, H - g * 0.3, g * 0.75, { evil: true });
        A.pumpkin(c, W - side * 0.4, H - g * 0.42, g * 0.95, { evil: true });
      }
    }
  }

  // ------------------------------------------------------------- drawing --
  const bx = (x) => L.booth.x + x * L.booth.w;
  const by = (y) => L.booth.y + y * L.booth.w;

  function render(dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (screen === 'title') { renderTitle(dt); return; }
    renderBooth(dt);
  }

  function renderBooth(dt) {
    const b = L.booth;
    ctx.drawImage(layers.back, 0, 0, W, H);
    ctx.save();
    ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip();
    ctx.drawImage(layers.inner, b.x, b.y, b.w, b.h);
    drawHoles(dt);
    if (show) drawTargets();
    drawDeaths(dt);
    drawFans(dt);
    drawChains(dt);
    // Moonstruck: moonlight floods the booth
    const wantMoon = show && show.moonstruck ? 1 : 0;
    moonK += (wantMoon - moonK) * Math.min(1, dt * 4);
    if (moonK > 0.01) {
      ctx.fillStyle = `rgba(110,150,255,${0.2 * moonK})`;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      A.drawGlow(ctx, 'moon', b.x + b.w / 2, b.y, b.w * 0.5, 0.5 * moonK);
    }
    ctx.restore();
    ctx.drawImage(layers.frame, 0, 0, W, H);
    drawBulbs();
    drawSign(dt);
    if (touchMode && screen === 'game') drawTouchZones();
    drawGun(dt);
    drawCrowd(dt);
    drawParts(dt);
    drawFloats(dt);
    // the curtain
    const wantCurtain = screen === 'results' ? 1 : ending ? clamp(ending.t / 1.1, 0, 1) : 0;
    curtainDrop = wantCurtain;
    if (curtainDrop > 0) A.curtain(ctx, b.x - 2, b.y - 2, b.w + 4, b.h + 4, curtainDrop, clock);
    if (screen === 'game' && !paused && !ending) drawAim();
    // low-cheer vignette
    if (show && screen === 'game' && show.cheer < T.lowCheerWarn) {
      const k = (1 - show.cheer / T.lowCheerWarn) * (0.55 + 0.45 * Math.sin(clock * 7));
      const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      g.addColorStop(0, 'rgba(255,40,30,0)');
      g.addColorStop(1, `rgba(255,40,30,${0.35 * k})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
  }

  function drawBulbs() {
    const r = L.bulbR;
    const chase = Math.floor(clock * 5);
    const lowK = show && screen === 'game' && show.cheer < T.lowCheerWarn;
    for (const bl of L.bulbs) {
      let on = (bl.i + chase) % 3 === 0 ? 1 : 0.75;
      if (screen === 'results') on = (bl.i + chase) % 2 ? 0.3 : 0.9;
      if (lowK && Math.sin(clock * 13 + bl.i * 1.7) > 0.6) on = 0.1;
      A.bulb(ctx, bl.x, bl.y, r, bl.c === 'p' ? A.P.bulbPurple : A.P.bulbOrange, on);
    }
  }

  function drawSign(dt) {
    const s = L.sign;
    if (!sign.cur && sign.queue.length) { sign.cur = sign.queue.shift(); sign.t = 0; }
    let title = 'Shooting Gallery', sub = levelMeta().name, mode = 'idle', flip = 1;
    if (screen === 'results') { title = 'Curtain!'; sub = 'Thanks for coming'; }
    if (sign.cur) {
      sign.t += dt;
      const c = sign.cur;
      if (sign.t > c.dur) { sign.cur = null; }
      else {
        title = c.title; sub = c.sub; mode = c.kind;
        const tin = sign.t / 0.25, tout = (c.dur - sign.t) / 0.25;
        flip = clamp(Math.min(tin, tout), 0.05, 1);
      }
    }
    if (show && show.burst && screen === 'game' && isBadgeOnSign()) return; // the powerup badge sits on the sign
    ctx.save();
    ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
    ctx.scale(1, flip);
    const bigH = s.h * (mode === 'idle' ? 0.46 : 0.4);
    const twoLines = s.h > 34;
    if (mode !== 'idle') A.drawGlow(ctx, mode === 'stamp' ? 'gold' : 'orange', 0, 0, s.w * 0.45, 0.25);
    if (twoLines) {
      if (mode === 'idle') {
        A.signText(ctx, sub, 0, -s.h * 0.2, s.h * 0.24, { color: '#7a1f9a', ink: '#fff0d0', stroke: 0.14, maxW: s.w * 0.8 });
        A.signText(ctx, title, 0, s.h * 0.14, bigH, { gradient: ['#ffcf5a', '#ff7a1c'], maxW: s.w * 0.84, stroke: 0.2 });
      } else {
        A.signText(ctx, title, 0, -s.h * 0.15, bigH, { gradient: mode === 'stamp' ? ['#fff3a0', '#ffb92e'] : ['#ffcf5a', '#ff7a1c'], maxW: s.w * 0.84, stroke: 0.2 });
        A.signText(ctx, sub, 0, s.h * 0.25, Math.max(10, s.h * 0.2), { font: "'Lilita One'", color: '#3a1a08', ink: 'rgba(255,235,200,0.7)', stroke: 0.1, maxW: s.w * 0.88 });
      }
    } else {
      A.signText(ctx, mode === 'idle' ? title : `${title}: ${sub}`, 0, 0, s.h * 0.5, { gradient: ['#ffcf5a', '#ff7a1c'], maxW: s.w * 0.9, stroke: 0.18 });
    }
    ctx.restore();
  }
  function isBadgeOnSign() { return !(L && !L.portrait && W - (L.booth.x + L.booth.w + L.postW + L.overhang) > 250); }

  function drawTargets() {
    const t = clock;
    for (const g of show.targets) {
      if (g.felled) continue;
      const x = bx(g.x), y = by(g.y), w = g.w * L.booth.w;
      if (g.prize) {
        A.drawGlow(ctx, g.type === 'ghost' ? 'cyan' : g.type === 'pumpkin' ? 'fire' : 'moon', x, y, w * 1.25, 0.5 + 0.15 * Math.sin(t * 4));
      }
      if (g.type === 'ghost') A.ghost(ctx, x, y, w, g.age, { dir: g.dir, prize: g.prize, alpha: g.prize ? 1 : 0.94 });
      else if (g.type === 'pumpkin') A.pumpkin(ctx, x, y, w, { squash: g.squash, evil: g.id % 2 === 0, flicker: 0.8 + 0.2 * Math.sin(t * 9 + g.id) });
      else A.bat(ctx, x, y, w, Math.sin(g.age * (g.prize ? 9 : 16) + g.phase), { dir: g.dir, prize: g.prize });
      if (g.prize) drawPrizeDress(g, x, y, w);
    }
  }

  // Halo, powerup name and Parade status for a prize target.
  function drawPrizeDress(g, x, y, w) {
    const status = show.paradeStatus(g.type);
    const top = g.type === 'ghost' ? y - w * 0.72 : g.type === 'pumpkin' ? y - w * 0.66 : y - w * 0.38;
    A.halo(ctx, x, top, w, clock + g.id, status);
    const fs = clamp(w * 0.2, 10, 15);
    const pu = PU[POWERUP[g.type]];
    // name ribbon above the halo
    ctx.save();
    ctx.font = `${fs}px 'Lilita One', sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const name = pu.name;
    let tw = ctx.measureText(name).width + fs * 1.2;
    let rx = clamp(x, L.booth.x + tw / 2 + 2, L.booth.x + L.booth.w - tw / 2 - 2);
    const ry = Math.max(L.booth.y + fs * 0.8, top - w * 0.2 - fs * 0.4);
    ctx.fillStyle = 'rgba(16,14,40,0.82)';
    ctx.strokeStyle = pu.color; ctx.lineWidth = 1.5;
    A.rr(ctx, rx - tw / 2, ry - fs * 0.72, tw, fs * 1.44, fs * 0.5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = pu.color;
    ctx.fillText(name, rx, ry + 1);
    // Parade status below the target
    const label = status === 'ready' ? 'Parade ready' : status === 'collected' ? 'Parade collected' : 'Hit first';
    const fs2 = fs * 0.92;
    ctx.font = `${fs2}px 'Lilita One', sans-serif`;
    const badge = fs2 * 1.1;
    tw = ctx.measureText(label).width + fs2 * 1.2 + badge + 4;
    const py = y + (g.type === 'ghost' ? w * 0.72 : g.type === 'pumpkin' ? w * 0.55 : w * 0.3) + fs2;
    rx = clamp(x, L.booth.x + tw / 2 + 2, L.booth.x + L.booth.w - tw / 2 - 2);
    const pyc = Math.min(py, L.booth.y + L.booth.h - fs2);
    const ready = status === 'ready', done = status === 'collected';
    ctx.fillStyle = ready ? 'rgba(255,210,80,0.95)' : done ? 'rgba(210,220,240,0.9)' : 'rgba(30,20,45,0.88)';
    ctx.strokeStyle = ready ? '#5a2a00' : done ? '#3a4255' : '#ffd257';
    ctx.lineWidth = 1.5;
    A.rr(ctx, rx - tw / 2, pyc - fs2 * 0.75, tw, fs2 * 1.5, fs2 * 0.75); ctx.fill(); ctx.stroke();
    // stamp-shaped badge: lit, outlined or ticked
    const cx = rx - tw / 2 + fs2 * 0.6 + badge / 2, cy = pyc;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = (i % 2 ? 0.42 : 0.5) * badge; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    ctx.closePath();
    if (ready) { ctx.fillStyle = '#ff7a1c'; ctx.fill(); ctx.strokeStyle = '#5a2a00'; ctx.stroke(); A.sparkle(ctx, cx, cy, badge * 0.12, '#fff6c0'); }
    else if (done) { ctx.fillStyle = '#6d7a99'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(cx - badge * 0.2, cy); ctx.lineTo(cx - badge * 0.04, cy + badge * 0.17); ctx.lineTo(cx + badge * 0.22, cy - badge * 0.17); ctx.stroke(); }
    else { ctx.strokeStyle = '#ffd257'; ctx.lineWidth = 1.5; ctx.stroke(); }
    ctx.fillStyle = ready ? '#4a1e00' : done ? '#232a3a' : '#ffe9b0';
    ctx.textAlign = 'left';
    ctx.fillText(label, cx + badge / 2 + 4, pyc + 1);
    ctx.restore();
  }

  function drawDeaths(dt) {
    for (const d of fx.deaths) {
      d.t += dt;
      const k = d.t / 0.32;
      if (k >= 1) continue;
      const x = bx(d.x), y = by(d.y), w = d.w * L.booth.w * (1 + k * 0.6);
      ctx.save();
      ctx.globalAlpha = 1 - k;
      ctx.translate(x, y); ctx.rotate(d.spin * k);
      if (d.type === 'ghost') A.ghost(ctx, 0, 0, w, d.t * 3, { dir: d.dir });
      else if (d.type === 'pumpkin') A.pumpkin(ctx, 0, 0, w, { squash: -0.15 * k });
      else A.bat(ctx, 0, 0, w, Math.sin(d.t * 40), {});
      ctx.restore();
    }
    fx.deaths = fx.deaths.filter((d) => d.t < 0.32);
  }

  function drawHoles(dt) {
    for (const h of fx.holes) {
      h.life -= dt;
      const a = clamp(h.life / 0.8, 0, 1);
      const x = bx(h.x), y = by(h.y), r = clamp(L.booth.w * 0.008, 3, 6);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgba(10,5,15,0.85)';
      ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.85, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,230,190,0.5)'; ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) { const an = h.seed + i * 1.3; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r, y + Math.sin(an) * r); ctx.lineTo(x + Math.cos(an) * r * 2.2, y + Math.sin(an) * r * 2.2); ctx.stroke(); }
      ctx.restore();
    }
    fx.holes = fx.holes.filter((h) => h.life > 0);
  }

  function drawChains(dt) {
    for (const c of fx.chains) {
      c.life -= dt;
      const a = clamp(c.life / 0.5, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      const pts = c.points.map((p) => ({ x: bx(p.x), y: by(p.y) }));
      for (let i = 1; i < pts.length; i++) {
        const p0 = pts[i - 1], p1 = pts[i];
        const d = Math.hypot(p1.x - p0.x, p1.y - p0.y), ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
        const link = clamp(L.booth.w * 0.018, 7, 14), n = Math.max(1, Math.floor(d / link));
        A.drawGlow(ctx, 'cyan', (p0.x + p1.x) / 2, (p0.y + p1.y) / 2, d * 0.6, 0.35);
        for (let k = 0; k < n; k++) {
          const u = (k + 0.5) / n, lx = p0.x + (p1.x - p0.x) * u, ly = p0.y + (p1.y - p0.y) * u;
          ctx.save(); ctx.translate(lx, ly); ctx.rotate(ang + (k % 2 ? Math.PI / 2 : 0) * 0.0);
          ctx.strokeStyle = '#1a3a7a'; ctx.lineWidth = link * 0.42;
          ctx.beginPath(); ctx.ellipse(0, 0, link * 0.62, link * (k % 2 ? 0.16 : 0.34), 0, 0, 7); ctx.stroke();
          ctx.strokeStyle = k % 2 ? '#bfe9ff' : '#8fd0ff'; ctx.lineWidth = link * 0.22;
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.restore();
    }
    fx.chains = fx.chains.filter((c) => c.life > 0);
  }

  function drawFans(dt) {
    for (const f of fx.fans) {
      f.life -= dt;
      const a = clamp(f.life / 0.35, 0, 1);
      const mx = bx(f.mx), my = by(f.my), r = Math.hypot(L.booth.w, L.booth.h) * 1.1;
      ctx.save();
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, r);
      g.addColorStop(0, `rgba(255,220,120,${0.55 * a})`);
      g.addColorStop(0.6, `rgba(255,140,60,${0.22 * a})`);
      g.addColorStop(1, 'rgba(255,120,60,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.arc(mx, my, r, f.angle - f.half, f.angle + f.half); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = `rgba(255,230,160,${0.7 * a})`; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.restore();
    }
    fx.fans = fx.fans.filter((f) => f.life > 0);
  }

  function drawGun(dt) {
    const b = L.booth;
    recoil = Math.max(0, recoil - dt * 6);
    const px = L.muzzle.x, py = L.lower.y + L.lower.h * 0.78;
    const len = py - b.y - b.h + 4;
    const aim = currentAim() || lastAim;
    let ang = -Math.PI / 2;
    if (aim) ang = clamp(Math.atan2(aim.y - py, aim.x - px), -Math.PI + 0.55, -0.55);
    const wdt = clamp(L.lower.h * 0.3, 13, 20);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang + Math.PI / 2);
    ctx.translate(0, recoil * 6);
    ctx.lineJoin = 'round';
    // stock
    ctx.fillStyle = '#8a4a1c'; ctx.strokeStyle = A.P.ink; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-wdt * 0.85, wdt * 1.3); ctx.quadraticCurveTo(-wdt * 1.05, 0, -wdt * 0.55, -len * 0.25);
    ctx.lineTo(wdt * 0.55, -len * 0.25); ctx.quadraticCurveTo(wdt * 1.05, 0, wdt * 0.85, wdt * 1.3); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,220,170,0.25)';
    ctx.fillRect(-wdt * 0.5, -len * 0.2, wdt * 0.25, len * 0.2 + wdt);
    // barrel
    const g = ctx.createLinearGradient(-wdt / 2, 0, wdt / 2, 0);
    g.addColorStop(0, '#2a2a33'); g.addColorStop(0.4, '#7a7a8a'); g.addColorStop(1, '#22222a');
    ctx.fillStyle = g;
    A.rr(ctx, -wdt * 0.38, -len, wdt * 0.76, len * 0.8, wdt * 0.2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3a3a44';
    A.rr(ctx, -wdt * 0.5, -len, wdt, wdt * 0.6, 2); ctx.fill(); ctx.stroke();
    // cork
    if (recoil < 0.3) { ctx.fillStyle = '#d8b07a'; ctx.beginPath(); ctx.ellipse(0, -len - wdt * 0.15, wdt * 0.34, wdt * 0.25, 0, 0, 7); ctx.fill(); ctx.stroke(); }
    if (recoil > 0.55) { A.drawGlow(ctx, 'gold', 0, -len - wdt, wdt * 3, recoil); A.sparkle(ctx, 0, -len - wdt * 0.6, wdt * 0.5 * recoil, '#fff6c0'); }
    ctx.restore();
  }

  // Silhouetted crowd in the foreground; bounces with the cheer.
  function drawCrowd(dt) {
    crowdExcite = Math.max(0, crowdExcite - dt * 0.8);
    const fy = L.lower.y + L.lower.h;
    const room = H - fy;
    if (room < 22) return;
    const unit = clamp(Math.min(W, H) * 0.022, 9, 17);
    const cheer = show ? show.cheer / 100 : 0.8;
    const rng = A.rngFrom(77);
    ctx.save();
    for (let x = -unit; x < W + unit; x += unit * (1.6 + rng() * 0.6)) {
      const s = unit * (0.8 + rng() * 0.45);
      const ph = rng() * 6, kind = Math.floor(rng() * 7);
      const bounce = screen === 'game' && !paused ? (cheer * 0.35 + crowdExcite) * Math.abs(Math.sin(clock * (5 + ph) + ph)) * s * 0.5 : 0;
      const base = H + s * 0.35;
      const hy = base - s * 1.55 - bounce - Math.min(room * 0.25, s * 0.4);
      ctx.fillStyle = '#0d0818';
      ctx.beginPath(); ctx.ellipse(x, base, s * 1.05, s * 0.9, 0, Math.PI, 0); ctx.fill();
      ctx.beginPath(); ctx.arc(x, hy + s * 0.6, s * 0.55, 0, 7); ctx.fill();
      if (kind === 0) { ctx.beginPath(); ctx.moveTo(x - s * 0.9, hy + s * 0.25); ctx.lineTo(x + s * 0.9, hy + s * 0.25); ctx.lineTo(x + s * 0.1, hy - s * 0.9); ctx.closePath(); ctx.fill(); }
      else if (kind === 1) { for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sx * s * 0.45, hy + s * 0.35); ctx.lineTo(x + sx * s * 0.4, hy - s * 0.15); ctx.lineTo(x + sx * s * 0.1, hy + s * 0.15); ctx.fill(); } }
      // rim light from the booth
      ctx.strokeStyle = 'rgba(255,170,80,0.25)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, hy + s * 0.6, s * 0.55, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    }
    ctx.restore();
  }

  function drawTouchZones() {
    const zones = [L.stripL, L.stripR];
    const fingerIn = touch && touch.mode === 'drag' ? zoneAt(touch.fx, touch.fy) : null;
    ctx.save();
    for (const z of zones) {
      const hot = fingerIn === 'strip' && touch.fx >= z.x && touch.fx <= z.x + z.w;
      ctx.fillStyle = hot ? 'rgba(200,40,40,0.55)' : 'rgba(90,10,20,0.42)';
      A.rr(ctx, z.x + 2, z.y + 2, z.w - 4, z.h - 4, 8); ctx.fill();
      ctx.save(); A.rr(ctx, z.x + 2, z.y + 2, z.w - 4, z.h - 4, 8); ctx.clip();
      ctx.strokeStyle = 'rgba(255,140,110,0.18)'; ctx.lineWidth = 6;
      for (let y = z.y - z.w; y < z.y + z.h + z.w; y += 18) { ctx.beginPath(); ctx.moveTo(z.x, y + z.w); ctx.lineTo(z.x + z.w, y); ctx.stroke(); }
      ctx.restore();
      ctx.setLineDash([5, 5]); ctx.strokeStyle = hot ? '#ffd0b0' : 'rgba(255,150,120,0.75)'; ctx.lineWidth = 1.5;
      A.rr(ctx, z.x + 2, z.y + 2, z.w - 4, z.h - 4, 8); ctx.stroke(); ctx.setLineDash([]);
      const cx = z.x + z.w / 2;
      for (let y = z.y + 34; y < z.y + z.h - 20; y += Math.max(90, z.h / 4)) {
        ctx.strokeStyle = 'rgba(255,200,170,0.85)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx - 6, y - 6); ctx.lineTo(cx + 6, y + 6); ctx.moveTo(cx + 6, y - 6); ctx.lineTo(cx - 6, y + 6); ctx.stroke();
      }
      ctx.save();
      ctx.translate(cx, z.y + z.h / 2); ctx.rotate(-Math.PI / 2);
      ctx.font = "13px 'Lilita One', sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,215,190,0.9)';
      ctx.fillText('Cancel', 0, 0);
      ctx.restore();
    }
    // lower aiming area
    const l = L.lower;
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = 'rgba(255,215,90,0.65)'; ctx.lineWidth = 1.5;
    A.rr(ctx, l.x + 3, l.y + 3, l.w - 6, l.h - 6, 10); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,215,90,0.08)'; ctx.fill();
    ctx.fillStyle = 'rgba(255,230,160,0.85)';
    ctx.font = "12px 'Lilita One', sans-serif"; ctx.textBaseline = 'middle';
    ctx.textAlign = 'left'; ctx.fillText(l.w > 420 ? '▲ Drag here to aim low' : '▲ Aim low', l.x + 12, l.y + l.h * 0.62);
    ctx.textAlign = 'right'; ctx.fillText('▲', l.x + l.w - 12, l.y + l.h * 0.62);
    ctx.restore();
  }

  function drawAim() {
    const r = clamp(L.booth.w * 0.022, 11, 20);
    if (touch && touch.mode === 'drag') {
      const inAim = zoneAt(touch.fx, touch.fy) !== 'other' && zoneAt(touch.fx, touch.fy) !== 'strip';
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.setLineDash([3, 5]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(touch.fx, touch.fy); ctx.lineTo(touch.ax, touch.ay); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.arc(touch.fx, touch.fy, 20, 0, 7); ctx.fill(); ctx.stroke();
      ctx.restore();
      A.crosshair(ctx, touch.ax, touch.ay, r, { cancel: !inAim });
      $('cancelCue').hidden = inAim;
      return;
    }
    $('cancelCue').hidden = true;
    if (!touchMode && mouse.inside) A.crosshair(ctx, mouse.x, mouse.y, r, { flash: fx.flash > 0 });
  }

  // ------------------------------------------------------------- particles --
  function burst(x, y, n, colors, opt = {}) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = (opt.speed || 160) * (0.4 + Math.random() * 0.8);
      fx.parts.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opt.up || 40), g: opt.g == null ? 380 : opt.g,
        life: (opt.life || 0.6) * (0.6 + Math.random() * 0.6), max: opt.life || 0.6,
        size: (opt.size || 4) * (0.6 + Math.random() * 0.8), color: colors[i % colors.length], shape: opt.shape || 'dot', rot: Math.random() * 6,
      });
    }
  }
  function drawParts(dt) {
    for (const p of fx.parts) {
      p.life -= dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 8;
      const a = clamp(p.life / p.max, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      if (p.shape === 'star') A.sparkle(ctx, p.x, p.y, p.size * 0.6, p.color);
      else if (p.shape === 'chunk') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size, -p.size * 0.6, p.size * 2, p.size * 1.2); ctx.restore(); }
      else if (p.shape === 'wisp') { ctx.beginPath(); ctx.ellipse(p.x, p.y, p.size * 1.6, p.size, p.rot, 0, 7); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
    fx.parts = fx.parts.filter((p) => p.life > 0);
  }

  function float(text, x, y, opt = {}) {
    const k = clamp(L.booth.w / 760, 0.68, 1.15); // floaters scale with the booth
    fx.floats.push({ text, x, y, color: opt.color || '#ffd257', size: (opt.size || 20) * k, life: opt.life || 0.9, max: opt.life || 0.9, vy: opt.vy == null ? -40 : opt.vy, sub: opt.sub, subColor: opt.subColor });
    if (fx.floats.length > 14) fx.floats.shift(); // cut floating numbers first when busy
  }
  function drawFloats(dt) {
    for (const f of fx.floats) {
      f.life -= dt; f.y += f.vy * dt;
      const k = clamp(f.life / f.max, 0, 1), age = f.max - f.life;
      const pop = age < 0.12 ? 0.6 + (age / 0.12) * 0.5 : age < 0.2 ? 1.1 - ((age - 0.12) / 0.08) * 0.1 : 1;
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 2.2);
      ctx.font = `${f.size * pop}px 'Luckiest Guy', 'Lilita One', sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      const tw = ctx.measureText(f.text).width;
      const x = clamp(f.x, tw / 2 + 6, W - tw / 2 - 6);
      ctx.lineWidth = f.size * 0.2; ctx.strokeStyle = '#2a140a';
      ctx.strokeText(f.text, x, f.y); ctx.fillStyle = f.color; ctx.fillText(f.text, x, f.y);
      if (f.sub) {
        ctx.font = `${f.size * 0.6 * pop}px 'Lilita One', sans-serif`;
        const sw = ctx.measureText(f.sub).width;
        const sx = clamp(f.x, sw / 2 + 6, W - sw / 2 - 6);
        ctx.lineWidth = f.size * 0.14;
        ctx.strokeText(f.sub, sx, f.y + f.size * 0.85); ctx.fillStyle = f.subColor || '#fff1d6'; ctx.fillText(f.sub, sx, f.y + f.size * 0.85);
      }
      ctx.restore();
    }
    fx.floats = fx.floats.filter((f) => f.life > 0);
  }

  // ----------------------------------------------------------------- title --
  function renderTitle(dt) {
    if (!titleRects) buildTitle();
    ctx.drawImage(layers.title, 0, 0, W, H);
    const tr = titleRects;
    const chase = Math.floor(clock * 5);
    for (const bl of tr.bulbs) {
      const hot = bl.group === 'start' && startHover;
      const on = hot ? ((bl.i + chase) % 2 ? 1 : 0.6) : (bl.i + chase) % 3 === 0 ? 1 : 0.7;
      A.bulb(ctx, bl.x, bl.y, bl.r, bl.c === 'p' ? A.P.bulbPurple : A.P.bulbOrange, on);
    }
    // START text glows on hover/focus
    const s = tr.start;
    if (s) {
      A.drawGlow(ctx, 'orange', s.x + s.w / 2, s.y + s.h / 2, s.w * 0.55, startHover ? 0.5 : 0.25 + 0.08 * Math.sin(clock * 3));
      A.signText(ctx, 'Start', s.x + s.w / 2, s.y + s.h * 0.53, s.h * 0.5, { gradient: ['#ffd36a', '#ff7a1c'], maxW: s.w * 0.7, stroke: 0.2 });
    }
    // waving ghost and a flitting bat
    if (tr.ghost) {
      const g = tr.ghost;
      A.ghost(ctx, g.x + Math.sin(clock * 0.9) * 8, g.y + Math.sin(clock * 1.7) * 6, g.w, clock, { dir: -1 });
    }
    if (tr.bat) {
      const bt = tr.bat, u = (clock * 0.07) % 1.4;
      A.bat(ctx, bt.x0 + (bt.x1 - bt.x0) * u, bt.y + Math.sin(clock * 2.3) * bt.w * 0.6, bt.w, Math.sin(clock * 16), {});
    }
  }

  function buildTitle() {
    const [c, x] = A.canvas(W, H, dpr);
    A.drawNight(x, W, H, { moonX: W * 0.5, moonY: -999 });
    A.drawFairground(x, W, H, H * 0.78);
    const bulbs = [];
    // cobbles
    const ground = H * 0.8;
    x.fillStyle = '#2a2236'; x.fillRect(0, ground, W, H - ground);
    const rng = A.rngFrom(5);
    for (let yy = ground + 6; yy < H; yy += 16) for (let xx = (yy / 16 % 2) * 14; xx < W; xx += 30) {
      x.fillStyle = `rgba(${90 + rng() * 30},${80 + rng() * 25},${110 + rng() * 25},0.55)`;
      x.beginPath(); x.ellipse(xx, yy, 12, 6, 0, 0, 7); x.fill();
    }
    // frame: posts at the edges and a top beam
    const pw = clamp(W * 0.04, 32, 60), bh = clamp(H * 0.06, 30, 52);
    A.wood(x, -4, bh - 6, pw, H + 10, { vertical: true, base: '#8d5026', plank: pw / 2, seed: 1 });
    A.wood(x, W - pw + 4, bh - 6, pw, H + 10, { vertical: true, base: '#8d5026', plank: pw / 2, seed: 2 });
    A.wood(x, -10, 0, W + 20, bh, { base: '#a0602d', plank: bh / 2, seed: 3 });
    A.cobweb(x, pw, bh, Math.min(140, W * 0.12), 'tl');
    A.cobweb(x, W - pw, bh, Math.min(140, W * 0.12), 'tr');
    let i = 0;
    for (let yy = bh + 26; yy < H - 10; yy += 54, i++) {
      bulbs.push({ x: pw / 2 - 2, y: yy, r: 6, c: i % 2 ? 'p' : 'o', i });
      bulbs.push({ x: W - pw / 2 + 2, y: yy, r: 6, c: i % 2 ? 'o' : 'p', i });
    }
    i = 0;
    for (let xx = 24; xx < W - 10; xx += 58, i++) bulbs.push({ x: xx, y: bh / 2, r: 6, c: i % 2 ? 'p' : 'o', i });
    // marquee sign
    const mr = $('marqueeSlot').getBoundingClientRect();
    const m = { x: mr.left, y: mr.top, w: mr.width, h: mr.height };
    x.save();
    x.lineJoin = 'round';
    // arched board
    const arch = m.h * 0.18;
    const boardPath = () => {
      x.beginPath();
      x.moveTo(m.x, m.y + arch); x.quadraticCurveTo(m.x + m.w / 2, m.y - arch, m.x + m.w, m.y + arch);
      x.lineTo(m.x + m.w, m.y + m.h); x.lineTo(m.x, m.y + m.h); x.closePath();
    };
    boardPath();
    const mg = x.createLinearGradient(0, m.y, 0, m.y + m.h);
    mg.addColorStop(0, '#2c2a6e'); mg.addColorStop(1, '#171640');
    x.fillStyle = mg; x.fill();
    x.lineWidth = Math.max(6, m.h * 0.06); x.strokeStyle = '#b8742e'; x.stroke();
    x.lineWidth = 3; x.strokeStyle = A.P.ink; x.stroke();
    // night scene inside the marquee
    x.save(); boardPath(); x.clip();
    A.drawGlow(x, 'moon', m.x + m.w / 2, m.y + m.h * 0.2, m.h * 0.4, 0.5);
    x.fillStyle = '#fff3c4';
    x.beginPath(); x.arc(m.x + m.w / 2, m.y + m.h * 0.17, m.h * 0.09, 0, 7); x.fill();
    x.fillStyle = '#2c2a6e';
    x.beginPath(); x.arc(m.x + m.w / 2 + m.h * 0.05, m.y + m.h * 0.14, m.h * 0.08, 0, 7); x.fill();
    for (const [u, v, s] of [[0.3, 0.2, 0.12], [0.68, 0.16, 0.1], [0.78, 0.26, 0.07], [0.22, 0.28, 0.07]]) A.batSilhouette(x, m.x + m.w * u, m.y + m.h * v, m.h * s * 1.6, '#0d0b26');
    x.fillStyle = '#0f0e2c';
    x.beginPath(); x.moveTo(m.x, m.y + m.h);
    for (let k = 0; k <= 12; k++) x.lineTo(m.x + (k / 12) * m.w, m.y + m.h * (0.86 - ((k * 37) % 7) * 0.02));
    x.lineTo(m.x + m.w, m.y + m.h); x.fill();
    x.restore();
    A.signText(x, 'Midnight', m.x + m.w / 2, m.y + m.h * 0.45, m.h * 0.27, { gradient: ['#f3e6ff', '#b58aff'], maxW: m.w * 0.78, stroke: 0.2, ink: '#1a0a30' });
    A.signText(x, 'Carnival', m.x + m.w / 2, m.y + m.h * 0.73, m.h * 0.27, { gradient: ['#ffe680', '#ff9a1f'], maxW: m.w * 0.78, stroke: 0.2, ink: '#2a1000' });
    x.restore();
    // marquee bulbs
    i = 0;
    const per = Math.max(10, Math.round(m.w / 30));
    for (let k = 0; k <= per; k++) {
      const u = k / per, xx = m.x + u * m.w;
      const yy = m.y + arch + (1 - 4 * (u - 0.5) * (u - 0.5)) * -arch * 1.0 + 1;
      bulbs.push({ x: xx, y: yy - 2, r: 4.5, c: k % 2 ? 'p' : 'o', i: k, group: 'marquee' });
      bulbs.push({ x: xx, y: m.y + m.h, r: 4.5, c: k % 2 ? 'o' : 'p', i: k + 1, group: 'marquee' });
    }
    // START board
    const sr = $('startBtn').getBoundingClientRect();
    const s = { x: sr.left, y: sr.top, w: sr.width, h: sr.height };
    x.save();
    A.rr(x, s.x, s.y, s.w, s.h, s.h * 0.2);
    const sg = x.createLinearGradient(0, s.y, 0, s.y + s.h);
    sg.addColorStop(0, '#6a3a7a'); sg.addColorStop(1, '#3a1d4a');
    x.fillStyle = sg; x.fill();
    x.lineWidth = Math.max(7, s.h * 0.08); x.strokeStyle = '#b8742e'; x.stroke();
    x.lineWidth = 3; x.strokeStyle = A.P.ink; x.stroke();
    A.rr(x, s.x + s.h * 0.17, s.y + s.h * 0.17, s.w - s.h * 0.34, s.h - s.h * 0.34, s.h * 0.12);
    x.lineWidth = 2; x.strokeStyle = 'rgba(255,190,110,0.4)'; x.stroke();
    x.restore();
    const n = Math.max(8, Math.round(s.w / 32));
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n;
      bulbs.push({ x: s.x + u * s.w, y: s.y + s.h * 0.085, r: 4.5, c: k % 2 ? 'p' : 'o', i: k, group: 'start' });
      bulbs.push({ x: s.x + u * s.w, y: s.y + s.h * 0.915, r: 4.5, c: k % 2 ? 'o' : 'p', i: k + 1, group: 'start' });
    }
    for (const yy of [0.35, 0.65]) {
      bulbs.push({ x: s.x + s.h * 0.085, y: s.y + s.h * yy, r: 4.5, c: 'o', i: 2, group: 'start' });
      bulbs.push({ x: s.x + s.w - s.h * 0.085, y: s.y + s.h * yy, r: 4.5, c: 'p', i: 1, group: 'start' });
    }
    // pumpkins on crates beside the start sign, if there is room
    const sideL = s.x - pw, sideR = W - pw - (s.x + s.w);
    let ghost = null;
    if (sideL > 120) {
      const p = Math.min(sideL * 0.32, s.h * 0.55, H * 0.14); // crate stays above the level picker
      const cx = pw + sideL * 0.5, cy = s.y + s.h * 0.32;
      A.wood(x, cx - p * 0.85, cy + p * 0.3, p * 1.7, p * 0.8, { base: '#7a4320', plank: p * 0.4, seed: 8 });
      A.pumpkin(x, cx, cy, p, {});
    }
    if (sideR > 120) {
      const p = Math.min(sideR * 0.28, s.h * 0.5, H * 0.12);
      const cx = s.x + s.w + sideR * 0.3, cy = s.y + s.h * 0.36;
      A.wood(x, cx - p * 0.85, cy + p * 0.3, p * 1.7, p * 0.8, { base: '#7a4320', plank: p * 0.4, seed: 9 });
      A.pumpkin(x, cx, cy, p, { evil: true });
      ghost = { x: s.x + s.w + sideR * 0.68, y: m.y + m.h * 0.9, w: Math.min(sideR * 0.38, H * 0.16) };
    }
    // corner pumpkins
    const cp = clamp(Math.min(W, H) * 0.1, 40, 110);
    A.pumpkin(x, pw + cp * 0.7, H - cp * 0.35, cp, {});
    A.pumpkin(x, W - pw - cp * 0.7, H - cp * 0.38, cp * 1.1, { evil: true });
    if (W > 700) A.pumpkin(x, W - pw - cp * 1.7, H - cp * 0.25, cp * 0.7, {});
    layers.title = c;
    titleRects = { bulbs, start: s, marquee: m, ghost, bat: { x0: -60, x1: W + 60, y: m.y + m.h * 0.4, w: clamp(W * 0.05, 34, 64) } };
  }

  // --------------------------------------------------------------- stamps --
  function stampHTML(st, earned, opt = {}) {
    return `<div class="stamp ${earned ? st.cls : 'locked'}">
      <div class="seal">${ICON[st.icon]}</div>
      <div><div class="name">${st.name}</div><div class="feat">${opt.line != null ? opt.line : st.feat()}</div></div>
      ${earned ? '' : `<span class="lock">${ICON.lock}</span>`}
      ${opt.isNew ? '<span class="new">New!</span>' : ''}
    </div>`;
  }
  // ----------------------------------------------------------------- levels --
  const LEVEL_ICON = {
    pumpkin: '<svg viewBox="0 0 20 20"><path d="M10 5c0-2 1-3 2.5-3.5" stroke="#3d4a1a" stroke-width="2" fill="none"/><ellipse cx="10" cy="12" rx="8" ry="6.5" fill="#f27d16" stroke="#2a140a" stroke-width="1.6"/><path d="M7 7c-1.5 3-1.5 7 0 10M13 7c1.5 3 1.5 7 0 10" stroke="#b8480b" stroke-width="1.2" fill="none"/></svg>',
    skull: '<svg viewBox="0 0 20 20"><path d="M10 2a7 7 0 0 0-7 7c0 2.5 1.2 4 2.5 4.8V17h9v-3.2C15.8 13 17 11.5 17 9a7 7 0 0 0-7-7z" fill="#efe6ff" stroke="#2a140a" stroke-width="1.6"/><circle cx="7.2" cy="9.5" r="1.9" fill="#2a140a"/><circle cx="12.8" cy="9.5" r="1.9" fill="#2a140a"/><path d="M10 12l-1 1.6h2z" fill="#2a140a"/></svg>',
  };
  const LEVEL_MARKS = { pumpkinPatch: ['pumpkin', 1], cornMaze: ['pumpkin', 2], void: ['skull', 3] };
  function renderLevels() {
    $('levels').innerHTML = '<legend class="sr">Choose a level</legend>' + LEVELS.map((l) => {
      const [icon, n] = LEVEL_MARKS[l.id] || ['pumpkin', 1];
      return `<label class="level-opt lv-${l.id}">
        <input type="radio" name="level" value="${l.id}" ${l.id === level ? 'checked' : ''}>
        <span class="lv-marks" aria-hidden="true">${LEVEL_ICON[icon].repeat(n)}</span>
        <span class="lv-name">${l.name}</span>
        <span class="lv-diff">${l.difficulty}</span>
      </label>`;
    }).join('');
  }
  $('levels').addEventListener('change', (e) => {
    if (e.target.name !== 'level') return;
    useLevel(e.target.value);
    fireUi(e.target.closest('.level-opt'));
    renderTitleStamps();
  });

  // Buttons are shooting-gallery targets too: they fire a cork when clicked.
  function bang(x, y) {
    const el = document.createElement('span');
    el.className = 'bang';
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 450);
  }
  function fireUi(el, e) {
    S.unlock();
    S.sfx.uiShot();
    let x = e && e.clientX, y = e && e.clientY;
    if (!e || !e.detail) { const r = el.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
    bang(x, y);
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) fireUi(b, e);
  }, true);

  function renderTitleStamps() {
    $('titleStamps').innerHTML = STAMPS.map((st) => {
      const n = stampCounts[st.key] || 0;
      return stampHTML(st, n > 0, { line: n > 0 ? `Earned on ${n} night${n === 1 ? '' : 's'}.` : st.feat() });
    }).join('');
    $('bestLine').textContent = best > 0 ? `Best takings in ${levelMeta().name}: ${best.toLocaleString()}` : 'Aim true, keep the crowd cheering.';
  }

  // ------------------------------------------------------------------ input --
  function inRect(r, x, y) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
  function zoneAt(x, y) {
    if (inRect(L.booth, x, y)) return 'booth';
    if (inRect(L.lower, x, y)) return 'lower';
    if (inRect(L.stripL, x, y) || inRect(L.stripR, x, y)) return 'strip';
    return 'other';
  }
  const playing = () => screen === 'game' && show && !paused && !ending;

  function currentAim() {
    if (touch && touch.mode === 'drag') return { x: touch.ax, y: touch.ay };
    if (!touchMode && mouse.inside) return mouse;
    return null;
  }

  function setTouchMode(on) {
    if (touchMode === on) return;
    touchMode = on;
    document.body.classList.toggle('touch', on);
  }

  function fireAt(px, py, input, meta) {
    const b = L.booth;
    lastAim = { x: px, y: py };
    const res = show.fire((px - b.x) / b.w, (py - b.y) / b.w, input, meta);
    if (res) recoil = 1;
  }

  canvas.addEventListener('pointerdown', (e) => {
    S.unlock();
    const x = e.clientX, y = e.clientY;
    if (e.pointerType === 'mouse') {
      setTouchMode(false);
      if (e.button !== 0 || !playing()) return;
      if (inRect(L.booth, x, y)) fireAt(x, y, 'mouse');
      return;
    }
    setTouchMode(true);
    e.preventDefault();
    if (touch || !playing()) return; // a second finger is ignored while one is down
    const z = zoneAt(x, y);
    if (z !== 'booth' && z !== 'lower') return;
    touch = { id: e.pointerId, mode: z === 'lower' ? 'drag' : 'tap', sx: x, sy: y, fx: x, fy: y, ax: x, ay: y, clamped: false };
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    if (touch.mode === 'drag') updateDrag();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') {
      if (touchMode && Math.abs(e.movementX) + Math.abs(e.movementY) > 0) setTouchMode(false);
      mouse.x = e.clientX; mouse.y = e.clientY;
      mouse.inside = L && inRect(L.booth, mouse.x, mouse.y);
      document.body.classList.toggle('in-game', screen === 'game' && mouse.inside && !paused);
      return;
    }
    if (!touch || e.pointerId !== touch.id) return;
    touch.fx = e.clientX; touch.fy = e.clientY;
    if (touch.mode === 'tap' && Math.hypot(touch.fx - touch.sx, touch.fy - touch.sy) > T.touch.dragThresholdPx) touch.mode = 'drag';
    if (touch.mode === 'drag') updateDrag();
  });

  function updateDrag() {
    const b = L.booth;
    const rx = touch.fx + T.touch.crosshairOffsetXPx, ry = touch.fy - T.touch.crosshairRaisePx;
    touch.ax = clamp(rx, b.x, b.x + b.w);
    touch.ay = clamp(ry, b.y, b.y + b.h);
    const clamped = touch.ax !== rx || touch.ay !== ry;
    if (clamped && !touch.clamped && show) show.log.clampEvents++;
    touch.clamped = clamped;
  }

  canvas.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' || !touch || e.pointerId !== touch.id) return;
    const t = touch; touch = null;
    $('cancelCue').hidden = true;
    if (!playing()) return;
    if (t.mode === 'tap') {
      if (inRect(L.booth, t.fx, t.fy)) fireAt(t.fx, t.fy, 'tap');
      else show.cancel('tap');
    } else {
      const z = zoneAt(t.fx, t.fy);
      if (z === 'booth' || z === 'lower') fireAt(t.ax, t.ay, 'drag', { clamped: t.clamped });
      else { show.cancel('drag'); float('Cancelled', t.ax, t.ay, { color: '#e0d8ff', size: 16, life: 0.6 }); }
    }
  });

  function cancelTouch() {
    if (!touch) return;
    if (show) show.cancel(touch.mode);
    touch = null;
    $('cancelCue').hidden = true;
  }
  canvas.addEventListener('pointercancel', (e) => { if (touch && e.pointerId === touch.id) cancelTouch(); });
  canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { mouse.inside = false; document.body.classList.remove('in-game'); } });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // ------------------------------------------------------------ show events --
  function handleEvents() {
    for (const ev of show.events) {
      if (ev.kind === 'shot') onShot(ev);
      else if (ev.kind === 'escape') onEscape(ev);
      else if (ev.kind === 'halo') S.sfx.prize();
      else if (ev.kind === 'burstStart') { S.sfx.powerup(ev.type); crowdExcite = 1; }
      else if (ev.kind === 'burstEnd') {
        if (ev.type === 'slug') float(`Train of ${ev.fells}`, L.booth.x + L.booth.w / 2, L.booth.y + 40, { color: '#8fd8ff', size: 22, life: 1.4, sub: ev.fells >= T.ghostTrainFells ? 'All aboard!' : `${T.ghostTrainFells} makes a Ghost Train` });
      } else if (ev.kind === 'act') {
        const c = ACT_CUES[ev.act - 1];
        sign.queue.push({ title: c.title, sub: c.sub, dur: 3.6, kind: 'act' });
        if (ev.act === 2) sign.queue.push({ title: 'Act two', sub: 'Misses in a row now cost more cheer', dur: 3.4, kind: 'act' });
        S.sfx.act(); crowdExcite = 1.2;
      } else if (ev.kind === 'stamp') {
        const st = STAMPS.find((s) => s.key === ev.stamp);
        sign.queue.unshift({ title: 'Stamp earned!', sub: st.name, dur: 2.6, kind: 'stamp' });
        if (sign.cur && sign.cur.kind !== 'stamp') sign.cur.dur = Math.min(sign.cur.dur, sign.t + 0.25);
        S.sfx.stamp(); crowdExcite = 1.4;
        announce(`Stamp earned: ${st.name}`);
      } else if (ev.kind === 'over') beginEnding();
    }
    show.events.length = 0;
  }

  const TYPE_COLORS = {
    ghost: ['#ffffff', '#cfd2ff', '#8fd8ff'],
    pumpkin: ['#ff8a1c', '#ffcf5a', '#5b6b2a', '#ff6a00'],
    bat: ['#4c3570', '#7a5aa8', '#ffd23a'],
  };

  function onShot(r) {
    const sx = bx(r.x), sy = by(r.y);
    S.sfx.shot();
    if (r.hit) {
      const g = r.target;
      fx.deaths.push({ type: g.type, x: g.x, y: g.y, w: g.w, t: 0, dir: g.dir, spin: (Math.random() - 0.5) * 0.8 });
      burst(sx, sy, 14, TYPE_COLORS[g.type], { shape: g.type === 'pumpkin' ? 'chunk' : g.type === 'ghost' ? 'wisp' : 'dot', size: g.type === 'ghost' ? 5 : 4, g: g.type === 'ghost' ? -60 : 380 });
      burst(sx, sy, 6, ['#fff6c0', '#ffd257'], { shape: 'star', size: 7, speed: 120, g: 0, life: 0.45 });
      S.sfx.hit(g.type);
      S.sfx.streakStep(r.mult);
      float(`+${r.points.toLocaleString()}`, sx, sy - 18, { color: g.prize ? '#fff3a0' : g.type === 'bat' ? '#e2c6ff' : '#ffd257', size: g.prize ? 28 : 21, sub: r.mult > 1 ? `×${r.mult}` : null, subColor: '#ff9a4a' });
      pulse('streakRow', 'bump');
      pulse('meter', 'gain', 260);
      if (r.prize) {
        S.sfx.cheer(1);
        crowdExcite = 1.3;
        float(PU[POWERUP[r.prize.type]].name + '!', sx, sy - 78, { color: PU[POWERUP[r.prize.type]].color, size: 24, life: 1.4, vy: -26, sub: r.prize.warm ? 'Parade slot filled' : 'Taken cold: Parade slot stays empty', subColor: r.prize.warm ? '#ffe680' : '#ffb0a0' });
        burst(sx, sy, 26, ['#ffe680', '#ffffff', PU[POWERUP[r.prize.type]].color], { shape: 'star', size: 8, speed: 260, g: 120, life: 0.9 });
      } else if (r.mult >= 5 && r.mult % 5 === 0) { S.sfx.cheer(0.5); crowdExcite = Math.max(crowdExcite, 0.8); }
    } else if (r.saved) {
      // The chain or fan felled something, so this shot costs nothing and the streak holds.
      float('No miss!', sx, sy - 14, { color: '#bfe9ff', size: 18, sub: 'Streak holds', subColor: '#e6ecff', life: 1 });
    } else {
      fx.holes.push({ x: r.x, y: r.y, life: 2.2, seed: Math.random() * 6 });
      burst(sx, sy, 8, ['#c9b48a', '#8a7a5a', '#e8dcc0'], { size: 3, speed: 90, g: 200, life: 0.45 });
      S.sfx.miss();
      fx.flash = 0.15;
      float(`−${r.cost} cheer`, sx, sy - 14, { color: '#ff6a4a', size: 18, sub: r.streakFrom > 0 ? `Streak ${r.streakFrom} → ${r.streakTo}` : null, subColor: '#ffc0a8' });
      pulse('meter', 'hurt', 360);
      if (r.streakFrom > 0) { pulse('streakRow', 'halved', 520); flashLostPips(r.streakTo, r.streakFrom); }
    }
    if (r.chain && r.chain.points.length > 1) {
      fx.chains.push({ points: r.chain.points, life: 0.55 });
      S.sfx.chain();
    }
    if (r.fan) { fx.fans.push({ mx: r.fan.mx, my: r.fan.my, angle: r.fan.angle, half: r.fan.half, life: 0.35 }); S.sfx.fan(); }
    for (const g of r.extras) {
      const ex = bx(g.x), ey = by(g.y);
      fx.deaths.push({ type: g.type, x: g.x, y: g.y, w: g.w, t: 0, dir: g.dir, spin: (Math.random() - 0.5) * 1.2 });
      burst(ex, ey, 8, TYPE_COLORS[g.type], { size: 3.5, speed: 140 });
      if (r.fan) burst(ex, ey, 5, ['#ff8ac0', '#ffe680', '#8fe0ff', '#ffb347'], { size: 3, speed: 100, g: 300 });
    }
    if (r.extras.length) {
      S.sfx.extra();
      const last = r.extras[r.extras.length - 1];
      float(`+${(T.extraPoints * r.extras.length).toLocaleString()}`, bx(last.x), by(last.y) - 16, { color: '#bfe9ff', size: 17, sub: `${r.extras.length} extra${r.extras.length > 1 ? 's' : ''}, +${T.extraCheer * r.extras.length} cheer`, subColor: '#e6ecff' });
    }
  }

  function onEscape(ev) {
    const g = ev.target, b = L.booth;
    const x = g.dir > 0 ? b.x + b.w - 8 : b.x + 8, y = clamp(by(g.y), b.y + 20, b.y + b.h - 20);
    if (g.type === 'bat') {
      S.sfx.batFlit();
      float(g.prize ? 'Prize lost' : 'No cheer lost', x, y, { color: g.prize ? '#ffb0a0' : '#c9c4ff', size: g.prize ? 17 : 14, life: 1.1, vy: -20, sub: g.prize ? 'No cheer lost' : null, subColor: '#c9c4ff' });
      burst(x, y, 6, ['#c9c4ff', '#7a5aa8'], { shape: 'star', size: 4, speed: 70, g: -40, life: 0.5 });
      return;
    }
    if (ev.free) {
      float(ev.freeLeft > 0 ? 'Free escape!' : 'Last free escape!', x, y, { color: '#ffe680', size: 18, life: 2.4, vy: -14, sub: 'Later escapes cost cheer', subColor: '#fff1d6' });
    } else {
      S.sfx.escape();
      pulse('meter', 'hurt', 360);
      float(`−${ev.cost} cheer`, x, y, { color: '#ff6a4a', size: 17, life: 1.1, vy: -20, sub: g.prize ? 'Prize lost' : 'Escaped', subColor: '#ffc0a8' });
    }
    if (g.prize && ev.free) float('Prize lost', x, y + 46, { color: '#ffb0a0', size: 15, life: 1.4, vy: -14 });
  }

  // --------------------------------------------------------------------- HUD --
  const pipsEl = $('pips');
  let pips = [];
  function buildPips() {
    pipsEl.innerHTML = '<i></i>'.repeat(T.multiplierCap);
    pips = [...pipsEl.children];
  }
  buildPips();
  const hudCache = {};
  function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
  function pulse(id, cls, ms = 300) {
    const el = $(id);
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    clearTimeout(el['_t' + cls]);
    el['_t' + cls] = setTimeout(() => el.classList.remove(cls), ms);
  }
  function flashLostPips(to, from) {
    for (let i = to; i < from; i++) {
      const p = pips[i];
      p.classList.add('lost');
      setTimeout(() => p.classList.remove('lost'), 520);
    }
  }

  function updateHud() {
    if (!show) return;
    setText('score', show.score.toLocaleString());
    setText('streak', `×${show.streak}`);
    pips.forEach((p, i) => p.classList.toggle('on', i < show.streak));
    pipsEl.classList.toggle('max', show.streak >= T.multiplierCap);
    $('streakRow').classList.toggle('hot', show.streak >= 5);
    const c = Math.max(0, show.cheer);
    const pct = Math.ceil(c);
    if (hudCache.pct !== pct) { hudCache.pct = pct; $('meterFill').style.width = `${c}%`; $('meterPct').textContent = `${pct}%`; $('meter').setAttribute('aria-valuenow', pct); }
    const held = show.moonstruck;
    const meter = $('meter');
    meter.classList.toggle('held', held);
    meter.classList.toggle('low', c < T.lowCheerWarn && !held);
    setText('actBadge', ['Act I', 'Act II', 'Act III'][show.act - 1]);
    setText('mood', held ? 'Holding breath' : c >= 75 ? 'Cheering!' : c >= 45 ? 'Cheer!' : c >= T.lowCheerWarn ? 'Restless…' : 'Booing!');
    // powerup badge
    const pu = $('powerup');
    if (show.burst) {
      const meta = PU[show.burst.type];
      if (pu.hidden || hudCache.pu !== show.burst.type) {
        hudCache.pu = show.burst.type;
        pu.hidden = false;
        $('puName').textContent = meta.name;
        $('puIcon').innerHTML = ICON[meta.icon];
        pu.style.setProperty('--pu-color', meta.color);
        pu.style.setProperty('--pu-glow', meta.glow);
        announce(`${meta.name} active`);
      }
      $('puBar').style.width = `${(show.burst.left / T.burstSec) * 100}%`;
    } else if (!pu.hidden) { pu.hidden = true; hudCache.pu = null; }
  }

  function announce(msg) { $('toast').textContent = msg; }

  // ----------------------------------------------------------------- screens --
  function showScreen(name) {
    screen = name;
    $('title').hidden = name !== 'title';
    $('results').hidden = name !== 'results';
    $('hud').hidden = name !== 'game';
    $('pause').hidden = true;
    document.body.classList.remove('in-game');
    fitScreens();
  }

  // Menu screens have a natural pixel size. In short viewports (an itch.io
  // embed, a landscape phone) scale them down to fit rather than scroll.
  // A transform (not `zoom`) keeps getBoundingClientRect, which the title
  // canvas art is positioned from, in true screen coordinates.
  function fitScreens() { fitTitle(); fitResults(); }

  function fitTitle() {
    const g = document.querySelector('.title-grid'), t = $('title');
    // The scaled grid lays out as if the viewport were (W/s x H/s), so its
    // vw/vh-based sizes read --tvw/--tvh (see style.css) instead of real units.
    const unset = () => {
      Object.assign(g.style, { transform: '', transformOrigin: '', width: '', minHeight: '' });
      g.style.removeProperty('--tvw'); g.style.removeProperty('--tvh');
      t.style.overflow = '';
    };
    unset();
    titleRects = null;
    if (t.hidden || W < H) return; // portrait keeps its scrolling layout
    let s = 1;
    for (let i = 0; i < 8; i++) {
      g.style.width = `${W / s}px`; g.style.minHeight = '0px';
      g.style.setProperty('--tvw', `${W / s / 100}px`); g.style.setProperty('--tvh', `${H / s / 100}px`);
      const h = g.offsetHeight;
      if (h * s <= H + 0.5) break;
      s = Math.max(0.5, Math.min(s, H / h));
    }
    if (s >= 1) { unset(); return; }
    Object.assign(g.style, { width: `${W / s}px`, minHeight: `${H / s}px`, transformOrigin: '0 0', transform: `scale(${s})` });
    // The unscaled layout box still counts as scrollable overflow; it all fits now.
    t.style.overflow = 'hidden'; t.scrollTop = 0; t.scrollLeft = 0;
  }

  function fitResults() {
    const b = $('resultsBoard'), r = $('results');
    Object.assign(b.style, { transform: '', transformOrigin: '', margin: '' });
    r.style.overflow = '';
    if (r.hidden) return;
    const h = b.offsetHeight, room = H - 36; // #results has 18px vertical padding
    if (h <= room) return;
    const s = Math.max(0.5, room / h);
    Object.assign(b.style, { transformOrigin: 'top center', transform: `scale(${s})`, margin: `0 auto ${-h * (1 - s)}px` });
    if (s > 0.5) { r.style.overflow = 'hidden'; r.scrollTop = 0; }
  }

  function goTitle() {
    show = null; paused = false; ending = null; touch = null;
    showScreen('title');
    renderLevels();
    renderTitleStamps();
    setMuteIcons();
    fitScreens(); // after the stamps render, since they set the title's height
  }

  function startShow() {
    S.unlock();
    useLevel(level);
    if (pips.length !== T.multiplierCap) buildPips();
    computeLayout(); // a level may change the touch values
    show = new Show(T, { boothH: L.booth.h / L.booth.w });
    paused = false; ending = null; touch = null; lastAim = null;
    for (const k of Object.keys(fx)) if (Array.isArray(fx[k])) fx[k].length = 0;
    sign = { queue: [{ title: ACT_CUES[0].title, sub: ACT_CUES[0].sub, dur: 3.6, kind: 'act' }], cur: null, t: 0 };
    for (const k of Object.keys(hudCache)) delete hudCache[k];
    $('powerup').hidden = true;
    showScreen('game');
    updateHud();
    botNext = 1;
    S.sfx.act();
    canvas.focus?.();
  }

  function pause() {
    if (!playing()) return;
    cancelTouch();
    paused = true;
    $('pause').hidden = false;
    document.body.classList.remove('in-game');
    $('resumeBtn').focus();
  }
  function resume() {
    if (!paused) return;
    paused = false;
    $('pause').hidden = true;
    last = performance.now();
  }

  function beginEnding() {
    ending = { t: 0 };
    cancelTouch();
    S.sfx.curtain();
    $('powerup').hidden = true;
  }

  function finishShow() {
    const sum = show.summary();
    sum.startedAt = new Date(Date.now() - sum.runLengthSec * 1000).toISOString();
    sum.level = level;
    sum.tuning = T;
    sum.viewport = { w: W, h: H, boothPx: [L.booth.w, L.booth.h], portrait: L.portrait, touch: touchMode };
    const logs = store.get('mc.logs', []);
    logs.push(sum);
    store.set('mc.logs', logs.slice(-300));
    const prevCounts = { ...stampCounts };
    const prevBest = best;
    const newBest = sum.score > best && BOT == null;
    if (BOT == null) { // bot nights are logged but never earn stamps or a best score
      for (const k of sum.stamps) stampCounts[k] = (stampCounts[k] || 0) + 1;
      store.set(`mc.stamps.${level}`, stampCounts);
      if (newBest) { best = sum.score; store.set(`mc.best.${level}`, best); }
    }
    lastResult = { sum, prevCounts, newBest, prevBest };
    fillResults();
    showScreen('results');
    $('againBtn').focus({ preventScroll: true });
  }

  function fillResults() {
    const { sum, prevCounts, newBest, prevBest } = lastResult;
    $('rScore').textContent = sum.score.toLocaleString();
    $('rLevel').textContent = `${levelMeta().name}: ${levelMeta().difficulty}`;
    const bestEl = $('rBest');
    bestEl.classList.toggle('new', newBest);
    bestEl.innerHTML = BOT != null ? 'Bot night: logged, but no best score or stamps saved'
      : newBest ? (prevBest > 0 ? `<b>New best!</b> Previous best ${prevBest.toLocaleString()}` : '<b>New best!</b>')
      : `Best ${best.toLocaleString()}`;
    $('rStreak').textContent = `×${sum.streak.longest}`;
    const secs = Math.round(sum.runLengthSec);
    $('rLength').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    $('rTrain').textContent = `${sum.bestTrain} of ${T.ghostTrainFells}`;
    // why the night ended
    const lost = sum.cheerLost, total = lost.drain + lost.wildShots + lost.escapes || 1;
    const top = Object.entries(lost).sort((a, b) => b[1] - a[1])[0][0];
    const why = {
      drain: sum.actReached >= 3 ? 'You made the final act. The crowd’s patience grows thinner every second there, and it ran out.' : 'The crowd’s patience drained away. Each hit pays some of it back.',
      wildShots: 'Wild shots cost the most cheer. From act two, misses in a row cost more each time.',
      escapes: 'Ghosts and pumpkins slipping away cost the most cheer. Bats escape free.',
    }[top];
    $('why').textContent = why;
    const seg = [['drain', 'Drain', '#9b5cf0'], ['wildShots', 'Wild shots', '#ff5a3a'], ['escapes', 'Escapes', '#ffae3b']];
    $('rCheer').innerHTML = `<div>Where the cheer went</div>
      <div class="bar">${seg.map(([k, , c]) => `<i style="width:${(lost[k] / total) * 100}%;background:${c}"></i>`).join('')}</div>
      <div class="legend">${seg.map(([k, n, c]) => `<span style="--c:${c}">${n} ${Math.round(lost[k])}</span>`).join('')}</div>`;
    // prizes
    const kinds = [['ghost', 'slug'], ['pumpkin', 'buckshot'], ['bat', 'moonstruck']];
    $('rPrizes').innerHTML = kinds.map(([type, pu]) => {
      const st = sum.parade[type];
      const mults = sum.prizes.filter((p) => p.type === type && p.outcome === 'taken').map((p) => p.multiplier);
      const line = st === 'warm' ? `Taken on a ×${Math.max(...mults)} streak` : st === 'cold' ? 'Taken cold: Parade slot empty' : st === 'lost' ? 'Escaped: slot empty' : 'Never appeared';
      return `<div class="prize ${st === 'warm' ? 'warm' : 'empty'}">${ICON[type]}<b>${PU[pu].name}</b><span>${line}</span></div>`;
    }).join('');
    $('rStamps').innerHTML = STAMPS.map((st) => {
      const got = sum.stamps.includes(st.key);
      return stampHTML(st, got, { isNew: got && BOT == null && !(prevCounts[st.key] > 0), line: got ? 'Earned tonight.' : st.feat() });
    }).join('');
    const n = store.get('mc.logs', []).length;
    $('logBtn').textContent = `Download play logs (${n} night${n === 1 ? '' : 's'})`;
  }

  function downloadLogs() {
    const logs = store.get('mc.logs', []);
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `midnight-carnival-playlogs-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function setMuteIcons() {
    const icon = S.muted
      ? '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
    for (const id of ['muteBtn', 'titleMuteBtn']) { $(id).innerHTML = icon; $(id).setAttribute('aria-label', S.muted ? 'Unmute sound' : 'Mute sound'); }
  }
  function toggleMute() { S.setMuted(!S.muted); setMuteIcons(); }

  $('startBtn').addEventListener('click', startShow);
  $('startBtn').addEventListener('pointerenter', () => (startHover = true));
  $('startBtn').addEventListener('pointerleave', () => (startHover = false));
  $('startBtn').addEventListener('focus', () => (startHover = true));
  $('startBtn').addEventListener('blur', () => (startHover = false));
  $('pauseBtn').addEventListener('click', pause);
  $('resumeBtn').addEventListener('click', resume);
  $('quitBtn').addEventListener('click', goTitle);
  $('againBtn').addEventListener('click', startShow);
  $('titleBtn').addEventListener('click', goTitle);
  $('logBtn').addEventListener('click', downloadLogs);
  $('muteBtn').addEventListener('click', toggleMute);
  $('titleMuteBtn').addEventListener('click', toggleMute);
  $('title').addEventListener('scroll', () => { titleRects = null; });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (screen === 'game') { paused ? resume() : pause(); e.preventDefault(); }
    } else if (e.key === 'm' || e.key === 'M') toggleMute();
  });
  // The show pauses when the tab loses focus; resuming is manual.
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('blur', pause);
  window.addEventListener('resize', () => { resize(); fitScreens(); });

  // -------------------------------------------------------------------- loop --
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    if (fx.flash > 0) fx.flash -= dt;
    if (screen === 'game' && show) {
      if (!paused && !ending) {
        for (let i = 0; i < SPEED && !show.over; i++) {
          show.update(dt);
          if (BOT != null && show.t >= botNext) {
            const p = botShot(show, BOT, botRng);
            fireAt(L.booth.x + p.x * L.booth.w, L.booth.y + p.y * L.booth.w, 'bot');
            botNext += (1 / 1.75) * (0.6 + botRng() * 0.8);
          }
        }
        handleEvents();
      } else if (ending) {
        ending.t += dt;
        handleEvents();
        if (ending.t > 1.6) finishShow();
      }
      updateHud();
    }
    render(paused ? 0 : dt);
    requestAnimationFrame(frame);
  }

  resize();
  setMuteIcons();
  document.fonts.ready.then(() => { buildLayers(); fitScreens(); });
  goTitle();
  requestAnimationFrame(frame);
})();

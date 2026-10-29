// Midnight Carnival — painted art. Everything is drawn with canvas paths in a cartoon
// style: dark ink outlines, warm painted wood, glowing bulbs, soft night sky.
(function (root) {
  const P = {
    ink: '#2a140a',
    skyTop: '#0a0f33', skyMid: '#18205a', skyLow: '#3b2c6b',
    wood: '#9a5a2a', woodDark: '#6b3a19', woodLight: '#c8874a', woodSign: '#d9a066',
    bulbOrange: '#ffb347', bulbPurple: '#c46bff',
    pumpkin: '#f27d16', pumpkinDark: '#b8480b', pumpkinLight: '#ffa640', stem: '#5b6b2a',
    glowFace: '#ffe36b',
    ghost: '#f4f4ff', ghostShade: '#bcbcef', ghostRim: '#8fd8ff', ghostInk: '#3c3a78',
    bat: '#2e1f45', batWing: '#3d2a5c', batInk: '#110818', batEye: '#ffd23a',
    gold: '#ffd257', violet: '#9b5cf0', velvet: '#8e1b2b',
    teal: '#1d3c57',
  };

  function rngFrom(seed) {
    let s = seed >>> 0;
    return () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function canvas(w, h, dpr) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * dpr));
    c.height = Math.max(1, Math.round(h * dpr));
    const x = c.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    return [c, x];
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function glowSprite(color, r) {
    const [c, x] = canvas(r * 2, r * 2, 1);
    const g = x.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, color);
    g.addColorStop(0.25, color.replace(/[\d.]+\)$/, '0.45)'));
    g.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
    x.fillStyle = g;
    x.fillRect(0, 0, r * 2, r * 2);
    return c;
  }
  const GLOW = {};
  function glow(name) {
    if (!GLOW[name]) {
      const colors = {
        orange: 'rgba(255,170,60,1)', purple: 'rgba(200,110,255,1)', gold: 'rgba(255,214,90,1)',
        cyan: 'rgba(140,220,255,1)', white: 'rgba(255,250,230,1)', moon: 'rgba(200,220,255,1)',
        red: 'rgba(255,80,60,1)', pink: 'rgba(255,120,190,1)', fire: 'rgba(255,120,30,1)',
      };
      GLOW[name] = glowSprite(colors[name], 64);
    }
    return GLOW[name];
  }
  function drawGlow(ctx, name, x, y, r, a = 1) {
    ctx.globalAlpha = a;
    ctx.drawImage(glow(name), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- wood --
  function wood(ctx, x, y, w, h, opt = {}) {
    const rng = rngFrom(opt.seed || Math.round(x * 7 + y * 13 + w));
    const base = opt.base || P.wood;
    const vertical = !!opt.vertical;
    ctx.save();
    rr(ctx, x, y, w, h, opt.r || 3);
    ctx.clip();
    ctx.fillStyle = base;
    ctx.fillRect(x, y, w, h);
    // plank shading
    const plank = opt.plank || (vertical ? Math.max(14, w / Math.max(1, Math.round(w / 26))) : Math.max(14, h / Math.max(1, Math.round(h / 26))));
    const n = Math.ceil((vertical ? w : h) / plank);
    for (let i = 0; i < n; i++) {
      const p0 = (vertical ? x : y) + i * plank;
      const g = vertical ? ctx.createLinearGradient(p0, 0, p0 + plank, 0) : ctx.createLinearGradient(0, p0, 0, p0 + plank);
      const tint = (rng() - 0.5) * 0.14;
      g.addColorStop(0, `rgba(255,220,170,${0.16 + tint})`);
      g.addColorStop(0.5, `rgba(255,200,140,${0.04 + tint / 2})`);
      g.addColorStop(1, 'rgba(40,15,0,0.28)');
      ctx.fillStyle = g;
      if (vertical) ctx.fillRect(p0, y, plank, h); else ctx.fillRect(x, p0, w, plank);
      // grain
      ctx.strokeStyle = 'rgba(60,25,5,0.32)';
      ctx.lineWidth = 0.8;
      const lines = 3;
      for (let k = 0; k < lines; k++) {
        ctx.beginPath();
        const off = p0 + plank * (0.2 + 0.6 * rng());
        const len = vertical ? h : w;
        const start = vertical ? y : x;
        for (let s = 0; s <= len; s += 12) {
          const wob = Math.sin(s * 0.03 + k * 2 + i) * 1.5 + Math.sin(s * 0.11 + rng()) * 0.6;
          if (vertical) { if (s === 0) ctx.moveTo(off + wob, start + s); else ctx.lineTo(off + wob, start + s); }
          else { if (s === 0) ctx.moveTo(start + s, off + wob); else ctx.lineTo(start + s, off + wob); }
        }
        ctx.stroke();
      }
      // knot
      if (rng() < 0.35) {
        const kx = vertical ? p0 + plank / 2 : x + rng() * w, ky = vertical ? y + rng() * h : p0 + plank / 2;
        ctx.strokeStyle = 'rgba(60,25,5,0.4)';
        ctx.beginPath(); ctx.ellipse(kx, ky, vertical ? 2.5 : 5, vertical ? 5 : 2.5, 0, 0, Math.PI * 2); ctx.stroke();
      }
      // seam
      ctx.fillStyle = 'rgba(30,10,0,0.55)';
      if (i > 0) { if (vertical) ctx.fillRect(p0 - 0.75, y, 1.5, h); else ctx.fillRect(x, p0 - 0.75, w, 1.5); }
    }
    // top light / bottom shade
    const s = ctx.createLinearGradient(0, y, 0, y + h);
    s.addColorStop(0, 'rgba(255,230,180,0.18)');
    s.addColorStop(0.15, 'rgba(255,230,180,0)');
    s.addColorStop(0.85, 'rgba(0,0,0,0)');
    s.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = s;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = opt.line || 2.5;
    rr(ctx, x, y, w, h, opt.r || 3);
    ctx.stroke();
    if (opt.nails) {
      ctx.fillStyle = '#3a2a1e';
      for (const [nx, ny] of opt.nails) { ctx.beginPath(); ctx.arc(nx, ny, 1.8, 0, 7); ctx.fill(); }
    }
  }

  // ---------------------------------------------------------------- bulbs --
  function bulb(ctx, x, y, r, color, on) {
    if (on > 0.05) drawGlow(ctx, color === P.bulbPurple ? 'purple' : 'orange', x, y, r * 4.2, 0.55 * on);
    ctx.fillStyle = '#2b2018';
    ctx.beginPath(); ctx.arc(x, y + r * 0.2, r * 1.08, 0, Math.PI * 2); ctx.fill();
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
    if (on > 0.05) {
      g.addColorStop(0, '#fffbe6');
      g.addColorStop(0.45, color === P.bulbPurple ? '#e9b8ff' : '#ffe2a0');
      g.addColorStop(1, color);
    } else {
      g.addColorStop(0, color === P.bulbPurple ? '#7a4a9a' : '#a8743a');
      g.addColorStop(1, color === P.bulbPurple ? '#3d2450' : '#55361a');
    }
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // ------------------------------------------------------------- pumpkin --
  // Painted width w, height ~0.86w, centred on (x, y).
  function pumpkin(ctx, x, y, w, opt = {}) {
    const h = w * 0.86 * (1 - (opt.squash || 0));
    const ww = w * (1 + (opt.squash || 0) * 0.6);
    const lit = opt.lit !== false;
    const cy = y + w * 0.03 + (w * 0.86 - h) / 2;
    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(1.5, w * 0.035);
    if (lit && opt.glow !== false) drawGlow(ctx, 'fire', x, cy, w * 0.95, 0.35 * (opt.flicker || 1));
    // stem
    ctx.fillStyle = P.stem;
    ctx.strokeStyle = P.ink;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.06, cy - h * 0.42);
    ctx.quadraticCurveTo(x - w * 0.05, cy - h * 0.62, x + w * 0.04, cy - h * 0.66);
    ctx.lineTo(x + w * 0.1, cy - h * 0.6);
    ctx.quadraticCurveTo(x + w * 0.04, cy - h * 0.55, x + w * 0.06, cy - h * 0.42);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // lobes back to front
    const lobes = [[-0.3, 0.27, P.pumpkinDark], [0.3, 0.27, P.pumpkinDark], [-0.16, 0.3, P.pumpkin], [0.16, 0.3, P.pumpkin], [0, 0.26, P.pumpkinLight]];
    for (const [ox, rx, col] of lobes) {
      const g = ctx.createRadialGradient(x + ox * ww - rx * ww * 0.3, cy - h * 0.2, 1, x + ox * ww, cy, rx * ww * 1.3);
      g.addColorStop(0, col === P.pumpkinLight ? '#ffc070' : col === P.pumpkin ? '#ff9a35' : '#e06516');
      g.addColorStop(1, col);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(x + ox * ww, cy, rx * ww, h * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(90,30,0,0.55)';
      ctx.lineWidth = Math.max(1, w * 0.02);
      ctx.stroke();
    }
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = Math.max(1.5, w * 0.035);
    ctx.beginPath(); ctx.ellipse(x, cy, ww * 0.5, h * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
    // highlight
    ctx.fillStyle = 'rgba(255,240,200,0.35)';
    ctx.beginPath(); ctx.ellipse(x - ww * 0.22, cy - h * 0.24, ww * 0.07, h * 0.12, -0.4, 0, Math.PI * 2); ctx.fill();
    // face
    if (opt.face !== false) {
      const fg = ctx.createRadialGradient(x, cy + h * 0.05, 1, x, cy, ww * 0.45);
      if (lit) { fg.addColorStop(0, '#fff7b0'); fg.addColorStop(0.5, P.glowFace); fg.addColorStop(1, '#ff9a1f'); }
      else { fg.addColorStop(0, '#3a1a08'); fg.addColorStop(1, '#1e0c03'); }
      ctx.fillStyle = fg;
      ctx.strokeStyle = 'rgba(60,20,0,0.8)';
      ctx.lineWidth = Math.max(1, w * 0.018);
      const ex = ww * 0.19, ey = cy - h * 0.1, es = ww * 0.11;
      const evil = opt.evil;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        if (evil) { ctx.moveTo(x + s * (ex - es), ey - es * 0.4); ctx.lineTo(x + s * (ex + es), ey - es * 0.9); ctx.lineTo(x + s * ex, ey + es * 0.7); }
        else { ctx.moveTo(x + s * ex, ey - es); ctx.lineTo(x + s * (ex + es), ey + es * 0.7); ctx.lineTo(x + s * (ex - es), ey + es * 0.7); }
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // nose
      ctx.beginPath();
      ctx.moveTo(x, cy + h * 0.02); ctx.lineTo(x + ww * 0.05, cy + h * 0.11); ctx.lineTo(x - ww * 0.05, cy + h * 0.11);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // grin with teeth
      const my = cy + h * 0.2, mw = ww * 0.32;
      ctx.beginPath();
      ctx.moveTo(x - mw, my - h * 0.05);
      ctx.quadraticCurveTo(x, my + h * 0.07, x + mw, my - h * 0.05);
      ctx.quadraticCurveTo(x + mw * 0.7, my + h * 0.2, x + mw * 0.3, my + h * 0.2);
      ctx.lineTo(x + mw * 0.2, my + h * 0.11); ctx.lineTo(x + mw * 0.05, my + h * 0.21);
      ctx.lineTo(x - mw * 0.15, my + h * 0.21); ctx.lineTo(x - mw * 0.25, my + h * 0.12);
      ctx.lineTo(x - mw * 0.35, my + h * 0.2);
      ctx.quadraticCurveTo(x - mw * 0.8, my + h * 0.18, x - mw, my - h * 0.05);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // curl
    ctx.strokeStyle = '#4c6a22';
    ctx.lineWidth = Math.max(1, w * 0.025);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.05, cy - h * 0.5);
    ctx.bezierCurveTo(x + w * 0.2, cy - h * 0.62, x + w * 0.24, cy - h * 0.45, x + w * 0.15, cy - h * 0.47);
    ctx.stroke();
    ctx.restore();
  }

  // --------------------------------------------------------------- ghost --
  // Painted width w, height 1.2w, centred on (x, y).
  function ghost(ctx, x, y, w, t, opt = {}) {
    const h = w * 1.2, top = y - h * 0.52, hem = y + h * 0.46;
    const dir = opt.dir || 1;
    ctx.save();
    ctx.globalAlpha = opt.alpha == null ? 1 : opt.alpha;
    drawGlow(ctx, opt.prize ? 'cyan' : 'moon', x, y, w * 1.05, opt.prize ? 0.55 : 0.32);
    ctx.lineJoin = 'round';
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(x - w * 0.42, hem - h * 0.04);
      ctx.bezierCurveTo(x - w * 0.46, y - h * 0.05, x - w * 0.5, top + h * 0.05, x, top);
      ctx.bezierCurveTo(x + w * 0.5, top + h * 0.05, x + w * 0.46, y - h * 0.05, x + w * 0.42, hem - h * 0.04);
      // arm nub on the leading side
      const n = 4;
      for (let i = 0; i < n; i++) {
        const x0 = x + w * 0.42 - (i * w * 0.84) / n, x1 = x0 - (w * 0.84) / n;
        const wob = Math.sin(t * 4 + i * 1.7) * h * 0.04;
        ctx.quadraticCurveTo((x0 + x1) / 2, hem + h * 0.08 + wob, x1, hem - h * 0.04 + (i % 2 ? 0 : h * 0.01));
      }
      ctx.closePath();
    };
    path();
    const g = ctx.createRadialGradient(x - w * 0.15, top + h * 0.3, w * 0.05, x, y, w * 0.75);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.55, P.ghost);
    g.addColorStop(1, P.ghostShade);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = opt.prize ? '#6fc7ff' : P.ghostInk;
    ctx.lineWidth = Math.max(1.5, w * 0.03);
    ctx.stroke();
    // arms
    ctx.fillStyle = P.ghost;
    for (const s of [-1, 1]) {
      const ax = x + s * w * 0.43, ay = y + h * 0.02 + Math.sin(t * 3 + s) * h * 0.03;
      ctx.beginPath();
      ctx.ellipse(ax, ay, w * 0.11, w * 0.07, s * 0.6, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
    // face looks toward travel
    const fx = x + dir * w * 0.05;
    ctx.fillStyle = '#1b1430';
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.ellipse(fx + s * w * 0.13, top + h * 0.36, w * 0.06, w * 0.085, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#fff';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(fx + s * w * 0.13 - w * 0.02, top + h * 0.33, w * 0.02, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#1b1430';
    ctx.beginPath(); ctx.ellipse(fx, top + h * 0.52, w * 0.05, w * 0.06 + Math.sin(t * 5) * w * 0.012, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,140,170,0.35)';
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(fx + s * w * 0.24, top + h * 0.47, w * 0.055, w * 0.03, 0, 0, 7); ctx.fill(); }
    ctx.restore();
  }

  // ----------------------------------------------------------------- bat --
  // Wingspan w, centred on (x, y). flap in -1..1.
  function bat(ctx, x, y, w, flap, opt = {}) {
    ctx.save();
    ctx.lineJoin = 'round';
    if (opt.prize) drawGlow(ctx, 'moon', x, y, w * 0.95, 0.5);
    const lw = Math.max(1.4, w * 0.025);
    for (const s of [-1, 1]) {
      const tipY = y - w * 0.22 * flap;
      const midY = y - w * 0.08 * flap;
      ctx.beginPath();
      ctx.moveTo(x + s * w * 0.1, y - w * 0.06);
      ctx.quadraticCurveTo(x + s * w * 0.28, midY - w * 0.2, x + s * w * 0.5, tipY - w * 0.08);
      // scalloped trailing edge
      ctx.quadraticCurveTo(x + s * w * 0.44, tipY + w * 0.06, x + s * w * 0.4, tipY + w * 0.13);
      ctx.quadraticCurveTo(x + s * w * 0.33, midY + w * 0.05, x + s * w * 0.27, midY + w * 0.15);
      ctx.quadraticCurveTo(x + s * w * 0.2, y + w * 0.04, x + s * w * 0.14, y + w * 0.12);
      ctx.lineTo(x + s * w * 0.08, y + w * 0.06);
      ctx.closePath();
      const g = ctx.createLinearGradient(x, y - w * 0.2, x + s * w * 0.5, y + w * 0.1);
      g.addColorStop(0, '#4c3570');
      g.addColorStop(1, P.bat);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = P.batInk;
      ctx.lineWidth = lw;
      ctx.stroke();
      // finger bones
      ctx.strokeStyle = 'rgba(160,120,210,0.45)';
      ctx.lineWidth = Math.max(0.8, w * 0.012);
      ctx.beginPath();
      ctx.moveTo(x + s * w * 0.12, y - w * 0.04);
      ctx.lineTo(x + s * w * 0.4, tipY + w * 0.12);
      ctx.moveTo(x + s * w * 0.12, y - w * 0.04);
      ctx.lineTo(x + s * w * 0.27, midY + w * 0.14);
      ctx.stroke();
    }
    // ears
    ctx.fillStyle = P.bat;
    ctx.strokeStyle = P.batInk;
    ctx.lineWidth = lw;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + s * w * 0.04, y - w * 0.12);
      ctx.lineTo(x + s * w * 0.11, y - w * 0.26);
      ctx.lineTo(x + s * w * 0.14, y - w * 0.08);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#b06a9a';
      ctx.beginPath(); ctx.moveTo(x + s * w * 0.075, y - w * 0.13); ctx.lineTo(x + s * w * 0.105, y - w * 0.21); ctx.lineTo(x + s * w * 0.12, y - w * 0.11); ctx.closePath(); ctx.fill();
      ctx.fillStyle = P.bat;
    }
    // body
    const bg = ctx.createRadialGradient(x - w * 0.04, y - w * 0.06, 1, x, y, w * 0.19);
    bg.addColorStop(0, '#5c4380');
    bg.addColorStop(1, P.bat);
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.ellipse(x, y, w * 0.15, w * 0.17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // eyes
    for (const s of [-1, 1]) {
      ctx.fillStyle = P.batEye;
      ctx.beginPath(); ctx.ellipse(x + s * w * 0.055, y - w * 0.04, w * 0.045, w * 0.05, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#1a0d00';
      ctx.beginPath(); ctx.arc(x + s * w * 0.055 + (opt.dir || 1) * w * 0.012, y - w * 0.035, w * 0.022, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x + s * w * 0.05, y - w * 0.055, w * 0.01, 0, 7); ctx.fill();
    }
    // fangs
    ctx.fillStyle = '#fff';
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(x + s * w * 0.035, y + w * 0.05); ctx.lineTo(x + s * w * 0.015, y + w * 0.1); ctx.lineTo(x + s * w * 0.0, y + w * 0.05); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- halo --
  function halo(ctx, x, y, w, t, status) {
    const ready = status === 'ready', collected = status === 'collected';
    const rx = w * 0.32, ry = w * 0.085;
    ctx.save();
    drawGlow(ctx, collected ? 'moon' : 'gold', x, y, w * (ready ? 0.75 : 0.5), ready ? 0.85 + Math.sin(t * 6) * 0.15 : 0.45);
    ctx.lineWidth = Math.max(2.5, w * (ready ? 0.07 : 0.05));
    ctx.strokeStyle = collected ? '#d9e4ff' : ready ? '#ffe680' : '#c9a54a';
    if (!ready && !collected) ctx.setLineDash([w * 0.07, w * 0.05]);
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = Math.max(1, w * 0.02);
    ctx.strokeStyle = ready ? '#fffbe0' : 'rgba(255,250,220,0.5)';
    ctx.beginPath(); ctx.ellipse(x, y - ry * 0.15, rx * 0.86, ry * 0.6, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    if (ready) {
      for (let i = 0; i < 3; i++) {
        const a = t * 2 + (i * Math.PI * 2) / 3;
        sparkle(ctx, x + Math.cos(a) * rx * 1.15, y + Math.sin(a) * ry * 1.6, w * 0.05 * (0.7 + 0.3 * Math.sin(t * 8 + i)), '#fff6c0');
      }
    }
    ctx.restore();
  }

  function sparkle(ctx, x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 2); ctx.quadraticCurveTo(x, y, x + r * 2, y);
    ctx.quadraticCurveTo(x, y, x, y + r * 2); ctx.quadraticCurveTo(x, y, x - r * 2, y);
    ctx.quadraticCurveTo(x, y, x, y - r * 2);
    ctx.fill();
  }

  // ----------------------------------------------------------- crosshair --
  function crosshair(ctx, x, y, r, opt = {}) {
    const col = opt.cancel ? 'rgba(200,200,215,0.6)' : opt.flash ? '#ff6a4a' : '#ffd84a';
    ctx.save();
    if (!opt.cancel) drawGlow(ctx, 'gold', x, y, r * 2, 0.35);
    ctx.lineCap = 'round';
    for (const [lw, c] of [[r * 0.28, 'rgba(40,20,0,0.75)'], [r * 0.14, col]]) {
      ctx.strokeStyle = c; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - r * 1.45, y); ctx.lineTo(x - r * 0.55, y);
      ctx.moveTo(x + r * 0.55, y); ctx.lineTo(x + r * 1.45, y);
      ctx.moveTo(x, y - r * 1.45); ctx.lineTo(x, y - r * 0.55);
      ctx.moveTo(x, y + r * 0.55); ctx.lineTo(x, y + r * 1.45);
      ctx.stroke();
    }
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, y, r * 0.13, 0, 7); ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------------- cobweb --
  function cobweb(ctx, x, y, size, corner) {
    // corner: 'tl' | 'tr' | 'bl' | 'br'
    const sx = corner[1] === 'l' ? 1 : -1, sy = corner[0] === 't' ? 1 : -1;
    ctx.save();
    ctx.strokeStyle = 'rgba(235,235,255,0.5)';
    ctx.lineWidth = 1;
    const spokes = 5;
    for (let i = 0; i <= spokes; i++) {
      const a = (i / spokes) * (Math.PI / 2);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * Math.cos(a) * size, y + sy * Math.sin(a) * size); ctx.stroke();
    }
    for (let k = 1; k <= 4; k++) {
      const r = (k / 4) * size * 0.95;
      ctx.beginPath();
      for (let i = 0; i <= spokes; i++) {
        const a = (i / spokes) * (Math.PI / 2);
        const px = x + sx * Math.cos(a) * r, py = y + sy * Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else {
          const am = ((i - 0.5) / spokes) * (Math.PI / 2), rm = r * 0.86;
          ctx.quadraticCurveTo(x + sx * Math.cos(am) * rm, y + sy * Math.sin(am) * rm, px, py);
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function batSilhouette(ctx, x, y, w, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - w * 0.08);
    ctx.quadraticCurveTo(x - w * 0.2, y - w * 0.28, x - w * 0.5, y - w * 0.12);
    ctx.quadraticCurveTo(x - w * 0.38, y - w * 0.02, x - w * 0.36, y + w * 0.08);
    ctx.quadraticCurveTo(x - w * 0.26, y, x - w * 0.18, y + w * 0.1);
    ctx.quadraticCurveTo(x - w * 0.1, y + w * 0.02, x, y + w * 0.12);
    ctx.quadraticCurveTo(x + w * 0.1, y + w * 0.02, x + w * 0.18, y + w * 0.1);
    ctx.quadraticCurveTo(x + w * 0.26, y, x + w * 0.36, y + w * 0.08);
    ctx.quadraticCurveTo(x + w * 0.38, y - w * 0.02, x + w * 0.5, y - w * 0.12);
    ctx.quadraticCurveTo(x + w * 0.2, y - w * 0.28, x, y - w * 0.08);
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - w * 0.06, y - w * 0.1); ctx.lineTo(x - w * 0.04, y - w * 0.2); ctx.lineTo(x, y - w * 0.12); ctx.lineTo(x + w * 0.04, y - w * 0.2); ctx.lineTo(x + w * 0.06, y - w * 0.1); ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------- night sky ---
  function drawNight(ctx, W, H, opt = {}) {
    const rng = rngFrom(4242);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, P.skyTop);
    sky.addColorStop(0.55, P.skyMid);
    sky.addColorStop(0.82, P.skyLow);
    sky.addColorStop(1, '#2a1b3d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    // stars
    for (let i = 0; i < (W * H) / 4500; i++) {
      const x = rng() * W, y = rng() * H * 0.7, r = rng() * 1.2 + 0.3;
      ctx.fillStyle = `rgba(255,255,${200 + rng() * 55},${0.35 + rng() * 0.6})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      if (rng() < 0.06) sparkle(ctx, x, y, r * 1.4, 'rgba(255,250,220,0.8)');
    }
    // moon
    const mx = opt.moonX != null ? opt.moonX : W * 0.86, my = opt.moonY != null ? opt.moonY : H * 0.15, mr = Math.min(W, H) * 0.045;
    drawGlow(ctx, 'moon', mx, my, mr * 5, 0.35);
    const [mc, mctx] = canvas(mr * 3, mr * 3, 2);
    mctx.fillStyle = '#fff3c4';
    mctx.beginPath(); mctx.arc(mr * 1.5, mr * 1.5, mr, 0, 7); mctx.fill();
    mctx.globalCompositeOperation = 'destination-out';
    mctx.beginPath(); mctx.arc(mr * 1.95, mr * 1.2, mr * 0.88, 0, 7); mctx.fill();
    ctx.drawImage(mc, mx - mr * 1.5, my - mr * 1.5, mr * 3, mr * 3);
    // clouds
    for (let i = 0; i < 7; i++) {
      const cx = rng() * W, cy = H * (0.12 + rng() * 0.35), s = Math.min(W, H) * (0.08 + rng() * 0.1);
      ctx.fillStyle = 'rgba(40,52,110,0.45)';
      for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.ellipse(cx + (k - 2) * s * 0.5, cy + Math.sin(k * 2) * s * 0.12, s * 0.6, s * 0.28, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = 'rgba(120,140,210,0.08)';
      ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.12, s * 1.1, s * 0.15, 0, 0, 7); ctx.fill();
    }
  }

  function drawFairground(ctx, W, H, groundY) {
    const rng = rngFrom(99);
    const [fc, f] = canvas(W, H, 1);
    // ferris wheel
    const fx = W * 0.83, fy = groundY - H * 0.27, fr = Math.min(W * 0.13, H * 0.24);
    f.strokeStyle = 'rgba(120,120,190,0.55)';
    f.lineWidth = 3;
    f.beginPath(); f.arc(fx, fy, fr, 0, 7); f.stroke();
    f.beginPath(); f.arc(fx, fy, fr * 0.25, 0, 7); f.stroke();
    f.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      f.beginPath(); f.moveTo(fx, fy); f.lineTo(fx + Math.cos(a) * fr, fy + Math.sin(a) * fr); f.stroke();
      f.fillStyle = 'rgba(70,60,120,0.9)';
      f.fillRect(fx + Math.cos(a) * fr - 5, fy + Math.sin(a) * fr, 10, 8);
    }
    f.lineWidth = 4;
    f.beginPath(); f.moveTo(fx - fr * 0.5, groundY); f.lineTo(fx, fy); f.lineTo(fx + fr * 0.5, groundY); f.stroke();
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      f.globalAlpha = 0.9;
      f.drawImage(glow(i % 2 ? 'gold' : 'pink'), fx + Math.cos(a) * fr - 6, fy + Math.sin(a) * fr - 6, 12, 12);
    }
    f.globalAlpha = 1;
    // tents
    const tents = [[W * 0.05, 0.9], [W * 0.17, 0.7], [W * 0.95, 0.75], [W * 0.66, 0.55]];
    for (const [tx, s] of tents) {
      const tw = Math.min(W, H) * 0.32 * s, th = tw * 0.75;
      const base = groundY;
      const stripes = 8;
      for (let i = 0; i < stripes; i++) {
        f.fillStyle = i % 2 ? 'rgba(220,210,200,0.75)' : 'rgba(170,40,50,0.8)';
        f.beginPath();
        f.moveTo(tx, base - th);
        f.lineTo(tx - tw / 2 + (i * tw) / stripes, base - th * 0.42);
        f.lineTo(tx - tw / 2 + ((i + 1) * tw) / stripes, base - th * 0.42);
        f.closePath(); f.fill();
        f.fillRect(tx - tw * 0.42 + (i * tw * 0.84) / stripes, base - th * 0.42, (tw * 0.84) / stripes + 0.5, th * 0.42);
      }
      f.fillStyle = 'rgba(30,10,30,0.35)';
      f.fillRect(tx - tw * 0.42, base - th * 0.42, tw * 0.84, th * 0.42);
      // glowing doorway
      f.fillStyle = 'rgba(255,190,90,0.85)';
      f.beginPath(); f.moveTo(tx - tw * 0.1, base); f.quadraticCurveTo(tx, base - th * 0.5, tx + tw * 0.1, base); f.fill();
      f.drawImage(glow('orange'), tx - tw * 0.3, base - th * 0.4, tw * 0.6, th * 0.6);
      f.strokeStyle = 'rgba(200,170,120,0.6)';
      f.lineWidth = 2;
      f.beginPath(); f.moveTo(tx, base - th); f.lineTo(tx, base - th * 1.15); f.stroke();
      f.fillStyle = 'rgba(200,60,60,0.8)';
      f.beginPath(); f.moveTo(tx, base - th * 1.15); f.lineTo(tx + 12, base - th * 1.1); f.lineTo(tx, base - th * 1.05); f.fill();
    }
    // string lights
    for (let s = 0; s < 3; s++) {
      const y0 = groundY - H * (0.18 + s * 0.08) - rng() * 20;
      const x0 = -20 + s * W * 0.2, x1 = W * (0.5 + s * 0.25);
      const sag = 30 + rng() * 30;
      f.strokeStyle = 'rgba(30,20,40,0.6)';
      f.lineWidth = 1;
      f.beginPath();
      for (let i = 0; i <= 30; i++) {
        const u = i / 30, x = x0 + (x1 - x0) * u, y = y0 + Math.sin(u * Math.PI) * sag;
        if (i === 0) f.moveTo(x, y); else f.lineTo(x, y);
      }
      f.stroke();
      for (let i = 0; i <= 18; i++) {
        const u = i / 18, x = x0 + (x1 - x0) * u, y = y0 + Math.sin(u * Math.PI) * sag;
        f.drawImage(glow(i % 3 === 0 ? 'purple' : 'gold'), x - 7, y - 7, 14, 14);
      }
    }
    ctx.save();
    ctx.filter = 'blur(2px)';
    ctx.drawImage(fc, 0, 0, W, H);
    ctx.restore();
    // ground
    const g = ctx.createLinearGradient(0, groundY - 10, 0, H);
    g.addColorStop(0, '#2c1d3a');
    g.addColorStop(1, '#120a18');
    ctx.fillStyle = g;
    ctx.fillRect(0, groundY, W, H - groundY);
    // fog
    const fog = ctx.createLinearGradient(0, groundY - H * 0.08, 0, groundY + H * 0.05);
    fog.addColorStop(0, 'rgba(120,110,170,0)');
    fog.addColorStop(0.6, 'rgba(120,110,170,0.22)');
    fog.addColorStop(1, 'rgba(120,110,170,0)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, groundY - H * 0.08, W, H * 0.13);
  }

  // Booth window backdrop: a painted graveyard flat with bunting.
  function drawBoothInterior(ctx, w, h) {
    const rng = rngFrom(7);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#16284a');
    g.addColorStop(0.6, '#24476a');
    g.addColorStop(1, '#2d5a6a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // painted stars and moon on the flat
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(255,250,210,${0.25 + rng() * 0.4})`;
      ctx.beginPath(); ctx.arc(rng() * w, rng() * h * 0.5, 0.6 + rng(), 0, 7); ctx.fill();
    }
    drawGlow(ctx, 'moon', w * 0.78, h * 0.22, h * 0.35, 0.25);
    ctx.fillStyle = 'rgba(255,245,200,0.75)';
    ctx.beginPath(); ctx.arc(w * 0.78, h * 0.22, h * 0.07, 0, 7); ctx.fill();
    // far hills
    const hill = (yb, amp, col, seed) => {
      const r = rngFrom(seed);
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w + 20; x += 20) ctx.lineTo(x, yb - Math.sin(x / w * 5 + seed) * amp - r() * amp * 0.25);
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    };
    hill(h * 0.62, h * 0.06, '#1d3f55', 1);
    // crypt / little haunted house
    const hx = w * 0.3, hy = h * 0.66, hw = w * 0.12, hh = h * 0.3;
    ctx.fillStyle = '#3b6a73';
    ctx.strokeStyle = '#13283a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx - hw / 2, hy); ctx.lineTo(hx - hw / 2, hy - hh * 0.6);
    ctx.quadraticCurveTo(hx, hy - hh * 1.15, hx + hw / 2, hy - hh * 0.6);
    ctx.lineTo(hx + hw / 2, hy); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff9a3a';
    drawGlow(ctx, 'orange', hx, hy - hh * 0.25, hw * 0.7, 0.6);
    ctx.fillStyle = '#7a3c1c';
    ctx.beginPath(); ctx.moveTo(hx - hw * 0.16, hy); ctx.lineTo(hx - hw * 0.16, hy - hh * 0.38); ctx.quadraticCurveTo(hx, hy - hh * 0.56, hx + hw * 0.16, hy - hh * 0.38); ctx.lineTo(hx + hw * 0.16, hy); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffcf6a';
    ctx.beginPath(); ctx.arc(hx + hw * 0.08, hy - hh * 0.2, 1.8, 0, 7); ctx.fill();
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#ffd27a';
      ctx.fillRect(hx + s * hw * 0.32 - hw * 0.06, hy - hh * 0.62, hw * 0.12, hh * 0.12);
    }
    // dead trees
    const tree = (tx, ty, s) => {
      ctx.strokeStyle = '#0f2030';
      ctx.lineCap = 'round';
      const br = (x, y, a, len, wd, d) => {
        if (d > 4 || len < 3) return;
        const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
        ctx.lineWidth = wd;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        br(x2, y2, a - 0.5 - rng() * 0.3, len * 0.7, wd * 0.65, d + 1);
        br(x2, y2, a + 0.4 + rng() * 0.3, len * 0.62, wd * 0.65, d + 1);
      };
      br(tx, ty, -Math.PI / 2 - 0.1, h * 0.16 * s, 5 * s, 0);
    };
    tree(w * 0.1, h * 0.75, 1.1);
    tree(w * 0.86, h * 0.72, 0.9);
    hill(h * 0.78, h * 0.04, '#21564f', 3);
    // tombstones
    for (let i = 0; i < 6; i++) {
      const tx = w * (0.08 + i * 0.17 + rng() * 0.05), ty = h * (0.82 + rng() * 0.04), tw = h * 0.07, th = h * 0.1;
      ctx.fillStyle = '#6f8ba0'; ctx.strokeStyle = '#1a2a3a'; ctx.lineWidth = 1.5;
      ctx.save(); ctx.translate(tx, ty); ctx.rotate((rng() - 0.5) * 0.25);
      ctx.beginPath(); ctx.moveTo(-tw / 2, 0); ctx.lineTo(-tw / 2, -th * 0.6); ctx.arc(0, -th * 0.6, tw / 2, Math.PI, 0); ctx.lineTo(tw / 2, 0); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(30,50,70,0.6)';
      ctx.beginPath(); ctx.moveTo(-tw * 0.2, -th * 0.55); ctx.lineTo(tw * 0.2, -th * 0.55); ctx.moveTo(0, -th * 0.75); ctx.lineTo(0, -th * 0.3); ctx.stroke();
      ctx.restore();
    }
    // ground strip
    const gg = ctx.createLinearGradient(0, h * 0.86, 0, h);
    gg.addColorStop(0, '#2a5a3a');
    gg.addColorStop(1, '#173322');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w + 10; x += 10) ctx.lineTo(x, h * 0.87 + Math.sin(x * 0.05) * 3);
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    // bushes and tiny pumpkins
    for (let i = 0; i < 9; i++) {
      const bx = rng() * w, by = h * 0.9, bs = h * (0.05 + rng() * 0.04);
      ctx.fillStyle = '#1f4f36';
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(bx + (k - 1) * bs * 0.7, by - bs * (k === 1 ? 0.5 : 0.2), bs, 0, 7); ctx.fill(); }
    }
    for (let i = 0; i < 4; i++) pumpkin(ctx, w * (0.15 + i * 0.24 + rng() * 0.05), h * 0.93, h * 0.06, { flicker: 0.6 });
    // bunting
    const flags = Math.max(6, Math.round(w / 48));
    const sag = h * 0.035;
    ctx.strokeStyle = '#2a1a10';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40; const x = u * w, y = h * 0.015 + Math.sin(u * Math.PI) * sag; if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
    const cols = ['#f08a24', '#7d3fb0', '#c8352a', '#f0b030'];
    for (let i = 0; i < flags; i++) {
      const u0 = (i + 0.1) / flags, u1 = (i + 0.9) / flags, um = (i + 0.5) / flags;
      const y0 = h * 0.015 + Math.sin(u0 * Math.PI) * sag, y1 = h * 0.015 + Math.sin(u1 * Math.PI) * sag, ym = h * 0.015 + Math.sin(um * Math.PI) * sag;
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath(); ctx.moveTo(u0 * w, y0); ctx.lineTo(u1 * w, y1); ctx.lineTo(um * w, ym + Math.min(h * 0.06, w / flags * 0.75)); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(40,15,5,0.8)'; ctx.lineWidth = 1.2; ctx.stroke();
    }
    cobweb(ctx, 0, 0, h * 0.22, 'tl');
    cobweb(ctx, w, 0, h * 0.22, 'tr');
    // inner shadow for depth
    const v = ctx.createLinearGradient(0, 0, w, 0);
    v.addColorStop(0, 'rgba(0,0,0,0.45)'); v.addColorStop(0.06, 'rgba(0,0,0,0)');
    v.addColorStop(0.94, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, w, h);
    const v2 = ctx.createLinearGradient(0, 0, 0, h);
    v2.addColorStop(0, 'rgba(0,0,0,0.5)'); v2.addColorStop(0.1, 'rgba(0,0,0,0)');
    ctx.fillStyle = v2; ctx.fillRect(0, 0, w, h);
  }

  // A sign board with scrolled ends. Returns nothing; text is drawn by the caller.
  function signBoard(ctx, x, y, w, h, opt = {}) {
    ctx.save();
    ctx.lineJoin = 'round';
    const r = h * 0.28;
    // scroll ends
    for (const s of [-1, 1]) {
      const ex = s < 0 ? x : x + w;
      ctx.fillStyle = P.woodDark;
      ctx.strokeStyle = P.ink;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(ex, y + h / 2, h * 0.22, h * 0.42, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(ex + s * h * 0.02, y + h / 2, h * 0.1, 0, 7); ctx.stroke();
    }
    ctx.fillStyle = opt.base || P.woodSign;
    rr(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.save(); rr(ctx, x, y, w, h, r); ctx.clip();
    wood(ctx, x, y, w, h, { base: opt.base || P.woodSign, r, plank: h / 2.2, line: 0, seed: 31 });
    ctx.restore();
    ctx.strokeStyle = P.ink; ctx.lineWidth = 3;
    rr(ctx, x, y, w, h, r); ctx.stroke();
    ctx.strokeStyle = 'rgba(80,40,10,0.7)'; ctx.lineWidth = 2;
    rr(ctx, x + h * 0.09, y + h * 0.09, w - h * 0.18, h - h * 0.18, r * 0.7); ctx.stroke();
    ctx.restore();
  }

  // Outlined display text in the carnival style.
  function signText(ctx, text, x, y, size, opt = {}) {
    if (!opt.font) text = text.toUpperCase(); // the carnival display face reads best in caps
    ctx.save();
    ctx.font = `${size}px ${opt.font || "'Luckiest Guy'"}, 'Lilita One', Impact, sans-serif`;
    ctx.textAlign = opt.align || 'center';
    ctx.textBaseline = 'middle';
    let s = size;
    if (opt.maxW) {
      const m = ctx.measureText(text).width;
      if (m > opt.maxW) { s = (size * opt.maxW) / m; ctx.font = `${s}px ${opt.font || "'Luckiest Guy'"}, 'Lilita One', Impact, sans-serif`; }
    }
    ctx.lineJoin = 'round';
    ctx.lineWidth = s * (opt.stroke || 0.16);
    ctx.strokeStyle = opt.ink || '#3a1a08';
    const dy = s * 0.06;
    ctx.strokeText(text, x, y + dy);
    if (opt.gradient) {
      const g = ctx.createLinearGradient(0, y - s / 2, 0, y + s / 2);
      g.addColorStop(0, opt.gradient[0]); g.addColorStop(1, opt.gradient[1]);
      ctx.fillStyle = g;
    } else ctx.fillStyle = opt.color || '#3a1a08';
    ctx.fillText(text, x, y + dy);
    ctx.restore();
    return s;
  }

  // Velvet stage curtain covering a rect; `drop` 0..1 is how far it has fallen.
  function curtain(ctx, x, y, w, h, drop, t) {
    if (drop <= 0) return;
    const ch = h * Math.min(1, drop);
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const folds = Math.max(8, Math.round(w / 40));
    for (let i = 0; i < folds; i++) {
      const fx = x + (i / folds) * w, fw = w / folds;
      const g = ctx.createLinearGradient(fx, 0, fx + fw, 0);
      g.addColorStop(0, '#5a0d1a'); g.addColorStop(0.45, '#b52a3c'); g.addColorStop(1, '#4a0a15');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(fx, y);
      ctx.lineTo(fx + fw + 0.5, y);
      ctx.lineTo(fx + fw + 0.5, y + ch);
      ctx.quadraticCurveTo(fx + fw / 2, y + ch + 8 * Math.sin(i + t), fx, y + ch);
      ctx.closePath(); ctx.fill();
    }
    // gold fringe
    ctx.fillStyle = '#e8b33c';
    for (let i = 0; i < w; i += 6) { ctx.beginPath(); ctx.moveTo(x + i, y + ch - 4); ctx.lineTo(x + i + 3, y + ch + 6); ctx.lineTo(x + i + 6, y + ch - 4); ctx.fill(); }
    ctx.fillRect(x, y + ch - 7, w, 4);
    ctx.restore();
  }

  root.Art = { P, rngFrom, canvas, rr, glow, drawGlow, wood, bulb, pumpkin, ghost, bat, halo, sparkle, crosshair, cobweb, batSilhouette, drawNight, drawFairground, drawBoothInterior, signBoard, signText, curtain };
})(window);

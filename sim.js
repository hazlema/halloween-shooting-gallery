// Midnight Carnival — the show's rules, with no drawing and no DOM.
// Coordinates are booth-relative: x runs 0..1 across the booth width, y runs 0..boothH
// (booth height in booth widths), y down. The renderer reads state and drains `events`.
(function (root) {
  const TYPES = ['ghost', 'pumpkin', 'bat'];
  const POWERUP = { ghost: 'slug', pumpkin: 'buckshot', bat: 'moonstruck' };

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Hit shapes as ellipses in units of the target's painted width w, relative to its centre.
  // The renderer paints each type to fill these same shapes.
  const SHAPES = {
    ghost: { widest: 1.2, parts: [[0, -0.02, 0.5, 0.6]] },
    pumpkin: { widest: 1.0, parts: [[0, 0.03, 0.5, 0.43], [0, -0.42, 0.08, 0.1]] },
    bat: { widest: 1.0, parts: [[0, 0, 0.17, 0.2], [-0.29, -0.04, 0.22, 0.13], [0.29, -0.04, 0.22, 0.13]] },
  };

  class Show {
    constructor(T, opts = {}) {
      this.T = T;
      this.rng = opts.rng || Math.random;
      this.boothH = opts.boothH || 0.5;
      this.t = 0;
      this.act = 1;
      this.cheer = T.cheerStart;
      this.score = 0;
      this.streak = 0;
      this.longestStreak = 0;
      this.missRun = 0;
      this.freeEscapesLeft = T.freeEscapes;
      this.targets = [];
      this.nextId = 1;
      this.lastTypes = [];
      this.spawnTimer = 0.4;
      this.floorGap = 0;
      this.nextHaloAt = T.haloEverySec;
      this.halosOwed = 0;
      this.bag = [];
      this.lastDealt = null;
      this.burst = null;
      this.over = false;
      this.events = [];
      this.parade = { ghost: null, pumpkin: null, bat: null }; // null | 'warm' | 'cold' | 'lost'
      this.stamps = { hotStreak: false, prizeParade: false, ghostTrain: false, lastAct: false };
      this.bestTrain = 0;
      this.log = {
        shots: { mouse: 0, tap: 0, drag: 0, bot: 0 },
        hits: { mouse: 0, tap: 0, drag: 0, bot: 0 },
        cancelled: { tap: 0, drag: 0 },
        clampedShots: 0,
        clampEvents: 0,
        streakReached: new Array(T.multiplierCap + 1).fill(0),
        breaks: [],
        prizes: [],
        bursts: [],
        escapes: { ghost: 0, pumpkin: 0, bat: 0 },
        hitsByType: { ghost: 0, pumpkin: 0, bat: 0 },
        cheerAtActStart: [T.cheerStart],
        cheerLost: { drain: 0, wildShots: 0, escapes: 0 },
        cheerGained: { hits: 0, extras: 0 },
        extrasFelled: 0,
        wildShots: 0,
      };
    }

    // ---- helpers ---------------------------------------------------------
    emit(kind, data) { this.events.push(Object.assign({ kind, t: this.t }, data)); }
    get moonstruck() { return !!this.burst && this.burst.type === 'moonstruck'; }
    live() { return this.targets.filter((g) => !g.felled); }

    drainNow() {
      const T = this.T;
      if (this.moonstruck) return T.drainPerSec[this.act - 1] * T.moonstruckDrainFactor;
      if (this.act < 3) return T.drainPerSec[this.act - 1];
      return T.drainPerSec[2] + T.lastActDrainRampPerSec * (this.t - T.actStartsAt[2]);
    }

    wildCostNow() {
      const T = this.T;
      if (this.act === 1) return T.wildShotCostAct1;
      const L = T.wildShotLadder;
      return L[Math.min(this.missRun, L.length - 1)];
    }

    // Cheer the next aimed hit would pay at the current streak.
    paybackFor(streakAfterHit) {
      const T = this.T;
      return Math.min(T.paybackCap, T.paybackBase + T.paybackPerStreak * (streakAfterHit - 1));
    }

    addCheer(v) { this.cheer = Math.min(this.T.cheerMax, this.cheer + v); }
    loseCheer(v, why) {
      const lost = Math.min(this.cheer, v);
      this.cheer -= lost;
      this.log.cheerLost[why] += lost;
    }

    // Parade status for a halo, as shown on its badge.
    paradeStatus(type) {
      if (this.parade[type] === 'warm') return 'collected';
      return this.streak + 1 >= this.T.paradeMinMultiplier ? 'ready' : 'hitFirst';
    }

    // ---- spawning --------------------------------------------------------
    pickType() {
      const T = this.T, w = T.spawnWeights;
      for (let tries = 0; tries < 20; tries++) {
        let r = this.rng() * (w.bat + w.ghost + w.pumpkin), type = 'bat';
        for (const k of TYPES) { if (r < w[k]) { type = k; break; } r -= w[k]; }
        const n = T.maxSameTypeInARow, last = this.lastTypes.slice(-n);
        if (last.length === n && last.every((x) => x === type)) continue;
        this.lastTypes.push(type);
        if (this.lastTypes.length > 4) this.lastTypes.shift();
        return type;
      }
      return 'ghost';
    }

    spawn(type, prize) {
      const T = this.T, h = this.boothH, rng = this.rng;
      const w = T.size[type] * (prize ? 1.15 : 1);
      const dir = rng() < 0.5 ? 1 : -1;
      const g = {
        id: this.nextId++, type, prize: !!prize, dir, w,
        x: dir > 0 ? -w * 0.62 : 1 + w * 0.62,
        y: 0, baseY: 0, age: 0, phase: rng() * Math.PI * 2,
        vy: 0, felled: false, hitFlash: 0, squash: 0,
      };
      const top = w * 0.75, bottom = h - w * 0.65;
      if (type === 'ghost') {
        g.baseY = top + rng() * Math.max(0.01, (bottom - top) * 0.7);
      } else if (type === 'pumpkin') {
        g.floorY = h - w * 0.5;
        g.bounceH = (0.25 + rng() * 0.35) * h * (prize ? 0.6 : 1);
        g.grav = prize ? 1.0 : 2.1;
        g.baseY = g.floorY;
        g.y = g.floorY - rng() * g.bounceH;
        g.vy = -Math.sqrt(2 * g.grav * Math.max(0.01, g.floorY - g.y));
      } else {
        const amp = Math.min(0.14, h * 0.22);
        g.amp = prize ? amp * 0.5 : amp;
        g.freq = prize ? 1.3 : 2.2 + rng() * 0.6;
        g.baseY = top + g.amp + rng() * Math.max(0.01, bottom - top - 2 * g.amp - h * 0.2);
      }
      if (type !== 'pumpkin') g.y = g.baseY;
      this.targets.push(g);
      if (prize) {
        this.emit('halo', { target: g, powerup: POWERUP[type] });
      } else if (type === 'bat') {
        this.log.batsSpawned = (this.log.batsSpawned || 0) + 1;
      }
      return g;
    }

    dealHalo() {
      if (this.bag.length === 0) {
        let b;
        do { b = shuffle(TYPES.slice(), this.rng); } while (b[0] === this.lastDealt);
        this.bag = b;
      }
      const type = this.bag.shift();
      this.lastDealt = type;
      const g = this.spawn(type, true);
      this.log.prizes.push({ type, act: this.act, appearedAt: round1(this.t), outcome: 'live', multiplier: null });
      g.prizeLog = this.log.prizes[this.log.prizes.length - 1];
    }

    // ---- per-frame --------------------------------------------------------
    update(dt) {
      if (this.over) return;
      const T = this.T;
      this.t += dt;

      // Acts
      const nextAct = this.t >= T.actStartsAt[2] ? 3 : this.t >= T.actStartsAt[1] ? 2 : 1;
      if (nextAct !== this.act) {
        this.act = nextAct;
        this.log.cheerAtActStart.push(round1(this.cheer));
        this.emit('act', { act: nextAct });
        if (nextAct >= T.lastActAt) this.earn('lastAct');
      }

      // Burst clock
      if (this.burst) {
        this.burst.left -= dt;
        if (this.burst.left <= 0) this.endBurst();
      }

      // Drain
      const d = this.drainNow() * dt;
      this.loseCheer(d, 'drain');

      // Halo grid: never shifts; a halo due during a burst waits for it to end.
      while (this.t >= this.nextHaloAt) { this.halosOwed++; this.nextHaloAt += T.haloEverySec; }
      if (this.halosOwed > 0 && !this.burst) { this.halosOwed--; this.dealHalo(); }

      // Spawns: own schedule plus a floor of live targets.
      this.spawnTimer -= dt;
      this.floorGap -= dt;
      if (this.spawnTimer <= 0) {
        this.spawn(this.pickType());
        const mean = 1 / T.spawnsPerSec[this.act - 1];
        this.spawnTimer += mean * (0.55 + this.rng() * 0.9);
      }
      const inBooth = this.targets.filter((g) => !g.felled && g.x > -0.02 && g.x < 1.02).length;
      const enteringOrIn = this.live().length;
      if (enteringOrIn < T.minLiveTargets[this.act - 1] || (inBooth === 0 && this.floorGap <= 0)) {
        if (this.floorGap <= 0) { this.spawn(this.pickType()); this.floorGap = 0.35; }
      }

      // Motion. Moonstruck slows every target's own clock.
      const sdt = dt * (this.moonstruck ? T.moonstruckSpeedFactor : 1);
      const actMul = T.speedByAct[this.act - 1];
      for (const g of this.targets) {
        if (g.felled) continue;
        g.age += sdt;
        if (g.hitFlash > 0) g.hitFlash -= dt;
        const v = (g.prize ? T.prizeSpeed : T.speed[g.type]) * actMul;
        g.x += g.dir * v * sdt;
        if (g.type === 'ghost') {
          g.y = g.baseY + Math.sin(g.age * 1.5 + g.phase) * 0.022;
        } else if (g.type === 'pumpkin') {
          g.vy += g.grav * sdt;
          g.y += g.vy * sdt;
          if (g.y >= g.floorY) {
            g.y = g.floorY;
            g.vy = -Math.sqrt(2 * g.grav * g.bounceH);
            g.squash = 0.18;
            this.emit('bounce', { target: g });
          }
          if (g.squash > 0) g.squash = Math.max(0, g.squash - sdt * 1.2);
        } else {
          g.y = g.baseY + Math.sin(g.age * g.freq + g.phase) * g.amp;
        }
        // Escape once fully past the far side.
        const out = g.dir > 0 ? g.x > 1 + g.w * 0.62 : g.x < -g.w * 0.62;
        if (out) this.escape(g);
      }
      this.targets = this.targets.filter((g) => !g.gone);

      if (this.cheer <= 0) {
        this.cheer = 0;
        this.over = true;
        if (this.burst) this.endBurst();
        this.emit('over', {});
      }
    }

    escape(g) {
      const T = this.T;
      g.gone = true;
      g.felled = true;
      this.log.escapes[g.type]++;
      let cost = T.escapeCost[g.type], free = false;
      if (cost > 0) {
        if (this.freeEscapesLeft > 0) { this.freeEscapesLeft--; free = true; cost = 0; }
        else this.loseCheer(cost, 'escapes');
      }
      if (g.prize) {
        g.prizeLog.outcome = 'escaped';
        if (this.parade[g.type] !== 'warm' && this.parade[g.type] !== 'cold') this.parade[g.type] = 'lost';
        this.bag = this.bag.filter((x) => x !== g.type);
        if (this.bag.length === 0) this.bag = shuffle(TYPES.filter((x) => x !== g.type), this.rng);
        this.bag.push(g.type);
      }
      this.emit('escape', { target: g, cost, free, freeLeft: this.freeEscapesLeft });
    }

    // ---- shooting ----------------------------------------------------------
    contains(g, x, y, margin) {
      const s = SHAPES[g.type], w = g.w, m = margin ? s.widest * w * this.T.hitMargin : 0;
      for (const [cx, cy, rx, ry] of s.parts) {
        const dx = x - (g.x + cx * w), dy = y - (g.y + cy * w);
        const ex = rx * w + m, ey = ry * w + m;
        if ((dx * dx) / (ex * ex) + (dy * dy) / (ey * ey) <= 1) return true;
      }
      return false;
    }

    targetAt(x, y) {
      const live = this.live();
      for (let i = live.length - 1; i >= 0; i--) if (this.contains(live[i], x, y, false)) return live[i];
      let best = null, bd = Infinity;
      for (const g of live) {
        if (!this.contains(g, x, y, true)) continue;
        const d = (g.x - x) ** 2 + (g.y - y) ** 2;
        if (d < bd) { bd = d; best = g; }
      }
      return best;
    }

    fire(x, y, input = 'mouse', meta = {}) {
      if (this.over) return null;
      const T = this.T;
      const burstType = this.burst ? this.burst.type : null;
      this.log.shots[input] = (this.log.shots[input] || 0) + 1;
      if (meta.clamped) this.log.clampedShots++;
      const aimed = this.targetAt(x, y);
      const res = { x, y, hit: !!aimed, target: aimed, extras: [] };

      // Bursts in progress shape the shot. A burst started by this very shot waits for the next.
      let chain = null, fan = null;
      if (burstType === 'slug') chain = this.slugChain(aimed, x, y);
      else if (burstType === 'buckshot') fan = this.buckshotFan(x, y, aimed);
      const burstExtras = (chain && chain.extras.length) || (fan && fan.extras.length) || 0;

      if (aimed) {
        this.log.hits[input] = (this.log.hits[input] || 0) + 1;
        this.log.hitsByType[aimed.type]++;
        const before = this.streak;
        this.streak = Math.min(T.multiplierCap, this.streak + 1);
        if (this.streak > before) this.log.streakReached[this.streak]++;
        this.longestStreak = Math.max(this.longestStreak, this.streak);
        this.missRun = 0;
        const mult = this.streak;
        const pay = this.paybackFor(this.streak);
        const prevCheer = this.cheer;
        this.addCheer(pay);
        this.log.cheerGained.hits += this.cheer - prevCheer;
        const pts = (aimed.prize ? T.prizePoints : T.pointsPerHit[aimed.type]) * mult;
        this.score += pts;
        this.fell(aimed);
        Object.assign(res, { points: pts, mult, cheer: pay });
        if (this.streak >= T.hotStreakAt) this.earn('hotStreak');
        if (aimed.prize) {
          const warm = mult >= T.paradeMinMultiplier;
          aimed.prizeLog.outcome = 'taken';
          aimed.prizeLog.multiplier = mult;
          if (warm) this.parade[aimed.type] = 'warm';
          else if (this.parade[aimed.type] !== 'warm') this.parade[aimed.type] = 'cold';
          res.prize = { type: aimed.type, warm };
          if (['ghost', 'pumpkin', 'bat'].every((k) => this.parade[k] === 'warm')) this.earn('prizeParade');
        }
      } else if (burstExtras > 0) {
        // A chain or fan that fells something is never a miss: no cheer cost, and the
        // streak holds. It doesn't grow either; only aimed hits build toward Hot Streak.
        this.log.burstSaves = (this.log.burstSaves || 0) + 1;
        Object.assign(res, { saved: true, cost: 0 });
      } else {
        this.log.wildShots++;
        const cost = this.wildCostNow();
        this.missRun++;
        this.loseCheer(cost, 'wildShots');
        const from = this.streak;
        this.streak = Math.floor(this.streak / 2);
        if (from > 0) this.log.breaks.push({ from, to: this.streak, t: round1(this.t), act: this.act });
        Object.assign(res, { cost, streakFrom: from, streakTo: this.streak });
      }

      if (chain) {
        res.chain = chain;
        this.burst.fells += (aimed ? 1 : 0) + chain.extras.length;
        this.burst.longestChain = Math.max(this.burst.longestChain, (aimed ? 1 : 0) + chain.extras.length);
        for (const g of chain.extras) this.payExtra(g, res);
        this.bestTrain = Math.max(this.bestTrain, this.burst.fells);
        if (this.burst.fells >= T.ghostTrainFells) this.earn('ghostTrain');
      } else if (fan) {
        res.fan = fan;
        for (const g of fan.extras) this.payExtra(g, res);
        this.burst.fells += (aimed ? 1 : 0) + fan.extras.length;
      }
      if (this.burst) this.burst.shots++;

      if (aimed && aimed.prize) this.startBurst(POWERUP[aimed.type]);
      this.emit('shot', res);
      return res;
    }

    fell(g) { g.felled = true; g.gone = true; }

    payExtra(g, res) {
      const T = this.T;
      this.fell(g);
      const prev = this.cheer;
      this.addCheer(T.extraCheer);
      this.log.cheerGained.extras += this.cheer - prev;
      this.score += T.extraPoints;
      this.log.extrasFelled++;
      this.log.hitsByType[g.type]++;
      res.extras.push(g);
    }

    // Leap from the felled target (or the shot point) to the nearest target within reach.
    slugChain(aimed, x, y) {
      const reach = this.T.slugReach;
      const pts = [{ x: aimed ? aimed.x : x, y: aimed ? aimed.y : y }];
      const extras = [];
      let cx = pts[0].x, cy = pts[0].y;
      for (;;) {
        let best = null, bd = reach * reach;
        for (const g of this.live()) {
          if (g.prize || extras.includes(g) || g === aimed) continue;
          if (g.x < -0.02 || g.x > 1.02) continue;
          const d = (g.x - cx) ** 2 + (g.y - cy) ** 2;
          if (d <= bd) { bd = d; best = g; }
        }
        if (!best) break;
        extras.push(best);
        cx = best.x; cy = best.y;
        pts.push({ x: cx, y: cy, type: best.type });
      }
      return { points: pts, extras };
    }

    buckshotFan(x, y, aimed) {
      const half = (this.T.buckshotHalfAngleDeg * Math.PI) / 180;
      const mx = 0.5, my = this.boothH;
      const ang = Math.atan2(y - my, x - mx);
      const extras = [];
      for (const g of this.live()) {
        if (g === aimed || g.prize) continue;
        if (g.x < -0.02 || g.x > 1.02 || g.y > my) continue;
        let da = Math.atan2(g.y - my, g.x - mx) - ang;
        while (da > Math.PI) da -= 2 * Math.PI;
        while (da < -Math.PI) da += 2 * Math.PI;
        if (Math.abs(da) <= half) extras.push(g);
      }
      return { mx, my, angle: ang, half, extras };
    }

    startBurst(type) {
      if (this.burst) this.endBurst();
      this.burst = { type, left: this.T.burstSec, startedAt: this.t, act: this.act, fells: 0, longestChain: 0, shots: 0 };
      this.emit('burstStart', { type });
    }

    endBurst() {
      const b = this.burst;
      this.burst = null;
      const entry = { type: b.type, act: b.act, startedAt: round1(b.startedAt), shots: b.shots };
      if (b.type === 'slug') { entry.fells = b.fells; entry.longestChain = b.longestChain; }
      if (b.type === 'buckshot') entry.fells = b.fells;
      this.log.bursts.push(entry);
      this.emit('burstEnd', { type: b.type, fells: b.fells });
    }

    earn(stamp) {
      if (this.stamps[stamp]) return;
      this.stamps[stamp] = true;
      this.emit('stamp', { stamp });
    }

    cancel(input) { this.log.cancelled[input] = (this.log.cancelled[input] || 0) + 1; }

    // ---- the night's play log ----------------------------------------------
    summary() {
      const L = this.log, mins = this.t / 60;
      const shots = sum(L.shots), hits = sum(L.hits);
      const batsHitAimed = L.hitsByType.bat;
      const batsDone = batsHitAimed + L.escapes.bat;
      const esc = sum(L.escapes);
      const byInput = {};
      for (const k of Object.keys(L.shots)) {
        if (!L.shots[k] && k === 'bot') continue;
        byInput[k] = { shots: L.shots[k], shotsPerSec: round2(L.shots[k] / Math.max(1, this.t)), accuracy: L.shots[k] ? round3(L.hits[k] / L.shots[k]) : null };
      }
      return {
        runLengthSec: round1(this.t),
        actReached: this.act,
        score: this.score,
        shots, shotsPerSec: round2(shots / Math.max(1, this.t)), accuracy: shots ? round3(hits / shots) : 0,
        byInput,
        cancelledTaps: L.cancelled.tap, cancelledDrags: L.cancelled.drag,
        touchClampedShots: L.clampedShots, touchClampEvents: L.clampEvents,
        streak: { longest: this.longestStreak, reached: L.streakReached.slice(1), atEachBreak: L.breaks },
        prizes: L.prizes,
        bursts: L.bursts,
        escapes: esc, escapesByType: L.escapes, escapesPerMin: round2(esc / Math.max(1 / 60, mins)),
        batShareOfEscapes: esc ? round3(L.escapes.bat / esc) : 0,
        batsShotShare: batsDone ? round3(batsHitAimed / batsDone) : null,
        extrasFelled: L.extrasFelled,
        burstSaves: L.burstSaves || 0,
        cheerAtActStart: L.cheerAtActStart,
        cheerLost: mapVals(L.cheerLost, round1),
        cheerGained: mapVals(L.cheerGained, round1),
        stamps: Object.keys(this.stamps).filter((k) => this.stamps[k]),
        parade: this.parade,
        bestTrain: this.bestTrain,
      };
    }
  }

  function shuffle(a, rng) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  const round1 = (v) => Math.round(v * 10) / 10;
  const round2 = (v) => Math.round(v * 100) / 100;
  const round3 = (v) => Math.round(v * 1000) / 1000;
  const mapVals = (o, f) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)]));

  // Fixed-accuracy bot (playtest protocol: may estimate Hot Streak odds, night length,
  // escape rate and the cheer curve only). Aims at a target with probability `accuracy`.
  function botShot(show, accuracy, rng) {
    const live = show.live().filter((g) => g.x > 0.03 && g.x < 0.97);
    if (live.length && rng() < accuracy) {
      const prize = live.find((g) => g.prize);
      const g = prize && rng() < 0.7 ? prize : live[Math.floor(rng() * live.length)];
      return { x: g.x, y: g.y };
    }
    for (let i = 0; i < 30; i++) {
      const x = 0.05 + rng() * 0.9, y = 0.05 + rng() * (show.boothH - 0.1);
      if (!show.targetAt(x, y)) return { x, y };
    }
    return { x: 0.5, y: 0.02 };
  }

  const api = { Show, SHAPES, TYPES, POWERUP, mulberry32, botShot };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Carnival = api;
})(typeof window !== 'undefined' ? window : globalThis);

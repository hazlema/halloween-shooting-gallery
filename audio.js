// Midnight Carnival — synthesized sound effects (Web Audio, no files).
(function (root) {
  let ac = null, master = null, noiseBuf = null;
  let muted = localStorage.getItem('mc.muted') === '1';

  function ctx() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muted ? 0 : 0.5;
      master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  function tone({ type = 'sine', f0, f1, dur = 0.15, vol = 0.3, delay = 0, attack = 0.005 }) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise({ dur = 0.2, vol = 0.3, f = 1200, q = 1, type = 'bandpass', delay = 0, f1 }) {
    const a = ctx(); if (!a) return;
    const t = a.currentTime + delay;
    const s = a.createBufferSource(); s.buffer = noiseBuf;
    const flt = a.createBiquadFilter(); flt.type = type; flt.frequency.setValueAtTime(f, t); flt.Q.value = q;
    if (f1) flt.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(flt); flt.connect(g); g.connect(master);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  const sfx = {
    shot() { noise({ dur: 0.07, vol: 0.35, f: 2400, q: 0.8 }); tone({ type: 'square', f0: 520, f1: 180, dur: 0.06, vol: 0.08 }); },
    hit(type) {
      if (type === 'ghost') { tone({ type: 'sine', f0: 700, f1: 260, dur: 0.35, vol: 0.22 }); tone({ type: 'triangle', f0: 1050, f1: 390, dur: 0.3, vol: 0.08 }); }
      else if (type === 'pumpkin') { tone({ type: 'sine', f0: 220, f1: 90, dur: 0.18, vol: 0.4 }); noise({ dur: 0.12, vol: 0.25, f: 600 }); }
      else { tone({ type: 'square', f0: 1800, f1: 2600, dur: 0.06, vol: 0.07 }); tone({ type: 'square', f0: 2200, f1: 1400, dur: 0.07, vol: 0.06, delay: 0.06 }); }
      tone({ type: 'triangle', f0: 880, dur: 0.12, vol: 0.12, delay: 0.02 });
    },
    streakStep(n) { tone({ type: 'triangle', f0: 440 * Math.pow(2, Math.min(n, 12) / 12), dur: 0.12, vol: 0.1, delay: 0.05 }); },
    extra() { tone({ type: 'sine', f0: 1300, f1: 1700, dur: 0.08, vol: 0.06 }); },
    miss() { tone({ type: 'sine', f0: 140, f1: 70, dur: 0.18, vol: 0.3 }); noise({ dur: 0.15, vol: 0.15, f: 400 }); },
    escape() { tone({ type: 'sawtooth', f0: 220, f1: 140, dur: 0.4, vol: 0.06 }); noise({ dur: 0.5, vol: 0.06, f: 500, q: 0.5 }); },
    batFlit() { noise({ dur: 0.25, vol: 0.08, f: 3000, f1: 6000, q: 3 }); },
    prize() { [0, 4, 7, 12].forEach((s, i) => tone({ type: 'triangle', f0: 660 * Math.pow(2, s / 12), dur: 0.22, vol: 0.14, delay: i * 0.07 })); },
    powerup(type) {
      if (type === 'moonstruck') { tone({ type: 'sine', f0: 300, f1: 900, dur: 0.9, vol: 0.12, attack: 0.2 }); tone({ type: 'sine', f0: 450, f1: 1350, dur: 0.9, vol: 0.06, attack: 0.2 }); }
      else if (type === 'buckshot') { noise({ dur: 0.4, vol: 0.2, f: 900, f1: 3000 }); }
      else { tone({ type: 'sine', f0: 400, f1: 1600, dur: 0.5, vol: 0.12 }); }
    },
    chain() { tone({ type: 'square', f0: 1200, f1: 2400, dur: 0.1, vol: 0.05 }); noise({ dur: 0.1, vol: 0.08, f: 5000, q: 4 }); },
    fan() { noise({ dur: 0.18, vol: 0.3, f: 1500, f1: 400, q: 0.7 }); },
    act() { [0, 4, 7, 12, 7, 12].forEach((s, i) => tone({ type: 'square', f0: 392 * Math.pow(2, s / 12), dur: 0.14, vol: 0.06, delay: i * 0.09 })); cheer(0.8); },
    stamp() { [0, 7, 12, 16].forEach((s, i) => tone({ type: 'triangle', f0: 523 * Math.pow(2, s / 12), dur: 0.3, vol: 0.12, delay: i * 0.1 })); cheer(1.2); },
    curtain() { tone({ type: 'sawtooth', f0: 330, f1: 110, dur: 1.2, vol: 0.06 }); noise({ dur: 1.4, vol: 0.12, f: 300, q: 0.4 }); },
    click() { tone({ type: 'triangle', f0: 900, dur: 0.05, vol: 0.08 }); },
    // A cork-gun pop for buttons: crack, falling pop, then a puff of air.
    uiShot() {
      noise({ dur: 0.05, vol: 0.45, f: 3200, q: 0.7 });
      tone({ type: 'triangle', f0: 1150, f1: 150, dur: 0.1, vol: 0.2 });
      tone({ type: 'square', f0: 320, f1: 90, dur: 0.07, vol: 0.06 });
      noise({ dur: 0.2, vol: 0.07, f: 700, q: 0.5, delay: 0.03 });
    },
    cheer(n) { cheer(n); },
  };

  // A crowd cheer: a ripple of handclaps, a few "woo!" voices and a roar underneath.
  // `amount` runs about 0.5 (a nice shot) to 1.2 (a stamp).
  let lastCheer = -1;
  function cheer(amount = 0.5) {
    const a = ctx(); if (!a) return;
    const now = a.currentTime;
    if (now - lastCheer < 0.6) amount *= 0.45; // back-to-back cheers swell instead of stacking
    lastCheer = now;
    const k = Math.min(1.4, amount);
    const bus = a.createGain();
    bus.gain.value = 0.9;
    bus.connect(master);

    // Roar: a soft wash of crowd noise that swells and fades.
    const roar = a.createBufferSource(); roar.buffer = noiseBuf; roar.loop = true;
    const rf = a.createBiquadFilter(); rf.type = 'bandpass'; rf.frequency.value = 900; rf.Q.value = 0.6;
    const rg = a.createGain();
    rg.gain.setValueAtTime(0.0001, now);
    rg.gain.exponentialRampToValueAtTime(0.09 * k, now + 0.18);
    rg.gain.exponentialRampToValueAtTime(0.0001, now + 1.7);
    roar.connect(rf); rf.connect(rg); rg.connect(bus);
    roar.start(now, Math.random() * 0.5); roar.stop(now + 1.8);

    // Handclaps: short bright bursts, thick at first then thinning out.
    const claps = Math.round(14 + 30 * k);
    for (let i = 0; i < claps; i++) {
      const t = now + 0.03 + Math.pow(Math.random(), 1.7) * 1.4;
      const src = a.createBufferSource(); src.buffer = noiseBuf;
      const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900 + Math.random() * 1500; f.Q.value = 1.4;
      const g = a.createGain();
      const v = (0.12 + Math.random() * 0.16) * k;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03 + Math.random() * 0.03);
      src.connect(f); f.connect(g); g.connect(bus);
      src.start(t, Math.random() * 0.9); src.stop(t + 0.08);
    }

    // Voices: buzzy throats shaped by vowel filters, gliding up then down ("woo-ooh!", "yay!").
    const voices = Math.round(3 + 5 * k);
    for (let i = 0; i < voices; i++) {
      const t = now + Math.random() * 0.3;
      const dur = 0.55 + Math.random() * 0.6;
      const f0 = [190, 240, 290, 340, 420, 500][Math.floor(Math.random() * 6)] * (0.92 + Math.random() * 0.16);
      const o = a.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(f0 * 0.82, t);
      o.frequency.exponentialRampToValueAtTime(f0 * 1.22, t + 0.18 + Math.random() * 0.1);
      o.frequency.exponentialRampToValueAtTime(f0 * 0.78, t + dur);
      const vib = a.createOscillator(); vib.frequency.value = 5 + Math.random() * 2;
      const vg = a.createGain(); vg.gain.value = f0 * 0.025;
      vib.connect(vg); vg.connect(o.frequency);
      const woo = Math.random() < 0.55; // "oo" or "ah/yay"
      const f1 = a.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 6;
      const f2 = a.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 8;
      f1.frequency.setValueAtTime(woo ? 330 : 720, t); f1.frequency.linearRampToValueAtTime(woo ? 420 : 640, t + dur);
      f2.frequency.setValueAtTime(woo ? 820 : 1250, t); f2.frequency.linearRampToValueAtTime(woo ? 900 : 1900, t + dur * 0.4);
      const g = a.createGain();
      const v = (0.11 + Math.random() * 0.07) * k;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + 0.07);
      g.gain.setValueAtTime(v, t + dur * 0.45);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(bus);
      o.start(t); o.stop(t + dur + 0.05); vib.start(t); vib.stop(t + dur + 0.05);
    }
  }

  root.Sound = {
    sfx,
    unlock() { ctx(); },
    get muted() { return muted; },
    setMuted(m) {
      muted = m;
      localStorage.setItem('mc.muted', m ? '1' : '0');
      if (master) master.gain.value = m ? 0 : 0.5;
    },
  };
})(window);

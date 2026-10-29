// Fixed-accuracy bot nights, headless: node tools/simulate.js [accuracy] [shotsPerSec] [nights] [level]
// level: pumpkinPatch | cornMaze | void (default pumpkinPatch)
// Per the playtest protocol a bot may estimate Hot Streak odds, night length, escape rate and
// the cheer curve; it may not judge Prize Parade, Ghost Train, the bat premium or touch feel.
const T = require('../tuning.js');
const { Show, mulberry32, botShot } = require('../sim.js');
const acc = +(process.argv[2] || 0.44), sps = +(process.argv[3] || 1.75), nights = +(process.argv[4] || 200);
T.setLevel(process.argv[5] || 'pumpkinPatch');
const rows = [];
for (let n = 0; n < nights; n++) {
  const rng = mulberry32(1000 + n);
  const show = new Show(T, { rng, boothH: 0.52 });
  let next = 0.5;
  while (!show.over && show.t < 600) {
    show.update(1 / 60);
    if (show.t >= next) {
      const p = botShot(show, acc, rng);
      show.fire(p.x, p.y, 'bot');
      next += (1 / sps) * (0.6 + rng() * 0.8);
    }
    show.events.length = 0;
  }
  rows.push(show.summary());
}
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const frac = (f) => (rows.filter(f).length / rows.length).toFixed(2);
console.log(`${T.level}: accuracy ${acc}, ${sps} shots/s, ${nights} nights`);
console.log('median night (s)       ', med(rows.map((r) => r.runLengthSec)));
console.log('night range (s)        ', Math.min(...rows.map((r) => r.runLengthSec)), '-', Math.max(...rows.map((r) => r.runLengthSec)));
console.log('median accuracy        ', med(rows.map((r) => r.accuracy)));
console.log('reached act 3          ', frac((r) => r.actReached >= 3));
console.log('cheer at act 2/3 (med) ', med(rows.filter((r) => r.cheerAtActStart[1] != null).map((r) => r.cheerAtActStart[1])), med(rows.filter((r) => r.cheerAtActStart[2] != null).map((r) => r.cheerAtActStart[2])));
console.log('escapes / min (med)    ', med(rows.map((r) => r.escapesPerMin)));
console.log('streak reached 6+      ', frac((r) => r.streak.longest >= 6));
console.log('Hot Streak (10)        ', frac((r) => r.streak.longest >= 10));
console.log('haloes per night (med) ', med(rows.map((r) => r.prizes.length)));
const lost = ['drain', 'wildShots', 'escapes'].map((k) => `${k} ${med(rows.map((r) => r.cheerLost[k]))}`);
console.log('cheer lost (med)       ', lost.join(', '));

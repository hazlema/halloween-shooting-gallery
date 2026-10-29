// Midnight Carnival — every tuning value from the design doc, in one editable place.
// Sections mirror the doc: "Tuning: cheer, shots, streak, targets", "Tuning: prizes and
// stamp bars" and "Touch tuning values (from Art Director)". Distances in the booth are
// in booth widths; touch distances are CSS px.
(function (root) {
  const TUNING = {
    // --- Cheer ------------------------------------------------------------
    cheerStart: 100,
    cheerMax: 100,
    actStartsAt: [0, 40, 80],          // seconds of show clock
    drainPerSec: [0.5, 0.7, 2.0],      // act 1, act 2, act 3 (start)
    lastActDrainRampPerSec: 0.12,      // act 3 drain rises this much every second, no ceiling
    lowCheerWarn: 25,                  // meter warns below this

    // Payback per aimed hit: base for the first hit of a streak, + step per further hit, capped.
    paybackBase: 2.5,
    paybackPerStreak: 0.25,
    paybackCap: 3.5,

    // Wild shot cost. Act one is flat; from act two misses in a row climb the ladder.
    wildShotCostAct1: 1,
    wildShotLadder: [1, 2, 4],         // from act two; last value is the ceiling

    // Escapes (ghost or pumpkin). Bats cost nothing.
    escapeCost: { ghost: 2, pumpkin: 2, bat: 0 },
    freeEscapes: 2,

    // --- Streak and score ---------------------------------------------------
    multiplierCap: 10,
    pointsPerHit: { ghost: 100, pumpkin: 100, bat: 250 },
    prizePoints: 500,                  // x multiplier, plus its powerup
    extraPoints: 150,                  // flat, per target a chain or fan fells
    extraCheer: 1,

    // --- Targets ------------------------------------------------------------
    hitMargin: 0.25,                   // of the target's widest dimension, every act
    speed: { ghost: 0.12, pumpkin: 0.18, bat: 0.30 },   // booth widths per second
    prizeSpeed: 0.12,
    speedByAct: [1.0, 1.2, 1.3],
    size: { ghost: 0.105, pumpkin: 0.095, bat: 0.115 }, // painted width, booth widths
    spawnsPerSec: [0.9, 1.0, 1.1],
    minLiveTargets: [2, 3, 3],
    spawnWeights: { bat: 40, ghost: 30, pumpkin: 30 },
    maxSameTypeInARow: 2,

    // --- Prizes and powerups ------------------------------------------------
    haloEverySec: 10,
    burstSec: 6,
    slugReach: 0.20,                   // booth widths, from the last felled target
    buckshotHalfAngleDeg: 20,
    moonstruckSpeedFactor: 0.5,
    moonstruckDrainFactor: 0,

    // --- Stamp bars ---------------------------------------------------------
    paradeMinMultiplier: 2,
    ghostTrainFells: 8,
    hotStreakAt: 10,                   // follows multiplierCap
    lastActAt: 3,

    // --- Touch (Art Director) -----------------------------------------------
    touch: {
      dragThresholdPx: 10,
      crosshairRaisePx: 48,
      crosshairOffsetXPx: 0,
      lowerAimAreaPx: 56,              // at least 48
      cancelStripPx: 44,
    },
  };
  TUNING.hotStreakAt = TUNING.multiplierCap;

  // --- Levels -----------------------------------------------------------------
  // The values above are The Pumpkin Patch. Each other level starts from them and
  // changes only what its case sets. Order here is the order on the title screen.
  const LEVELS = [
    { id: 'pumpkinPatch', name: 'The Pumpkin Patch', difficulty: 'Easy' },
    { id: 'cornMaze', name: 'Cursed Corn Maze', difficulty: 'Medium' },
    { id: 'void', name: 'The Void of the Damned', difficulty: 'Ultra hard' },
  ];
  const PUMPKIN_PATCH = JSON.parse(JSON.stringify(TUNING));

  function setLevel(id) {
    // Reset to The Pumpkin Patch in place (the game holds this same object), then apply the level.
    Object.assign(TUNING, JSON.parse(JSON.stringify(PUMPKIN_PATCH)));
    const T = TUNING;
    switch (id) {
      case 'cornMaze': // Cursed Corn Maze (medium)
        T.haloEverySec = 25;
        T.speedByAct = [1.0, 1.2, 1.45];
        T.hitMargin = 0.20;                   // of the target's widest dimension, every act
        break;

      case 'void': // The Void of the Damned (ultra hard)
        T.haloEverySec = 30;
        T.speedByAct = [1.2, 1.45, 1.7];
        T.wildShotLadder = [2, 4, 8];
        T.hitMargin = 0.10;                   // of the target's widest dimension, every ac=
        break;

      case 'pumpkinPatch': // The Pumpkin Patch (easy): the values above, unchanged
      default:
        id = 'pumpkinPatch';
        break;
    }
    T.hotStreakAt = T.multiplierCap; // Hot Streak always follows the multiplier cap
    T.level = id;
    return T;
  }

  Object.defineProperty(TUNING, 'LEVELS', { value: LEVELS, enumerable: false });
  Object.defineProperty(TUNING, 'setLevel', { value: setLevel, enumerable: false });
  setLevel('pumpkinPatch');

  if (typeof module !== 'undefined' && module.exports) module.exports = TUNING;
  else root.TUNING = TUNING;
})(typeof window !== 'undefined' ? window : globalThis);

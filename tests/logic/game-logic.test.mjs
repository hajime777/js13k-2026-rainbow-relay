import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/logic.js';

const {
  CLEAR_PERCENT, MIN_STAGE, MAX_STAGE, LEFT, RIGHT, TOP, BOTTOM,
  distancePointToSegment, revealPercent, isClearedPercent, markRevealPoints,
  seedHash, seedMix, seedUnit, worldLength, oppositeSide, routeStep, routeExit,
  rainbowPoint, rainbowBand,
} = globalThis.RainbowLogic;

// PowerShell example:
// $env:RAINBOW_TEST_SEEDS='762178515,3454744287,295455034'; npm run test:logic
const TEST_SEEDS = (process.env.RAINBOW_TEST_SEEDS || '762178515,3454744287,295455034,777')
  .split(',').map(s => s.trim()).filter(Boolean);

function traceSeed(text) {
  const seed = seedHash(text), count = worldLength(seed), stages = [];
  let stage = 1, x = 0, y = 0, entry = BOTTOM;
  let exit = seedUnit(seed, 0, 1) < .5 ? LEFT : RIGHT;
  while (stage <= count) {
    if (stage === count) exit = -1;
    stages.push({ stage, x, y, entry, exit });
    if (stage === count) break;
    const step = routeStep(exit);
    x += step.x;
    y += step.y;
    entry = oppositeSide(exit);
    stage++;
    exit = stage === count ? -1 : routeExit(seed, stage, entry, x, y);
  }
  return { seed, count, stages };
}

function near(a, b, message) {
  assert.ok(Math.abs(a - b) < 1e-7, `${message}: ${a} != ${b}`);
}

function onSide(p, side, w, h, message) {
  if (side === LEFT) near(p.x, 0, message);
  else if (side === RIGHT) near(p.x, w, message);
  else if (side === TOP) near(p.y, 0, message);
  else if (side === BOTTOM) near(p.y, h, message);
}

test('distance and reveal helpers keep their basic behavior', () => {
  assert.equal(distancePointToSegment(5, 3, { x: 0, y: 0 }, { x: 10, y: 0 }), 3);
  assert.equal(distancePointToSegment(4, 6, { x: 1, y: 2 }, { x: 1, y: 2 }), 5);
  assert.equal(CLEAR_PERCENT, 90);
  assert.equal(revealPercent(75, 84), 89);
  assert.equal(revealPercent(76, 84), 90);
  assert.equal(isClearedPercent(89), false);
  assert.equal(isClearedPercent(90), true);
});

test('markRevealPoints does not double count hits', () => {
  const points = [{ x: 2, y: 0, hit: 1 }, { x: 4, y: 0, hit: 0 }, { x: 5, y: 8, hit: 0 }];
  assert.equal(markRevealPoints(points, { x: 0, y: 0 }, { x: 10, y: 0 }, 4), 1);
  assert.equal(markRevealPoints(points, { x: 0, y: 0 }, { x: 10, y: 0 }, 4), 0);
});

test('seed generation is deterministic', () => {
  assert.equal(seedHash('777'), seedHash('777'));
  assert.notEqual(seedHash('rainbow'), seedHash('unicorn'));
  const s = seedHash('shared-seed');
  assert.equal(seedMix(s, 1, 2, 3), seedMix(s, 1, 2, 3));
  assert.equal(seedUnit(s, 4, 5, 6), seedUnit(s, 4, 5, 6));
});

test('selected seed worlds are finite and end on the declared final screen', () => {
  for (const text of TEST_SEEDS) {
    const world = traceSeed(text);
    assert.ok(world.count >= MIN_STAGE && world.count <= MAX_STAGE, `seed ${text}: length ${world.count}`);
    assert.equal(world.stages.length, world.count, `seed ${text}: trace length`);
    assert.equal(world.stages[0].entry, BOTTOM, `seed ${text}: first entry`);
    assert.ok(world.stages[0].exit === LEFT || world.stages[0].exit === RIGHT, `seed ${text}: first exit`);
    assert.equal(world.stages.at(-1).exit, -1, `seed ${text}: final exit`);
  }
});

test('regression seed 762178515 now finishes in four screens', () => {
  assert.equal(worldLength(seedHash('762178515')), 4);
});

test('selected seed routes enter each next screen from the previous exit', () => {
  for (const text of TEST_SEEDS) {
    const world = traceSeed(text);
    for (let i = 1; i < world.stages.length; i++) {
      const a = world.stages[i - 1], b = world.stages[i], step = routeStep(a.exit);
      assert.equal(b.entry, oppositeSide(a.exit), `seed ${text}: stage ${a.stage}->${b.stage} entry`);
      assert.equal(b.x, a.x + step.x, `seed ${text}: stage ${b.stage} x`);
      assert.equal(b.y, a.y + step.y, `seed ${text}: stage ${b.stage} y`);
    }
  }
});

test('selected seed geometry starts and exits on the route sides', () => {
  const w = 100, h = 200;
  for (const text of TEST_SEEDS) {
    const world = traceSeed(text);
    for (const s of world.stages) {
      const scene = { w, h, entry: s.entry, exit: s.exit, seed: world.seed };
      const start = rainbowPoint(s.stage, 0, scene, 0);
      const end = rainbowPoint(s.stage, 1, scene, 0);
      onSide(start, s.stage === 1 ? BOTTOM : s.entry, w, h, `seed ${text}: stage ${s.stage} start`);
      if (s.exit >= 0) onSide(end, s.exit, w, h, `seed ${text}: stage ${s.stage} exit`);
      else assert.ok(end.x > 0 && end.x < w && end.y > 0 && end.y < h, `seed ${text}: final endpoint`);
    }
  }
});

test('selected seed color bands connect across every screen boundary', () => {
  const w = 100, h = 200, band = 12;
  for (const text of TEST_SEEDS) {
    const world = traceSeed(text);
    for (let n = 1; n < world.stages.length; n++) {
      const a = world.stages[n - 1], b = world.stages[n];
      const sa = { w, h, entry: a.entry, exit: a.exit, seed: world.seed };
      const sb = { w, h, entry: b.entry, exit: b.exit, seed: world.seed };
      for (let i = 0; i < 7; i++) {
        const ba = rainbowBand(a.stage, i, band, world.seed);
        const bb = rainbowBand(b.stage, i, band, world.seed);
        const pa = rainbowPoint(a.stage, 1, sa, ba.offset);
        const pb = rainbowPoint(b.stage, 0, sb, bb.offset);
        near(a.x * w + pa.x, b.x * w + pb.x, `seed ${text}: ${a.stage}->${b.stage} band ${i} x`);
        near(a.y * h + pa.y, b.y * h + pb.y, `seed ${text}: ${a.stage}->${b.stage} band ${i} y`);
      }
    }
  }
});

test('route generation is deterministic and does not immediately return through its entry edge', () => {
  for (const text of TEST_SEEDS) {
    const seed = seedHash(text);
    for (let entry = LEFT; entry <= BOTTOM; entry++) {
      const exit = routeExit(seed, 7, entry, 2, -3);
      assert.equal(exit, routeExit(seed, 7, entry, 2, -3));
      assert.notEqual(exit, entry);
    }
  }
});

test('stage 1 is a clean quarter circle and later bands may vary', () => {
  const seed = seedHash(TEST_SEEDS[0]);
  for (const exit of [LEFT, RIGHT]) {
    const scene = { w: 100, h: 200, entry: BOTTOM, exit, seed };
    const start = rainbowPoint(1, 0, scene), end = rainbowPoint(1, 1, scene);
    near(start.y, 200, `stage 1 ${exit === LEFT ? 'left' : 'right'} start y`);
    near(end.x, exit === LEFT ? 0 : 100, `stage 1 ${exit === LEFT ? 'left' : 'right'} end x`);
  }
  assert.deepEqual(rainbowBand(1, 3, 12, seed), { width: 12, offset: 32.4 });
  const widths = Array.from({ length: 7 }, (_, i) => rainbowBand(3, i, 12, seed).width);
  assert.ok(Math.max(...widths) - Math.min(...widths) > 1);
});

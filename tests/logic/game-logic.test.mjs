import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/logic.js';

const {
  CLEAR_PERCENT, MIN_STAGE, MAX_STAGE, LEFT, RIGHT, TOP, BOTTOM,
  distancePointToSegment, revealPercent, isClearedPercent, markRevealPoints,
  seedHash, seedMix, seedUnit, worldLength, oppositeSide, routeStep, routeExit,
  rainbowPoint, rainbowBand,
} = globalThis.RainbowLogic;

test('distancePointToSegment returns the expected distance', () => {
  assert.equal(distancePointToSegment(5, 3, { x: 0, y: 0 }, { x: 10, y: 0 }), 3);
  assert.equal(distancePointToSegment(4, 6, { x: 1, y: 2 }, { x: 1, y: 2 }), 5);
});

test('reveal percentage still clears at 90 percent', () => {
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

test('the same seed text always hashes to the same world seed', () => {
  assert.equal(seedHash('777'), seedHash('777'));
  assert.equal(seedHash('rainbow'), seedHash('rainbow'));
  assert.notEqual(seedHash('rainbow'), seedHash('unicorn'));
});

test('seed helpers are deterministic', () => {
  const s = seedHash('shared-seed');
  assert.equal(seedMix(s, 1, 2, 3), seedMix(s, 1, 2, 3));
  assert.equal(seedUnit(s, 4, 5, 6), seedUnit(s, 4, 5, 6));
});

test('seed worlds always end between 4 and 32 screens', () => {
  for (let i = 0; i < 100; i++) {
    const s = seedHash(String(i));
    const n = worldLength(s);
    assert.ok(n >= MIN_STAGE && n <= MAX_STAGE);
    assert.equal(n, worldLength(s));
  }
});

test('route generation is deterministic and never immediately reverses', () => {
  for (let i = 0; i < 100; i++) {
    const s = seedHash(String(i));
    for (let entry = LEFT; entry <= BOTTOM; entry++) {
      const a = routeExit(s, 7, entry, 2, -3);
      assert.equal(a, routeExit(s, 7, entry, 2, -3));
      assert.notEqual(a, entry);
    }
  }
});

test('side helpers still describe neighboring screens', () => {
  assert.equal(oppositeSide(LEFT), RIGHT);
  assert.equal(oppositeSide(TOP), BOTTOM);
  assert.deepEqual(routeStep(LEFT), { x: -1, y: 0 });
  assert.deepEqual(routeStep(BOTTOM), { x: 0, y: 1 });
});

test('stage 1 is a conventional semicircle in either travel direction', () => {
  const seed = seedHash('arc');
  const left = { w: 100, h: 200, entry: LEFT, exit: RIGHT, seed };
  const right = { w: 100, h: 200, entry: RIGHT, exit: LEFT, seed };
  const a = rainbowPoint(1, 0, left);
  const m = rainbowPoint(1, 0.5, left);
  const z = rainbowPoint(1, 1, left);
  assert.equal(a.x, 0);
  assert.equal(z.x, 100);
  assert.ok(m.y < a.y);
  assert.equal(rainbowPoint(1, 0, right).x, 100);
  assert.equal(rainbowPoint(1, 1, right).x, 0);
});

test('stage 1 connects exactly to stage 2 at the shared edge', () => {
  const seed = seedHash('295455034');
  for (const entry of [LEFT, RIGHT]) {
    const exit = oppositeSide(entry);
    const nextEntry = oppositeSide(exit);
    const first = { w: 100, h: 200, entry, exit, seed };
    const second = { w: 100, h: 200, entry: nextEntry, exit: TOP, seed };
    for (let i = 0; i < 7; i++) {
      const band = rainbowBand(1, i, 12, seed);
      const a = rainbowPoint(1, 1, first, band.offset);
      const b = rainbowPoint(2, 0, second, band.offset);
      assert.ok(Math.abs(a.y - b.y) < 1e-9);
      assert.ok(Math.abs((exit === LEFT ? a.x : a.x - 100)) < 1e-9);
      assert.ok(Math.abs((nextEntry === LEFT ? b.x : b.x - 100)) < 1e-9);
    }
  }
});

test('band profile remains consistent across a seeded world', () => {
  const seed = seedHash('god-seed');
  for (let i = 0; i < 7; i++) {
    assert.deepEqual(rainbowBand(2, i, 12, seed), rainbowBand(19, i, 12, seed));
  }
});

test('the same seed generates the same later rainbow geometry', () => {
  const seed = seedHash('god-seed');
  const scene = { w: 100, h: 200, entry: TOP, exit: RIGHT, seed };
  assert.deepEqual(rainbowPoint(5, 0.37, scene, 9), rainbowPoint(5, 0.37, scene, 9));
});

test('different seeds can produce different later rainbow geometry', () => {
  const a = { w: 100, h: 200, entry: TOP, exit: RIGHT, seed: seedHash('a') };
  const b = { ...a, seed: seedHash('b') };
  const p = rainbowPoint(5, 0.37, a);
  const q = rainbowPoint(5, 0.37, b);
  assert.ok(Math.hypot(p.x - q.x, p.y - q.y) > 0.01);
});

test('a seeded final segment ends inside the screen', () => {
  const seed = seedHash('end');
  const scene = { w: 100, h: 200, entry: BOTTOM, exit: -1, seed };
  const p = rainbowPoint(worldLength(seed), 1, scene);
  assert.ok(p.x > 0 && p.x < 100);
  assert.ok(p.y > 0 && p.y < 200);
});

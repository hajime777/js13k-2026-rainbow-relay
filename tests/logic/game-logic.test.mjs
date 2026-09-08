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

test('seed generation is deterministic', () => {
  assert.equal(seedHash('777'), seedHash('777'));
  assert.notEqual(seedHash('rainbow'), seedHash('unicorn'));
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

test('stage 1 is a roughly 90 degree rainbow from the bottom to a seeded side', () => {
  const seed = seedHash('arc');
  for (const exit of [LEFT, RIGHT]) {
    const scene = { w: 100, h: 200, entry: oppositeSide(exit), exit, seed };
    const a = rainbowPoint(1, 0, scene);
    const m = rainbowPoint(1, 0.5, scene);
    const z = rainbowPoint(1, 1, scene);
    assert.equal(a.y, 200);
    assert.ok(a.x > 0 && a.x < 100);
    assert.equal(z.x, exit === LEFT ? 0 : 100);
    assert.ok(z.y < a.y);
    assert.ok(m.y < a.y);
  }
});

test('stage 1 connects exactly to stage 2 at the shared edge for every band', () => {
  const seed = seedHash('295455034');
  for (const exit of [LEFT, RIGHT]) {
    const nextEntry = oppositeSide(exit);
    const first = { w: 100, h: 200, entry: oppositeSide(exit), exit, seed };
    const second = { w: 100, h: 200, entry: nextEntry, exit: TOP, seed };
    for (let i = 0; i < 7; i++) {
      const band1 = rainbowBand(1, i, 12, seed);
      const band2 = rainbowBand(2, i, 12, seed);
      const a = rainbowPoint(1, 1, first, band1.offset);
      const b = rainbowPoint(2, 0, second, band2.offset);
      assert.ok(Math.abs(a.y - b.y) < 1e-9);
      assert.ok(Math.abs((exit === LEFT ? a.x : a.x - 100)) < 1e-9);
      assert.ok(Math.abs((nextEntry === LEFT ? b.x : b.x - 100)) < 1e-9);
    }
  }
});

test('stage 1 keeps a clean regular band profile', () => {
  const seed = seedHash('normal-start');
  assert.deepEqual(rainbowBand(1, 0, 12, seed), { width: 12, offset: 0 });
  assert.deepEqual(rainbowBand(1, 3, 12, seed), { width: 12, offset: 32.4 });
});

test('later seeded color bands have visibly different widths', () => {
  const seed = seedHash('god-seed');
  const widths = Array.from({ length: 7 }, (_, i) => rainbowBand(3, i, 12, seed).width);
  assert.ok(Math.max(...widths) - Math.min(...widths) > 1);
});

test('later rainbow spreads and twists inside a segment but keeps edge continuity', () => {
  const seed = seedHash('twist');
  const scene = { w: 100, h: 200, entry: LEFT, exit: RIGHT, seed };
  const band = rainbowBand(9, 5, 12, seed);
  const centerEdge = rainbowPoint(9, 0, scene, band.offset);
  const centerMid = rainbowPoint(9, 0.37, scene, band.offset);
  const plainMid = rainbowPoint(9, 0.37, scene, 0);
  assert.ok(Math.hypot(centerMid.x - plainMid.x, centerMid.y - plainMid.y) > 1);
  assert.equal(centerEdge.x, 0);
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

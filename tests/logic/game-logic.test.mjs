import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/logic.js';

const {
  CLEAR_PERCENT,
  distancePointToSegment,
  revealPercent,
  isClearedPercent,
  markRevealPoints,
  rainbowPoint,
  rainbowBand,
} = globalThis.RainbowLogic;

test('distancePointToSegment returns perpendicular distance inside the segment', () => {
  const d = distancePointToSegment(5, 3, { x: 0, y: 0 }, { x: 10, y: 0 });
  assert.equal(d, 3);
});

test('distancePointToSegment clamps to the nearest endpoint', () => {
  const d = distancePointToSegment(15, 4, { x: 0, y: 0 }, { x: 10, y: 0 });
  assert.equal(d, Math.hypot(5, 4));
});

test('distancePointToSegment handles a zero-length segment', () => {
  const d = distancePointToSegment(4, 6, { x: 1, y: 2 }, { x: 1, y: 2 });
  assert.equal(d, 5);
});

test('revealPercent uses the same floor rounding as the UI', () => {
  assert.equal(revealPercent(0, 84), 0);
  assert.equal(revealPercent(1, 84), 1);
  assert.equal(revealPercent(52, 84), 61);
  assert.equal(revealPercent(53, 84), 63);
  assert.equal(revealPercent(84, 84), 100);
});

test('revealPercent is safe when there are no sample points', () => {
  assert.equal(revealPercent(0, 0), 0);
  assert.equal(revealPercent(10, 0), 0);
});

test('clear threshold is 90 percent', () => {
  assert.equal(CLEAR_PERCENT, 90);
  assert.equal(isClearedPercent(89), false);
  assert.equal(isClearedPercent(90), true);
  assert.equal(isClearedPercent(100), true);
});

test('markRevealPoints marks only points inside the scrub radius', () => {
  const points = [
    { x: 2, y: 0, hit: 0 },
    { x: 5, y: 3, hit: 0 },
    { x: 5, y: 8, hit: 0 },
  ];

  const added = markRevealPoints(points, { x: 0, y: 0 }, { x: 10, y: 0 }, 4);

  assert.equal(added, 2);
  assert.deepEqual(points.map((p) => p.hit), [1, 1, 0]);
});

test('markRevealPoints does not count an already revealed point twice', () => {
  const points = [
    { x: 2, y: 0, hit: 1 },
    { x: 4, y: 0, hit: 0 },
  ];

  const added = markRevealPoints(points, { x: 0, y: 0 }, { x: 10, y: 0 }, 4);

  assert.equal(added, 1);
  assert.deepEqual(points.map((p) => p.hit), [1, 1]);
});

test('stage 1 rainbowPoint keeps the original circular arc', () => {
  const rainbow = { cx: 100, cy: 200, base: 80, a0: Math.PI, a1: Math.PI * 2 };
  const p = rainbowPoint(1, 0.5, rainbow, 10);
  assert.ok(Math.abs(p.x - 100) < 1e-9);
  assert.ok(Math.abs(p.y - 130) < 1e-9);
});

test('stage 2 is deterministic and deformed', () => {
  const rainbow = { cx: 100, cy: 200, base: 80, a0: Math.PI, a1: Math.PI * 2 };
  const normal = rainbowPoint(1, 0.37, rainbow, 10);
  const weirdA = rainbowPoint(2, 0.37, rainbow, 10);
  const weirdB = rainbowPoint(2, 0.37, rainbow, 10);

  assert.deepEqual(weirdA, weirdB);
  assert.ok(Math.hypot(weirdA.x - normal.x, weirdA.y - normal.y) > 0.5);
});

test('stage 3 is an inverted arc', () => {
  const rainbow = { cx: 100, cy: 200, base: 80, a0: Math.PI, a1: Math.PI * 2 };
  const left = rainbowPoint(3, 0, rainbow, 10);
  const middle = rainbowPoint(3, 0.5, rainbow, 10);
  const right = rainbowPoint(3, 1, rainbow, 10);

  assert.ok(middle.y > left.y);
  assert.ok(middle.y > right.y);
});

test('stage 4 is a horizontal straight rainbow', () => {
  const rainbow = { cx: 100, cy: 200, base: 80, a0: Math.PI, a1: Math.PI * 2 };
  const a = rainbowPoint(4, 0.1, rainbow, 10);
  const b = rainbowPoint(4, 0.9, rainbow, 10);

  assert.ok(b.x > a.x);
  assert.equal(a.y, b.y);
});

test('stage 1 rainbow bands keep the original width and spacing', () => {
  assert.deepEqual(rainbowBand(1, 0, 12), { width: 12, offset: 0 });
  const middle = rainbowBand(1, 3, 12);
  assert.equal(middle.width, 12);
  assert.ok(Math.abs(middle.offset - 33.12) < 1e-9);
});

test('later rainbow bands vary width and spacing deterministically', () => {
  const a = rainbowBand(5, 2, 12);
  const b = rainbowBand(5, 2, 12);
  const c = rainbowBand(5, 3, 12);

  assert.deepEqual(a, b);
  assert.notEqual(a.width, 12);
  assert.notEqual(a.offset, c.offset);
});

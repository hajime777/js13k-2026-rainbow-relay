import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/logic.js';

const {
  CLEAR_PERCENT,
  distancePointToSegment,
  revealPercent,
  isClearedPercent,
  markRevealPoints,
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

test('clear threshold is 62 percent', () => {
  assert.equal(CLEAR_PERCENT, 62);
  assert.equal(isClearedPercent(61), false);
  assert.equal(isClearedPercent(62), true);
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

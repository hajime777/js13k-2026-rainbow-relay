import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/logic.js';

const {
  CLEAR_PERCENT,
  MAX_STAGE,
  LEFT,
  RIGHT,
  TOP,
  BOTTOM,
  distancePointToSegment,
  revealPercent,
  isClearedPercent,
  markRevealPoints,
  oppositeSide,
  routeStep,
  routeExit,
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
  assert.equal(revealPercent(75, 84), 89);
  assert.equal(revealPercent(76, 84), 90);
  assert.equal(revealPercent(84, 84), 100);
});

test('revealPercent is safe when there are no sample points', () => {
  assert.equal(revealPercent(0, 0), 0);
  assert.equal(revealPercent(10, 0), 0);
});

test('clear threshold is 90 percent and test run is eight stages', () => {
  assert.equal(CLEAR_PERCENT, 90);
  assert.equal(MAX_STAGE, 8);
  assert.equal(isClearedPercent(89), false);
  assert.equal(isClearedPercent(90), true);
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
});

test('oppositeSide and routeStep describe neighboring screens', () => {
  assert.equal(oppositeSide(LEFT), RIGHT);
  assert.equal(oppositeSide(RIGHT), LEFT);
  assert.equal(oppositeSide(TOP), BOTTOM);
  assert.equal(oppositeSide(BOTTOM), TOP);
  assert.deepEqual(routeStep(LEFT), { x: -1, y: 0 });
  assert.deepEqual(routeStep(BOTTOM), { x: 0, y: 1 });
});

test('routeExit is deterministic without per-stage route data', () => {
  assert.equal(routeExit(1, LEFT), BOTTOM);
  assert.equal(routeExit(2, TOP), LEFT);
  assert.equal(routeExit(3, RIGHT), LEFT);
  assert.equal(routeExit(4, RIGHT), RIGHT);
});

test('stage 1 starts at a side and ends at the bottom', () => {
  const leftScene = { w: 100, h: 200, entry: LEFT, exit: BOTTOM };
  const rightScene = { w: 100, h: 200, entry: RIGHT, exit: BOTTOM };
  const a = rainbowPoint(1, 0, leftScene);
  const b = rainbowPoint(1, 0, rightScene);
  const end = rainbowPoint(1, 1, leftScene);
  assert.equal(a.x, 0);
  assert.equal(b.x, 100);
  assert.equal(end.y, 200);
});

test('adjacent stage endpoints line up on a shared screen boundary', () => {
  const first = { w: 100, h: 200, entry: LEFT, exit: BOTTOM };
  const second = { w: 100, h: 200, entry: TOP, exit: LEFT };
  const out = rainbowPoint(1, 1, first);
  const into = rainbowPoint(2, 0, second);
  assert.ok(Math.abs(out.x - into.x) < 1e-9);
  assert.equal(out.y, 200);
  assert.equal(into.y, 0);
});

test('the last stage ends inside the screen instead of continuing through an edge', () => {
  const scene = { w: 100, h: 200, entry: BOTTOM, exit: -1 };
  const end = rainbowPoint(MAX_STAGE, 1, scene);
  assert.ok(end.x > 0 && end.x < 100);
  assert.ok(end.y > 0 && end.y < 200);
});

test('later stages vary rainbow band widths and spacing', () => {
  const a = rainbowBand(2, 0, 12);
  const b = rainbowBand(2, 4, 12);
  assert.notEqual(a.width, b.width);
  assert.notEqual(a.offset, b.offset);
});

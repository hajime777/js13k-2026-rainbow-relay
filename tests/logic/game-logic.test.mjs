import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../../src/logic.js';

const {
  CLEAR_PERCENT, MIN_STAGE, MAX_STAGE, LEFT, RIGHT, TOP, BOTTOM,
  distancePointToSegment, revealPercent, isClearedPercent, isRainbowConnected, markRevealPoints,
  seedHash, seedMix, seedUnit, seedGenes, seedFromGenes, worldLength,
  oppositeSide, routeStep, firstExit, routeExit, finalPoint, rainbowPoint, rainbowBand,
} = globalThis.RainbowLogic;

// PowerShell example:
// $env:RAINBOW_TEST_SEEDS='762178515,2670021042,2316340504,3205971344'; npm run test:logic
const TEST_SEEDS = (process.env.RAINBOW_TEST_SEEDS || '762178515,2670021042,2316340504,3205971344,3454744287,295455034,777')
  .split(',').map(s => s.trim()).filter(Boolean);

function traceSeed(text) {
  const seed = seedHash(text), count = worldLength(seed), stages = [];
  let stage = 1, x = 0, y = 0, entry = BOTTOM;
  let exit = firstExit(seed);
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
  else near(p.y, h, message);
}

test('basic helpers keep their behavior', () => {
  assert.equal(distancePointToSegment(5, 3, { x: 0, y: 0 }, { x: 10, y: 0 }), 3);
  assert.equal(CLEAR_PERCENT, 70);
  assert.equal(revealPercent(76, 84), 90);
  assert.equal(isClearedPercent(70), true);
  const points = [{ x: 2, y: 0, hit: 1 }, { x: 4, y: 0, hit: 0 }];
  assert.equal(markRevealPoints(points, { x: 0, y: 0 }, { x: 10, y: 0 }, 4), 1);
});

test('section clear connection requires both ends and rejects large gaps', () => {
  const p = Array.from({ length: 20 }, () => ({ hit: 1 }));
  p[5].hit = p[6].hit = p[7].hit = p[8].hit = 0;
  assert.equal(isRainbowConnected(p), true);
  p[9].hit = 0;
  assert.equal(isRainbowConnected(p), false);
  p[9].hit = 1;
  p[0].hit = 0;
  assert.equal(isRainbowConnected(p), false);
  p[0].hit = 1;
  p.at(-1).hit = 0;
  assert.equal(isRainbowConnected(p), false);
});

test('numeric seed text is the actual 32-bit genome id', () => {
  assert.equal(seedHash('762178515'), 762178515);
  assert.equal(seedHash('777'), 777);
  assert.equal(seedHash('unicorn'), seedHash('unicorn'));
  assert.notEqual(seedHash('rainbow'), seedHash('unicorn'));
  const s = seedHash('shared-seed');
  assert.equal(seedMix(s, 1, 2, 3), seedMix(s, 1, 2, 3));
});

test('genome encoding exposes controllable tendencies', () => {
  const seed = seedFromGenes({ length: 16, bend: .8, width: .9, twist: .9, color: .8, turn: .6, branch: .4, detail: 7 });
  const g = seedGenes(seed);
  assert.equal(g.length, 16);
  assert.ok(Math.abs(g.bend - .8) < .08);
  assert.ok(Math.abs(g.width - .9) < .08);
  assert.ok(Math.abs(g.twist - .9) < .08);
  assert.ok(Math.abs(g.color - .8) < .08);
  assert.equal(g.detail, 7);
});

test('every world length from 4 through 32 can be selected exactly', () => {
  assert.equal(MIN_STAGE, 4);
  assert.equal(MAX_STAGE, 32);
  for (let length = MIN_STAGE; length <= MAX_STAGE; length++) {
    const seed = seedFromGenes({ length, detail: length & 31 });
    assert.equal(worldLength(seed), length, `requested ${length}, seed ${seed}`);
  }
});

test('selected seed worlds are finite and connected', () => {
  for (const text of TEST_SEEDS) {
    const world = traceSeed(text);
    assert.ok(world.count >= MIN_STAGE && world.count <= MAX_STAGE, `seed ${text}: length ${world.count}`);
    assert.equal(world.stages.length, world.count, `seed ${text}: trace length`);
    assert.equal(world.stages[0].entry, BOTTOM, `seed ${text}: first entry`);
    assert.equal(world.stages[0].exit, firstExit(world.seed), `seed ${text}: first exit`);
    assert.equal(world.stages.at(-1).exit, -1, `seed ${text}: final exit`);
    for (let i = 1; i < world.stages.length; i++) {
      const a = world.stages[i - 1], b = world.stages[i], step = routeStep(a.exit);
      assert.equal(b.entry, oppositeSide(a.exit), `seed ${text}: ${a.stage}->${b.stage} entry`);
      assert.equal(b.x, a.x + step.x, `seed ${text}: stage ${b.stage} x`);
      assert.equal(b.y, a.y + step.y, `seed ${text}: stage ${b.stage} y`);
    }
  }
});

test('selected seed geometry starts and exits on route sides', () => {
  const w = 100, h = 200;
  for (const text of TEST_SEEDS) {
    const world = traceSeed(text);
    for (const s of world.stages) {
      const scene = { w, h, entry: s.entry, exit: s.exit, seed: world.seed };
      const start = rainbowPoint(s.stage, 0, scene, 0);
      const end = rainbowPoint(s.stage, 1, scene, 0);
      if (s.stage === 1) {
        near(start.y, h * .72, `seed ${text}: stage 1 start y`);
        near(start.x, s.exit === RIGHT ? w * .28 : w * .72, `seed ${text}: stage 1 start x`);
      } else onSide(start, s.entry, w, h, `seed ${text}: stage ${s.stage} start`);
      if (s.exit >= 0) onSide(end, s.exit, w, h, `seed ${text}: stage ${s.stage} exit`);
      else assert.ok(end.x >= 0 && end.x <= w && end.y >= 0 && end.y <= h, `seed ${text}: final endpoint`);
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
        const pa = rainbowPoint(a.stage, 1, sa, rainbowBand(a.stage, i, band, world.seed).offset);
        const pb = rainbowPoint(b.stage, 0, sb, rainbowBand(b.stage, i, band, world.seed).offset);
        near(a.x * w + pa.x, b.x * w + pb.x, `seed ${text}: ${a.stage}->${b.stage} band ${i} x`);
        near(a.y * h + pa.y, b.y * h + pb.y, `seed ${text}: ${a.stage}->${b.stage} band ${i} y`);
      }
    }
  }
});

test('selected seed color bands do not jump inside a screen', () => {
  const w = 100, h = 200, band = 12, samples = 256, maxStep = 30;
  for (const text of TEST_SEEDS) {
    const world = traceSeed(text);
    for (const s of world.stages) {
      const scene = { w, h, entry: s.entry, exit: s.exit, seed: world.seed };
      for (let i = 0; i < 7; i++) {
        const b = rainbowBand(s.stage, i, band, world.seed);
        let prev = rainbowPoint(s.stage, 0, scene, b.offset);
        for (let j = 1; j <= samples; j++) {
          const p = rainbowPoint(s.stage, j / samples, scene, b.offset);
          const d = Math.hypot(p.x - prev.x, p.y - prev.y);
          assert.ok(d < maxStep, `seed ${text}: stage ${s.stage} band ${i} internal jump ${d}`);
          prev = p;
        }
      }
    }
  }
});

test('reported high-twist seed keeps neighboring color bands from collapsing', () => {
  const world = traceSeed('3205971344'), w = 480, h = 853, band = 14, samples = 256;
  for (const s of world.stages) {
    const scene = { w, h, entry: s.entry, exit: s.exit, seed: world.seed };
    for (let j = 0; j <= samples; j++) {
      const u = j / samples;
      const p = Array.from({ length: 7 }, (_, i) => rainbowPoint(s.stage, u, scene, rainbowBand(s.stage, i, band, world.seed).offset));
      for (let i = 0; i < 6; i++) {
        const d = Math.hypot(p[i + 1].x - p[i].x, p[i + 1].y - p[i].y);
        assert.ok(d > 8, `seed 3205971344: stage ${s.stage} bands ${i}/${i + 1} collapsed to ${d}`);
      }
    }
  }
});

test('high twist genome creates more band-width movement than low twist genome', () => {
  const base = { length: 8, bend: .5, width: .5, color: .5, turn: .3, branch: 0, detail: 9 };
  const low = seedFromGenes({ ...base, twist: 0 }), high = seedFromGenes({ ...base, twist: 1 });
  const scene = seed => ({ w: 100, h: 200, entry: LEFT, exit: RIGHT, seed });
  const offset = 45;
  const movement = seed => {
    const values = [];
    for (let i = 0; i <= 128; i++) {
      const u = i / 128, p = rainbowPoint(3, u, scene(seed), offset), c = rainbowPoint(3, u, scene(seed), 0);
      values.push(Math.hypot(p.x - c.x, p.y - c.y));
    }
    return Math.max(...values) - Math.min(...values);
  };
  assert.ok(movement(high) > movement(low));
});

test('high color gene increases band-width variation', () => {
  const base = { length: 8, bend: .5, width: .5, twist: .5, turn: .3, branch: 0, detail: 11 };
  const low = seedFromGenes({ ...base, color: 0 }), high = seedFromGenes({ ...base, color: 1 });
  const spread = seed => {
    const widths = Array.from({ length: 7 }, (_, i) => rainbowBand(3, i, 12, seed).width);
    return Math.max(...widths) - Math.min(...widths);
  };
  assert.ok(spread(high) > spread(low));
});

test('stage 1 stays a clean quarter circle regardless of genome weirdness', () => {
  const seed = seedFromGenes({ length: 32, bend: 1, width: 1, twist: 1, color: 1, turn: 1, branch: 1, detail: 31 });
  for (const exit of [LEFT, RIGHT]) {
    const scene = { w: 100, h: 200, entry: BOTTOM, exit, seed };
    const start = rainbowPoint(1, 0, scene), end = rainbowPoint(1, 1, scene);
    near(start.x, exit === RIGHT ? 28 : 72, 'stage 1 start x');
    near(start.y, 144, 'stage 1 start y');
    near(end.x, exit === LEFT ? 0 : 100, 'stage 1 end x');
    near(end.y, 72, 'stage 1 end y');
    assert.deepEqual(rainbowBand(1, 3, 12, seed), { width: 12, offset: 32.4 });
  }
});

test('unicorn stays upright in opening demo and final overview', () => {
  const source = readFileSync(new URL('../../src/index.html', import.meta.url), 'utf8');
  assert.match(source, /function unicorn\(g,X,Y,S,F\)\{[^}]*g\.scale\(F\*S,S\)/);
  assert.doesNotMatch(source, /function unicorn\(g,X,Y,S,F\)\{[^}]*g\.rotate\(/);
  assert.ok(source.includes('unicorn(x,p.x,p.y-30*(1-u)-pet*12,2.2,f)'));
  assert.ok(source.includes('unicorn(x,ox+(h.x+p[0])*s,oy+(h.y*a+p[1]*a)*s,1.5,f)'));
});

test('resize preserves current sky state instead of rebuilding the stage', () => {
  const source = readFileSync(new URL('../../src/index.html', import.meta.url), 'utf8');
  assert.ok(source.includes('hits=points.map(p=>p.hit)'));
  assert.ok(source.includes('if(!ow)return startStage()'));
  assert.ok(source.includes('maskCtx.drawImage(m,0,0,m.width,m.height,0,0,W,H)'));
  assert.ok(source.includes('revealed=points.reduce((n,p)=>n+p.hit,0)'));
});

test('scrub cursor is visible in tutorial and during timed play', () => {
  const source = readFileSync(new URL('../../src/index.html', import.meta.url), 'utf8');
  assert.ok(source.includes("function cursor(){if(mouse.x<0||overview||transition||timeUp||(!running&&intro!==-1))return"));
  assert.ok(source.includes("if(running||intro===-1)c.style.cursor='none'"));
  assert.ok(source.includes('if(intro<0)drawTutorialClouds()'));
  assert.ok(source.includes('}cursor()}'));
  assert.ok(source.includes("ready=0;running=1;c.style.cursor='none'"));
  assert.ok(source.includes("if(intro===-1)tutorialScrub(last,{x:last.x+1,y:last.y});else{revealed+=blowBurst(last);scrub(last,{x:last.x+1,y:last.y})}"));
});

test('opening demo gates the time limit behind the GO prompt', () => {
  const source = readFileSync(new URL('../../src/index.html', import.meta.url), 'utf8');
  assert.match(source, /if\(intro===-1\)\{startStage\(\);intro=0;[^}]*resetBtn\.style\.display='none'\}/);
  assert.ok(source.includes("clearText.textContent='虹をたどって僕を見つけて！'"));
  assert.ok(source.includes("clearText.textContent='もっと先にいるよ！'"));
  assert.ok(source.includes("nextBtn.textContent='GO'"));
  assert.ok(source.includes("if(ready){ready=0;running=1"));
  assert.ok(source.includes('if(running&&!overview&&!goal&&!timeUp&&!sectionClearT)'));
  assert.ok(source.includes('isClearedPercent(p)&&isRainbowConnected(track)&&!cleared'));
  assert.ok(source.includes("sectionClearT=GAME_CONFIG.SECTION_CLEAR_DELAY;clearText.textContent='SECTION CLEAR!'"));
  assert.ok(source.includes('function drawIntro()'));
});
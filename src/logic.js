(() => {
  const CLEAR_PERCENT = 80;
  const MIN_STAGE = 4, MAX_STAGE = 32;
  const BASE_STAGE_COUNT = 32, MAX_STAGE_BONUS = 31;
  const FIRST_SECTION_COUNT = 4, MAX_SECTION_COUNT = 32;
  const SECONDS_PER_SECTION = 5, MIN_STAGE_TIME = 12, MAX_CLEAN_BONUS = 12;
  const CLEANER_LEVEL_STEP = 5, MAX_CLEANER_LEVEL = 8;
  const CLEANER_RADIUS = 52, CLEANER_RADIUS_STEP = 5;
  const CLEANER_PUSH = 1, CLEANER_PUSH_STEP = .12;
  const LEFT = 0, RIGHT = 1, TOP = 2, BOTTOM = 3;

  function distancePointToSegment(px, py, a, b) {
    const vx = b.x - a.x, vy = b.y - a.y;
    const lengthSquared = vx * vx + vy * vy;
    if (!lengthSquared) return Math.hypot(px - a.x, py - a.y);
    const u = Math.max(0, Math.min(1, ((px - a.x) * vx + (py - a.y) * vy) / lengthSquared));
    return Math.hypot(px - a.x - vx * u, py - a.y - vy * u);
  }

  function revealPercent(revealed, total) {
    return total > 0 ? Math.floor((revealed / total) * 100) : 0;
  }

  function isClearedPercent(percent, threshold = CLEAR_PERCENT) {
    return percent >= threshold;
  }

  function isRainbowConnected(points, maxGap = 4) {
    if (!points.length || !points[0].hit || !points[points.length - 1].hit) return false;
    let gap = 0;
    for (const point of points) {
      if (point.hit) gap = 0;
      else if (++gap > maxGap) return false;
    }
    return true;
  }

  function markRevealPoints(points, a, b, radius) {
    let added = 0;
    for (const point of points) {
      if (!point.hit && distancePointToSegment(point.x, point.y, a, b) < radius) {
        point.hit = 1;
        added++;
      }
    }
    return added;
  }

  function seedHash(value) {
    const s = String(value).trim();
    if (/^\d{1,10}$/.test(s)) {
      const n = Number(s);
      if (n <= 4294967295) return n >>> 0;
    }
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= h >>> 16;
    h = Math.imul(h, 2246822507);
    h ^= h >>> 13;
    h = Math.imul(h, 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }

  function seedMix(seed, a = 0, b = 0, c = 0) {
    let h = (seed ^ Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 2147483647)) >>> 0;
    h ^= h >>> 16;
    h = Math.imul(h, 2246822507);
    h ^= h >>> 13;
    h = Math.imul(h, 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  }

  function seedUnit(seed, a = 0, b = 0, c = 0) {
    return seedMix(seed, a, b, c) / 4294967296;
  }

  function lengthFromCode(code) {
    return Math.min(MAX_STAGE, MIN_STAGE + (code & 31));
  }

  function seedStageLimit(seed) {
    return BASE_STAGE_COUNT + Math.min(MAX_STAGE_BONUS, (seed >>> 27) & 31);
  }

  function stageSectionCount(stage) {
    return Math.min(MAX_SECTION_COUNT, FIRST_SECTION_COUNT + Math.max(0, stage - 1));
  }

  function cleanerLevel(stage) {
    return Math.min(MAX_CLEANER_LEVEL, 1 + Math.floor(Math.max(0, stage - 1) / CLEANER_LEVEL_STEP));
  }

  function cleanerRadius(stage) {
    return CLEANER_RADIUS + (cleanerLevel(stage) - 1) * CLEANER_RADIUS_STEP;
  }

  function cleanerPush(stage) {
    return CLEANER_PUSH + (cleanerLevel(stage) - 1) * CLEANER_PUSH_STEP;
  }

  function stageBaseTime(stage) {
    return Math.max(MIN_STAGE_TIME, stageSectionCount(stage) * SECONDS_PER_SECTION);
  }

  function cleanTimeBonus(cleanRate) {
    return Math.round(Math.max(0, Math.min(100, cleanRate)) * MAX_CLEAN_BONUS / 100);
  }

  function nextStageTime(stage, cleanRate) {
    return Math.max(MIN_STAGE_TIME, stageBaseTime(stage + 1) + cleanTimeBonus(cleanRate));
  }

  function stageScore(rainbowRate, cleanRate, timeLeft) {
    return Math.round(Math.max(0, rainbowRate) * 10 + Math.max(0, cleanRate) * 10 + Math.max(0, timeLeft) * 25);
  }

  function seedGenes(seed) {
    seed >>>= 0;
    return {
      length: lengthFromCode((seed >>> 27) & 31),
      bend: ((seed >>> 23) & 15) / 15,
      width: ((seed >>> 19) & 15) / 15,
      twist: ((seed >>> 15) & 15) / 15,
      color: ((seed >>> 11) & 15) / 15,
      turn: ((seed >>> 8) & 7) / 7,
      branch: ((seed >>> 5) & 7) / 7,
      detail: seed & 31,
    };
  }

  function seedFromGenes(g = {}) {
    const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number(v) || 0));
    const wanted = Math.round(clamp(g.length ?? 12, MIN_STAGE, MAX_STAGE));
    const lc = wanted - MIN_STAGE;
    const q4 = v => Math.round(clamp(v) * 15);
    const q3 = v => Math.round(clamp(v) * 7);
    const detail = Math.max(0, Math.min(31, Math.round(Number(g.detail) || 0)));
    return (lc << 27 | q4(g.bend) << 23 | q4(g.width) << 19 | q4(g.twist) << 15 |
      q4(g.color) << 11 | q3(g.turn) << 8 | q3(g.branch) << 5 | detail) >>> 0;
  }

  function worldLength(seed) {
    return seedGenes(seed).length;
  }

  function oppositeSide(side) {
    return side ^ 1;
  }

  function routeStep(side) {
    return { x: side === LEFT ? -1 : side === RIGHT ? 1 : 0, y: side === TOP ? -1 : side === BOTTOM ? 1 : 0 };
  }

  function firstExit(seed) {
    return seedUnit(seed, 0, 1) < .5 ? LEFT : RIGHT;
  }

  function routeExit(seed, stage, entry, x = 0, y = 0) {
    const r = seedUnit(seed, stage, x * 37 + y * 101, entry + 503);
    const forward = 0.84 - 0.34 * seedGenes(seed).turn;
    if (r < forward) return oppositeSide(entry);
    if (entry < 2) return r < (1 + forward) / 2 ? TOP : BOTTOM;
    return r < (1 + forward) / 2 ? LEFT : RIGHT;
  }

  function firstRadius(w, h) {
    return w * 0.72;
  }

  function edgeValue(seed, key) {
    const g = seedGenes(seed);
    return 0.34 + (0.32 + 0.12 * g.bend) * seedUnit(seed, key, 701);
  }

  function edgePoint(seed, side, key, w, h) {
    if (key === 1 && side < 2) {
      const r = firstRadius(w, h);
      return { x: side === LEFT ? 0 : w, y: h * 0.72 - r };
    }
    const v = edgeValue(seed, key);
    if (side === LEFT) return { x: 0, y: h * v };
    if (side === RIGHT) return { x: w, y: h * v };
    if (side === TOP) return { x: w * v, y: 0 };
    return { x: w * v, y: h };
  }

  function finalPoint(seed, stage, entry, w, h) {
    return {
      x: w * (0.28 + 0.44 * seedUnit(seed, stage, 31)),
      y: h * (0.26 + 0.38 * seedUnit(seed, stage, 47)),
      side: -1,
    };
  }

  function inward(side) {
    return { x: side === LEFT ? 1 : side === RIGHT ? -1 : 0, y: side === TOP ? 1 : side === BOTTOM ? -1 : 0 };
  }

  function bezier(a, b, c, d, u) {
    const v = 1 - u, v2 = v * v, u2 = u * u;
    return {
      x: a.x * v2 * v + 3 * b.x * v2 * u + 3 * c.x * v * u2 + d.x * u2 * u,
      y: a.y * v2 * v + 3 * b.y * v2 * u + 3 * c.y * v * u2 + d.y * u2 * u,
    };
  }

  function firstPoint(u, rainbow, offset = 0) {
    const w = rainbow.w, h = rainbow.h, r = firstRadius(w, h) - offset, cy = h * 0.72;
    if (rainbow.exit === RIGHT) {
      const a = Math.PI + Math.PI / 2 * u;
      return { x: w + Math.cos(a) * r, y: cy + Math.sin(a) * r };
    }
    const a = -Math.PI / 2 * u;
    return { x: Math.cos(a) * r, y: cy + Math.sin(a) * r };
  }

  function centerPoint(stage, u, rainbow) {
    const w = rainbow.w, h = rainbow.h, seed = rainbow.seed >>> 0, g = seedGenes(seed);
    if (stage === 1) return firstPoint(u, rainbow);
    const start = edgePoint(seed, rainbow.entry, stage - 1, w, h);
    let end, endSide = rainbow.exit;
    if (rainbow.exit < 0) {
      end = finalPoint(seed, stage, rainbow.entry, w, h);
      endSide = end.side;
    } else {
      end = edgePoint(seed, rainbow.exit, stage, w, h);
    }
    const n0 = inward(rainbow.entry);
    let n1;
    if (endSide >= 0) n1 = inward(endSide);
    else {
      const dx = start.x - end.x, dy = start.y - end.y, l = Math.hypot(dx, dy) || 1;
      n1 = { x: dx / l, y: dy / l };
    }
    const m = Math.min(w, h);
    const bend = m * (0.24 + 0.34 * g.bend + 0.05 * seedUnit(seed, stage, 13));
    const c1 = { x: start.x + n0.x * bend, y: start.y + n0.y * bend };
    const c2 = { x: end.x + n1.x * bend, y: end.y + n1.y * bend };
    const p = bezier(start, c1, c2, end, u);
    const e = Math.sin(Math.PI * u);
    const amp = m * (0.002 + 0.05 * g.twist);
    const phase = seedUnit(seed, stage, 19) * Math.PI * 2;
    const freq = 1 + Math.floor(g.twist * 4 + seedUnit(seed, stage, 23) * 2);
    const q0 = bezier(start, c1, c2, end, Math.max(0, u - 0.003));
    const q1 = bezier(start, c1, c2, end, Math.min(1, u + 0.003));
    const dx = q1.x - q0.x, dy = q1.y - q0.y, l = Math.hypot(dx, dy) || 1;
    const wiggle = e * amp * Math.sin(u * Math.PI * 2 * freq + phase);
    return { x: p.x - dy / l * wiggle, y: p.y + dx / l * wiggle };
  }

  function rainbowSpread(stage, u, rainbow) {
    if (stage === 1) return 1;
    const seed = rainbow.seed >>> 0, g = seedGenes(seed);
    const e = Math.sin(Math.PI * u), phase = seedUnit(seed, stage, 331) * Math.PI * 2;
    const weird = (g.bend + g.twist + g.turn) / 3;
    const wave = Math.sin(u * Math.PI * 2 * (1 + Math.floor(weird * 3)) + phase) + .45 * Math.sin(u * Math.PI * 4 + phase * .37);
    return Math.max(.6, Math.min(2.6, 1 + .75 * g.twist * e + e * (.03 + .12 * g.width + 1.05 * weird) * wave));
  }

  function rainbowPoint(stage, u, rainbow, offset = 0) {
    if (stage === 1) return firstPoint(u, rainbow, offset);
    const p = centerPoint(stage, u, rainbow);
    if (!offset) return p;
    offset *= rainbowSpread(stage, u, rainbow);
    const seed = rainbow.seed >>> 0;
    const sign = firstExit(seed) === LEFT ? -1 : 1;
    let dx, dy;
    if (u === 0) ({ x: dx, y: dy } = inward(rainbow.entry));
    else if (u === 1 && rainbow.exit >= 0) { ({ x: dx, y: dy } = inward(rainbow.exit)); dx = -dx; dy = -dy; }
    else {
      const a = centerPoint(stage, Math.max(0, u - 0.002), rainbow);
      const b = centerPoint(stage, Math.min(1, u + 0.002), rainbow);
      dx = b.x - a.x; dy = b.y - a.y;
    }
    const l = Math.hypot(dx, dy) || 1;
    const nx = -dy / l * sign, ny = dx / l * sign;
    return { x: p.x + nx * offset, y: p.y + ny * offset };
  }

  function rainbowBand(stage, index, band, seed = 0) {
    if (stage === 1) return { width: band, offset: index * band * 0.90 };
    const g = seedGenes(seed), n = seedUnit(seed, index, 101) * 2 - 1;
    const factor = (0.82 + 0.36 * g.width) * (1 + n * (0.03 + 0.24 * g.color));
    return { width: band * Math.max(.95, factor), offset: index * band * 0.90 };
  }

  globalThis.RainbowLogic = Object.freeze({
    CLEAR_PERCENT, MIN_STAGE, MAX_STAGE, BASE_STAGE_COUNT, MAX_STAGE_BONUS, FIRST_SECTION_COUNT, MAX_SECTION_COUNT,
    SECONDS_PER_SECTION, MIN_STAGE_TIME, MAX_CLEAN_BONUS, CLEANER_LEVEL_STEP, MAX_CLEANER_LEVEL,
    CLEANER_RADIUS, CLEANER_RADIUS_STEP, CLEANER_PUSH, CLEANER_PUSH_STEP,
    LEFT, RIGHT, TOP, BOTTOM,
    distancePointToSegment, revealPercent, isClearedPercent, isRainbowConnected, markRevealPoints,
    seedHash, seedMix, seedUnit, seedGenes, seedFromGenes, worldLength, seedStageLimit, stageSectionCount,
    cleanerLevel, cleanerRadius, cleanerPush, stageBaseTime, cleanTimeBonus, nextStageTime, stageScore,
    oppositeSide, routeStep, firstExit, routeExit, finalPoint, rainbowSpread, rainbowPoint, rainbowBand,
  });
})();
if(typeof document!='undefined'){let b=document.querySelector('.seedbar'),t=document.querySelector('.title'),s=document.createElement('span'),h=()=>b.style.display='none';b.style.display='none';t.style.pointerEvents='auto';s.textContent=' 🌱';s.style.cursor='pointer';s.onclick=()=>b.style.display=b.style.display?'':'none';t.append(s);document.querySelector('#seedGo').addEventListener('click',h);document.querySelector('#seed').addEventListener('keydown',e=>e.key==='Enter'&&h())}
if(typeof document!='undefined')(()=>{const T={ja:['もっと先にいるよ！','虹をたどって僕を見つけて！','セクションクリア！','ゴール！','時間切れ！','次のステージ','開始','再開'],en:["I'm farther ahead!",'Follow the rainbow and find me!','SECTION CLEAR!','GOAL!','TIME UP!','Next Stage','Start','Restart']},K=Object.keys(T),M={'もっと先にいるよ！':0,"I'm farther ahead!":0,'虹をたどって僕を見つけて！':1,'Follow the rainbow and find me!':1,'SECTION CLEAR!':2,'セクションクリア！':2,'GOAL!':3,'ゴール！':3,'TIME UP!':4,'時間切れ！':4,'Next Stage':5,'次のステージ':5,'Start':6,'開始':6,'Restart':7,'再開':7},E=[document.querySelector('#clearText'),document.querySelector('#next'),document.querySelector('#reset')],t=document.querySelector('.title'),s=document.createElement('span');let L=(navigator.languages||[navigator.language]).map(x=>x.slice(0,2)).find(x=>T[x])||'en';function f(){document.documentElement.lang=L;let z=' '+L.toUpperCase();if(s.textContent!==z)s.textContent=z;for(const e of E){let v=e.textContent,m=v.match(/^(?:Stage|ステージ) (\d+) (?:CLEAR|クリア) - (\d+) (?:Sections|セクション)$/);if(m)v=L==='ja'?`ステージ ${m[1]} クリア - ${m[2]} セクション`:`Stage ${m[1]} CLEAR - ${m[2]} Sections`;else{let i=M[v];if(i!=null)v=T[L][i]}if(e.textContent!==v)e.textContent=v}}new MutationObserver(f).observe(document.body,{childList:true,characterData:true,subtree:true});s.style.cursor='pointer';s.onclick=()=>{L=K[(K.indexOf(L)+1)%K.length];f()};t.append(s);f()})()

(() => {
  const CLEAR_PERCENT = 90;
  const MIN_STAGE = 4, MAX_STAGE = 32;
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
    const r = code / 31;
    return Math.min(MAX_STAGE, MIN_STAGE + Math.floor(r * r * r * (MAX_STAGE - MIN_STAGE + 1)));
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
    const wanted = clamp(g.length ?? 12, MIN_STAGE, MAX_STAGE);
    let lc = 0, best = 1e9;
    for (let i = 0; i < 32; i++) {
      const d = Math.abs(lengthFromCode(i) - wanted);
      if (d < best) { best = d; lc = i; }
    }
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

  function routeExit(seed, stage, entry, x = 0, y = 0) {
    const r = seedUnit(seed, stage, x * 37 + y * 101, entry + 503);
    const forward = 0.84 - 0.34 * seedGenes(seed).turn;
    if (r < forward) return oppositeSide(entry);
    if (entry < 2) return r < (1 + forward) / 2 ? TOP : BOTTOM;
    return r < (1 + forward) / 2 ? LEFT : RIGHT;
  }

  function firstRadius(w, h) {
    return Math.min(w * 0.62, h * 0.34);
  }

  function edgeValue(seed, key) {
    const g = seedGenes(seed);
    return 0.34 + (0.32 + 0.12 * g.bend) * seedUnit(seed, key, 701);
  }

  function edgePoint(seed, side, key, w, h) {
    if (key === 1 && side < 2) {
      const r = firstRadius(w, h);
      return { x: side === LEFT ? 0 : w, y: h - r };
    }
    const v = edgeValue(seed, key);
    if (side === LEFT) return { x: 0, y: h * v };
    if (side === RIGHT) return { x: w, y: h * v };
    if (side === TOP) return { x: w * v, y: 0 };
    return { x: w * v, y: h };
  }

  function finalPoint(seed, stage, entry, w, h) {
    const r = seedUnit(seed, stage, 997, entry);
    if (r < 0.36) {
      const p = edgePoint(seed, BOTTOM, stage + 409, w, h);
      return { x: p.x, y: p.y, side: BOTTOM };
    }
    if (r < 0.60) {
      let side = seedUnit(seed, stage, 1009, entry) < 0.5 ? LEFT : RIGHT;
      if (side === entry) side = oppositeSide(side);
      const p = edgePoint(seed, side, stage + 419, w, h);
      return { x: p.x, y: p.y, side };
    }
    return {
      x: w * (0.30 + 0.40 * seedUnit(seed, stage, 31)),
      y: h * (0.30 + 0.40 * seedUnit(seed, stage, 47)),
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
    const w = rainbow.w, h = rainbow.h, r = firstRadius(w, h) - offset;
    if (rainbow.exit === RIGHT) {
      const a = Math.PI + Math.PI / 2 * u;
      return { x: w + Math.cos(a) * r, y: h + Math.sin(a) * r };
    }
    const a = -Math.PI / 2 * u;
    return { x: Math.cos(a) * r, y: h + Math.sin(a) * r };
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
    const bend = m * (0.27 + 0.20 * g.bend + 0.05 * seedUnit(seed, stage, 13));
    const c1 = { x: start.x + n0.x * bend, y: start.y + n0.y * bend };
    const c2 = { x: end.x + n1.x * bend, y: end.y + n1.y * bend };
    const p = bezier(start, c1, c2, end, u);
    const e = Math.sin(Math.PI * u);
    const amp = m * (0.002 + 0.024 * g.twist);
    const phase = seedUnit(seed, stage, 19) * Math.PI * 2;
    const freq = 1 + Math.floor(g.twist * 2 + seedUnit(seed, stage, 23) * 1.5);
    const q0 = bezier(start, c1, c2, end, Math.max(0, u - 0.003));
    const q1 = bezier(start, c1, c2, end, Math.min(1, u + 0.003));
    const dx = q1.x - q0.x, dy = q1.y - q0.y, l = Math.hypot(dx, dy) || 1;
    const wiggle = e * amp * Math.sin(u * Math.PI * 2 * freq + phase);
    return { x: p.x - dy / l * wiggle, y: p.y + dx / l * wiggle };
  }

  function rainbowPoint(stage, u, rainbow, offset = 0) {
    if (stage === 1) return firstPoint(u, rainbow, offset);
    const p = centerPoint(stage, u, rainbow);
    if (!offset) return p;
    const g = seedGenes(rainbow.seed >>> 0);
    const e = Math.sin(Math.PI * u), phase = seedUnit(rainbow.seed >>> 0, stage, 331) * Math.PI * 2;
    offset = offset * (1 + e * (0.03 + 0.28 * g.width) * Math.sin(u * Math.PI * 2 + phase)) +
      e * Math.min(rainbow.w, rainbow.h) * (0.001 + 0.012 * g.twist) * Math.sin(u * Math.PI * 2 + phase + offset * 0.11);
    const a = centerPoint(stage, Math.max(0, u - 0.002), rainbow);
    const b = centerPoint(stage, Math.min(1, u + 0.002), rainbow);
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    let nx = -dy / l, ny = dx / l, side = -1, k = 0;
    if (u < 0.12) { side = rainbow.entry; k = 1 - u / 0.12; }
    else if (u > 0.88 && rainbow.exit >= 0) { side = rainbow.exit; k = (u - 0.88) / 0.12; }
    if (side >= 0) {
      const ex = side < 2 ? 0 : 1, ey = side < 2 ? 1 : 0;
      if (nx * ex + ny * ey < 0) { nx = -nx; ny = -ny; }
      nx = nx * (1 - k) + ex * k;
      ny = ny * (1 - k) + ey * k;
      const q = Math.hypot(nx, ny) || 1;
      nx /= q; ny /= q;
    }
    return { x: p.x + nx * offset, y: p.y + ny * offset };
  }

  function rainbowBand(stage, index, band, seed = 0) {
    if (stage === 1) return { width: band, offset: index * band * 0.90 };
    const g = seedGenes(seed), n = seedUnit(seed, index, 101) * 2 - 1;
    const width = band * (0.82 + 0.36 * g.width) * (1 + n * (0.03 + 0.24 * g.color));
    return { width, offset: index * band * 0.90 };
  }

  globalThis.RainbowLogic = Object.freeze({
    CLEAR_PERCENT, MIN_STAGE, MAX_STAGE, LEFT, RIGHT, TOP, BOTTOM,
    distancePointToSegment, revealPercent, isClearedPercent, markRevealPoints,
    seedHash, seedMix, seedUnit, seedGenes, seedFromGenes, worldLength,
    oppositeSide, routeStep, routeExit, finalPoint, rainbowPoint, rainbowBand,
  });
})();

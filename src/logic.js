(() => {
  const CLEAR_PERCENT = 90;
  const MAX_STAGE = 8;
  const LEFT = 0, RIGHT = 1, TOP = 2, BOTTOM = 3;

  function distancePointToSegment(px, py, a, b) {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const lengthSquared = vx * vx + vy * vy;
    if (!lengthSquared) return Math.hypot(px - a.x, py - a.y);
    const u = Math.max(0, Math.min(1, ((px - a.x) * vx + (py - a.y) * vy) / lengthSquared));
    return Math.hypot(px - a.x - vx * u, py - a.y - vy * u);
  }

  function revealPercent(revealed, total) {
    if (total <= 0) return 0;
    return Math.floor((revealed / total) * 100);
  }

  function isClearedPercent(percent, threshold = CLEAR_PERCENT) {
    return percent >= threshold;
  }

  function markRevealPoints(points, a, b, radius) {
    let added = 0;
    for (const point of points) {
      if (point.hit) continue;
      if (distancePointToSegment(point.x, point.y, a, b) < radius) {
        point.hit = 1;
        added++;
      }
    }
    return added;
  }

  function oppositeSide(side) {
    return side ^ 1;
  }

  function routeStep(side) {
    return {
      x: side === LEFT ? -1 : side === RIGHT ? 1 : 0,
      y: side === TOP ? -1 : side === BOTTOM ? 1 : 0,
    };
  }

  function routeExit(stage, entry) {
    if (stage === 1) return RIGHT;
    return (entry + (stage * 5) % 4) % 4;
  }

  function edgeValue(key) {
    if (key === 1) return 0.78;
    const n = Math.sin((key + 1) * 12.9898) * 43758.5453;
    return 0.24 + 0.52 * (n - Math.floor(n));
  }

  function edgePoint(side, key, w, h) {
    const v = edgeValue(key);
    if (side === LEFT) return { x: 0, y: h * v };
    if (side === RIGHT) return { x: w, y: h * v };
    if (side === TOP) return { x: w * v, y: 0 };
    return { x: w * v, y: h };
  }

  function inward(side) {
    return {
      x: side === LEFT ? 1 : side === RIGHT ? -1 : 0,
      y: side === TOP ? 1 : side === BOTTOM ? -1 : 0,
    };
  }

  function bezier(a, b, c, d, u) {
    const v = 1 - u, v2 = v * v, u2 = u * u;
    return {
      x: a.x * v2 * v + 3 * b.x * v2 * u + 3 * c.x * v * u2 + d.x * u2 * u,
      y: a.y * v2 * v + 3 * b.y * v2 * u + 3 * c.y * v * u2 + d.y * u2 * u,
    };
  }

  function centerPoint(stage, u, rainbow) {
    const w = rainbow.w, h = rainbow.h;
    if (stage === 1) {
      const a = Math.PI + Math.PI * u;
      const r = w * 0.5;
      return { x: w * 0.5 + Math.cos(a) * r, y: h * 0.78 + Math.sin(a) * r };
    }
    const start = edgePoint(rainbow.entry, stage - 1, w, h);
    let end;
    if (rainbow.exit < 0) {
      end = {
        x: w * (0.34 + 0.30 * edgeValue(stage + 4)),
        y: h * (0.34 + 0.30 * edgeValue(stage + 9)),
      };
    } else {
      end = edgePoint(rainbow.exit, stage, w, h);
    }

    const n0 = inward(rainbow.entry);
    let n1;
    if (rainbow.exit < 0) {
      const dx = start.x - end.x, dy = start.y - end.y, l = Math.hypot(dx, dy) || 1;
      n1 = { x: dx / l, y: dy / l };
    } else {
      n1 = inward(rainbow.exit);
    }

    const m = Math.min(w, h);
    const bend = m * (0.34 + 0.10 * edgeValue(stage + 2));
    const c1 = { x: start.x + n0.x * bend, y: start.y + n0.y * bend };
    const c2 = { x: end.x + n1.x * bend, y: end.y + n1.y * bend };
    let p = bezier(start, c1, c2, end, u);

    if (stage > 1) {
      const e = Math.sin(Math.PI * u);
      const amp = m * (0.022 + Math.min(stage, MAX_STAGE) * 0.004);
      const phase = stage * 1.37;
      const freq = 1 + (stage % 3);
      const q0 = bezier(start, c1, c2, end, Math.max(0, u - 0.003));
      const q1 = bezier(start, c1, c2, end, Math.min(1, u + 0.003));
      const dx = q1.x - q0.x, dy = q1.y - q0.y, l = Math.hypot(dx, dy) || 1;
      const wiggle = e * amp * (
        0.72 * Math.sin(u * Math.PI * 2 * freq + phase) +
        0.28 * Math.sin(u * Math.PI * 2 * (freq + 1) - phase * 0.7)
      );
      p = { x: p.x - dy / l * wiggle, y: p.y + dx / l * wiggle };
    }
    return p;
  }

  function rainbowPoint(stage, u, rainbow, offset = 0) {
    const p = centerPoint(stage, u, rainbow);
    if (!offset) return p;
    const a = centerPoint(stage, Math.max(0, u - 0.002), rainbow);
    const b = centerPoint(stage, Math.min(1, u + 0.002), rainbow);
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    return { x: p.x - dy / l * offset, y: p.y + dx / l * offset };
  }

  function rainbowBand(stage, index, band) {
    if (stage === 1) return { width: band, offset: index * band * 0.92 };
    const wave = 0.5 + 0.5 * Math.sin(stage * 1.17 + index * 1.71);
    const width = band * (0.62 + 0.52 * wave);
    const spacing = band * (0.72 + 0.13 * Math.sin(stage * 0.83));
    const offset = index * spacing + band * 0.10 * (
      Math.sin(stage * 0.61 + index * 1.37) - Math.sin(stage * 0.61)
    );
    return { width, offset };
  }

  globalThis.RainbowLogic = Object.freeze({
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
  });
})();

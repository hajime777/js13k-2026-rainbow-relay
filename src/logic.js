(() => {
  const CLEAR_PERCENT = 90;

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

  function rainbowPoint(stage, u, rainbow, offset = 0) {
    const angle = rainbow.a0 + (rainbow.a1 - rainbow.a0) * u;
    const radius = rainbow.base - offset;

    if (stage === 1) {
      return {
        x: rainbow.cx + Math.cos(angle) * radius,
        y: rainbow.cy + Math.sin(angle) * radius,
      };
    }

    const h = rainbow.cy / 0.92;
    const phase = stage * 1.618;
    const mode = (stage - 2) % 6;

    if (mode === 0) {
      const strength = Math.min(1, (stage - 1) * 0.25);
      const waves = 2 + (stage % 4);
      const warpedRadius = radius + rainbow.base * strength * (
        0.055 * Math.sin(u * Math.PI * 2 * waves + phase) +
        0.025 * Math.sin(u * Math.PI * 2 * (waves + 1) - phase * 0.7)
      );
      return {
        x: rainbow.cx + Math.cos(angle) * warpedRadius + rainbow.base * strength * 0.05 * Math.sin(u * Math.PI * 2 + phase * 0.45),
        y: rainbow.cy + Math.sin(angle) * warpedRadius + rainbow.base * strength * 0.045 * Math.sin(u * Math.PI * 3 - phase * 0.33),
      };
    }

    if (mode === 1) {
      const cy = h * 0.08;
      return {
        x: rainbow.cx + Math.cos(angle) * radius,
        y: cy - Math.sin(angle) * radius,
      };
    }

    if (mode === 2) {
      return {
        x: rainbow.cx + (u - 0.5) * rainbow.base * 2.15,
        y: h * 0.52 - offset,
      };
    }

    if (mode === 3) {
      return {
        x: rainbow.cx + (u - 0.5) * rainbow.base * 1.9,
        y: h * 0.5 + Math.sin((u - 0.5) * Math.PI * 2) * rainbow.base * 0.24 - offset,
      };
    }

    if (mode === 4) {
      return {
        x: rainbow.cx + (u - 0.5) * rainbow.base * 1.85,
        y: h * (0.25 + u * 0.5) + Math.sin(u * Math.PI * 4 + phase) * rainbow.base * 0.055 - offset,
      };
    }

    const a = (u - 0.5) * Math.PI * 1.45;
    const r = rainbow.base * 0.58 - offset;
    return {
      x: rainbow.cx + Math.sin(a) * r,
      y: h * 0.5 - Math.cos(a) * r,
    };
  }

  function rainbowBand(stage, index, band) {
    if (stage === 1) return { width: band, offset: index * band * 0.92 };

    const wave = 0.5 + 0.5 * Math.sin(stage * 1.17 + index * 1.71);
    const width = band * (0.66 + 0.42 * wave);
    const spacing = band * (0.76 + 0.08 * Math.sin(stage * 0.83));
    const offset = index * spacing + band * 0.08 * (
      Math.sin(stage * 0.61 + index * 1.37) - Math.sin(stage * 0.61)
    );

    return { width, offset };
  }

  globalThis.RainbowLogic = Object.freeze({
    CLEAR_PERCENT,
    distancePointToSegment,
    revealPercent,
    isClearedPercent,
    markRevealPoints,
    rainbowPoint,
    rainbowBand,
  });
})();

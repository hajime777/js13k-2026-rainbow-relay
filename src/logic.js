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
    let radius = rainbow.base - offset;
    let x = 0;
    let y = 0;

    if (stage > 1) {
      const strength = Math.min(1, (stage - 1) * 0.25);
      const phase = stage * 1.618;
      const waves = 2 + (stage % 4);

      radius += rainbow.base * strength * (
        0.055 * Math.sin(u * Math.PI * 2 * waves + phase) +
        0.025 * Math.sin(u * Math.PI * 2 * (waves + 1) - phase * 0.7)
      );
      x = rainbow.base * strength * 0.05 * Math.sin(u * Math.PI * 2 + phase * 0.45);
      y = rainbow.base * strength * 0.045 * Math.sin(u * Math.PI * 3 - phase * 0.33);
    }

    return {
      x: rainbow.cx + Math.cos(angle) * radius + x,
      y: rainbow.cy + Math.sin(angle) * radius + y,
    };
  }

  globalThis.RainbowLogic = Object.freeze({
    CLEAR_PERCENT,
    distancePointToSegment,
    revealPercent,
    isClearedPercent,
    markRevealPoints,
    rainbowPoint,
  });
})();

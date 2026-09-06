(() => {
  const CLEAR_PERCENT = 62;

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

  globalThis.RainbowLogic = Object.freeze({
    CLEAR_PERCENT,
    distancePointToSegment,
    revealPercent,
    isClearedPercent,
    markRevealPoints,
  });
})();

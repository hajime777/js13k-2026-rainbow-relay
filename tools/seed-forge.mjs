import '../src/logic.js';

const {
  seedFromGenes, seedGenes, worldLength,
  firstExit, routeExit, routeStep, oppositeSide, rainbowPoint,
  LEFT, RIGHT, BOTTOM,
} = globalThis.RainbowLogic;

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const key = process.argv[i];
  if (!key.startsWith('--')) continue;
  const next = process.argv[i + 1];
  args[key.slice(2)] = next && !next.startsWith('--') ? process.argv[++i] : '1';
}

const level = value => {
  if (value == null) return undefined;
  const key = String(value).toLowerCase();
  if (key === 'low') return .2;
  if (key === 'mid' || key === 'medium') return .5;
  if (key === 'high') return .85;
  if (key === 'max') return 1;
  return Number(value);
};

function lengthRange(value) {
  const p = String(value).split(':').map(Number);
  return p.length > 1 ? p : [p[0], p[0]];
}

const profile = String(args.profile || 'weird').toLowerCase();
const phenotypeProfile = profile === 'classic' || profile === 'skyward';
const defaultLength = profile === 'classic' ? '8' : profile === 'skyward' ? '8:12' : '12:20';
const [lo, hi] = lengthRange(args.length || defaultLength);
const count = Math.max(1, Math.min(32, Number(args.count) || 8));
const samples = phenotypeProfile ? 32 : count;
const defaults = profile === 'classic'
  ? { bend: .25, width: .15, twist: .05, color: .08, turn: .65, branch: 0 }
  : profile === 'skyward'
    ? { bend: .4, width: .35, twist: .25, color: .2, turn: .78, branch: 0 }
    : { bend: .75, width: .8, twist: .85, color: .8, turn: .55, branch: .5 };
const target = {
  bend: level(args.bend) ?? defaults.bend,
  width: level(args.width) ?? defaults.width,
  twist: level(args.twist) ?? defaults.twist,
  color: level(args.color) ?? defaults.color,
  turn: level(args.turn) ?? defaults.turn,
  branch: level(args.branch) ?? defaults.branch,
};

function trace(seed) {
  const count = worldLength(seed), stages = [];
  let x = 0, y = 0, entry = BOTTOM;
  let exit = firstExit(seed);
  let turns = 0, revisits = 0;
  const seen = new Set(['0,0']);
  for (let stage = 1; stage <= count; stage++) {
    if (stage === count) exit = -1;
    stages.push({ stage, x, y, entry, exit });
    if (stage === count) break;
    const step = routeStep(exit);
    x += step.x;
    y += step.y;
    const key = `${x},${y}`;
    if (seen.has(key)) revisits++;
    seen.add(key);
    entry = oppositeSide(exit);
    const next = stage + 1 === count ? -1 : routeExit(seed, stage + 1, entry, x, y);
    if (next >= 0 && next !== oppositeSide(entry)) turns++;
    exit = next;
  }
  return { turns, revisits, stages };
}

function sampleWorld(seed, r) {
  const w = 100, h = 200, points = [];
  let finalLocal = null;
  for (const s of r.stages) {
    const scene = { w, h, entry: s.entry, exit: s.exit, seed };
    for (let i = 0; i <= 8; i++) {
      const p = rainbowPoint(s.stage, i / 8, scene, 0);
      points.push({ x: s.x * w + p.x, y: s.y * h + p.y });
      if (s.stage === r.stages.length && i === 8) finalLocal = p;
    }
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  return { w, h, points, start: points[0], end: points.at(-1), finalLocal, minX, maxX, minY, maxY };
}

function godScore(seed, r) {
  const g = seedGenes(seed);
  const score = 22 * g.twist + 19 * g.width + 19 * g.color + 14 * g.bend + 12 * g.turn +
    Math.min(14, r.turns * 2 + r.revisits * 5);
  return Math.min(100, Math.round(score * 10) / 10);
}

function classicScore(seed, r) {
  const q = sampleWorld(seed, r), { h, start, end, finalLocal, minX, maxX, minY, maxY } = q;
  const ground = Math.abs(finalLocal.y - h) < 1e-7 && Math.abs(end.y - start.y) < 1e-7;
  const rise = Math.max(0, (start.y - minY) / h);
  const span = (maxX - minX) / q.w;
  const apart = Math.abs(end.x - start.x) / q.w;
  const below = Math.max(0, (maxY - start.y) / h);
  let score = ground ? 58 : Math.max(0, 22 - Math.abs(end.y - start.y) / h * 18);
  score += Math.min(14, rise * 7);
  score += Math.min(10, span * 2.5);
  score += Math.min(8, apart * 2.5);
  score += Math.max(0, 6 - r.revisits * 3);
  score += Math.max(0, 4 - Math.abs(r.turns - 3));
  score -= Math.min(12, below * 12);
  return { score: Math.max(0, Math.min(100, Math.round(score * 10) / 10)), ground, rise: +rise.toFixed(2), span: +span.toFixed(2) };
}

function skywardScore(seed, r) {
  const q = sampleWorld(seed, r), { h, start, end, minY, maxY } = q;
  const climb = (start.y - end.y) / h;
  const peak = Math.max(0, (start.y - minY) / h);
  const below = Math.max(0, (maxY - start.y) / h);
  let rising = 0, falling = 0;
  for (let i = 1; i < q.points.length; i++) {
    const dy = q.points[i].y - q.points[i - 1].y;
    if (dy < -1) rising++;
    else if (dy > 1) falling++;
  }
  const flow = rising / Math.max(1, rising + falling);
  let score = 24 + Math.max(0, climb) * 34 + Math.min(18, peak * 9) + flow * 14;
  score += Math.max(0, 8 - r.revisits * 2);
  score += Math.min(8, r.turns);
  score -= Math.max(0, -climb) * 28;
  score -= Math.min(14, below * 14);
  return {
    score: Math.max(0, Math.min(100, Math.round(score * 10) / 10)),
    climb: +climb.toFixed(2), peak: +peak.toFixed(2), flow: +flow.toFixed(2),
  };
}

const rows = [];
for (let i = 0; i < samples; i++) {
  const desiredLength = lo === hi ? lo : lo + (i % (hi - lo + 1));
  const detail = phenotypeProfile ? i : Math.floor(i * 32 / samples) & 31;
  const seed = seedFromGenes({ ...target, length: desiredLength, detail });
  const g = seedGenes(seed), r = trace(seed);
  const c = profile === 'classic' ? classicScore(seed, r) : profile === 'skyward' ? skywardScore(seed, r) : null;
  rows.push({
    seed,
    score: c ? c.score : godScore(seed, r),
    length: g.length,
    bend: +g.bend.toFixed(2),
    width: +g.width.toFixed(2),
    twist: +g.twist.toFixed(2),
    color: +g.color.toFixed(2),
    turn: +g.turn.toFixed(2),
    branch: +g.branch.toFixed(2),
    turns: r.turns,
    revisits: r.revisits,
    ...(c || {}),
  });
}

rows.sort((a, b) => b.score - a.score);
console.table(rows.slice(0, count));
if (profile === 'classic') {
  console.log('\nClassic is a phenotype score, not a shape gene. The forge ranked generated rainbows that happened to rise and return to the same ground line.');
} else if (profile === 'skyward') {
  console.log('\nSkyward is also a phenotype score, not a shape gene. The forge ranked generated rainbows by net upward climb, peak height and upward flow.');
} else {
  console.log('\nThe branch gene is encoded now, but real route branching is not implemented yet.');
}

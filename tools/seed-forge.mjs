import '../src/logic.js';

const {
  seedFromGenes, seedGenes, worldLength, seedUnit,
  routeExit, routeStep, oppositeSide, rainbowPoint,
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
const defaultLength = profile === 'classic' ? '8' : '12:20';
const [lo, hi] = lengthRange(args.length || defaultLength);
const count = Math.max(1, Math.min(32, Number(args.count) || 8));
const samples = profile === 'classic' ? 32 : count;
const defaults = profile === 'classic'
  ? { bend: .25, width: .15, twist: .05, color: .08, turn: .65, branch: 0 }
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
  let exit = seedUnit(seed, 0, 1) < .5 ? LEFT : RIGHT;
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

function godScore(seed, r) {
  const g = seedGenes(seed);
  const score = 22 * g.twist + 19 * g.width + 19 * g.color + 14 * g.bend + 12 * g.turn +
    Math.min(14, r.turns * 2 + r.revisits * 5);
  return Math.min(100, Math.round(score * 10) / 10);
}

function classicScore(seed, r) {
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
  const start = points[0], end = points.at(-1);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const ground = Math.abs(finalLocal.y - h) < 1e-7 && Math.abs(end.y - start.y) < 1e-7;
  const rise = Math.max(0, (start.y - minY) / h);
  const span = (maxX - minX) / w;
  const apart = Math.abs(end.x - start.x) / w;
  const below = Math.max(0, (maxY - start.y) / h);
  let score = ground ? 58 : Math.max(0, 22 - Math.abs(end.y - start.y) / h * 18);
  score += Math.min(14, rise * 7);
  score += Math.min(10, span * 2.5);
  score += Math.min(8, apart * 2.5);
  score += Math.max(0, 6 - r.revisits * 3);
  score += Math.max(0, 4 - Math.abs(r.turns - 3));
  score -= Math.min(12, below * 12);
  return {
    score: Math.max(0, Math.min(100, Math.round(score * 10) / 10)),
    ground, rise: +rise.toFixed(2), span: +span.toFixed(2),
  };
}

const rows = [];
for (let i = 0; i < samples; i++) {
  const desiredLength = lo === hi ? lo : lo + (i % (hi - lo + 1));
  const detail = profile === 'classic' ? i : Math.floor(i * 32 / samples) & 31;
  const seed = seedFromGenes({ ...target, length: desiredLength, detail });
  const g = seedGenes(seed), r = trace(seed);
  const c = profile === 'classic' ? classicScore(seed, r) : null;
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
    ...(c ? { ground: c.ground, rise: c.rise, span: c.span } : {}),
  });
}

rows.sort((a, b) => b.score - a.score);
console.table(rows.slice(0, count));
if (profile === 'classic') {
  console.log('\nClassic is a phenotype score, not a shape gene. The forge evaluated the 32 detail variants of one broad genome family and ranked the rainbows that happened to rise and return to the same ground line.');
} else {
  console.log('\nThe branch gene is encoded now, but real route branching is not implemented yet.');
}

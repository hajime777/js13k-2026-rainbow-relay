import '../src/logic.js';

const {
  seedFromGenes, seedGenes, worldLength, seedUnit,
  routeExit, routeStep, oppositeSide, LEFT, RIGHT, BOTTOM,
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

function lengthRange(value = '12:20') {
  const p = String(value).split(':').map(Number);
  return p.length > 1 ? p : [p[0], p[0]];
}

const [lo, hi] = lengthRange(args.length);
const count = Math.max(1, Math.min(32, Number(args.count) || 8));
const target = {
  bend: level(args.bend) ?? .75,
  width: level(args.width) ?? .8,
  twist: level(args.twist) ?? .85,
  color: level(args.color) ?? .8,
  turn: level(args.turn) ?? .55,
  branch: level(args.branch) ?? .5,
};

function trace(seed) {
  const count = worldLength(seed);
  let x = 0, y = 0, entry = BOTTOM;
  let exit = seedUnit(seed, 0, 1) < .5 ? LEFT : RIGHT;
  let turns = 0, revisits = 0;
  const seen = new Set(['0,0']);
  for (let stage = 1; stage < count; stage++) {
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
  return { turns, revisits };
}

function godScore(seed) {
  const g = seedGenes(seed), r = trace(seed);
  const score = 22 * g.twist + 19 * g.width + 19 * g.color + 14 * g.bend + 12 * g.turn +
    Math.min(14, r.turns * 2 + r.revisits * 5);
  return Math.min(100, Math.round(score * 10) / 10);
}

const rows = [];
for (let i = 0; i < count; i++) {
  const desiredLength = lo === hi ? lo : lo + (i % (hi - lo + 1));
  const detail = Math.floor(i * 32 / count) & 31;
  const seed = seedFromGenes({ ...target, length: desiredLength, detail });
  const g = seedGenes(seed), r = trace(seed);
  rows.push({
    seed,
    score: godScore(seed),
    length: g.length,
    bend: +g.bend.toFixed(2),
    width: +g.width.toFixed(2),
    twist: +g.twist.toFixed(2),
    color: +g.color.toFixed(2),
    turn: +g.turn.toFixed(2),
    branch: +g.branch.toFixed(2),
    turns: r.turns,
    revisits: r.revisits,
  });
}

rows.sort((a, b) => b.score - a.score);
console.table(rows);
console.log('\nThe branch gene is encoded now, but real route branching is not implemented yet.');

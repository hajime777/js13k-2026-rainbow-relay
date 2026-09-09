import '../src/logic.js';

const { worldLength } = globalThis.RainbowLogic;
const wanted = Number(process.argv[2] || 8);
const count = Math.max(1, Math.min(32, Number(process.argv[3]) || 8));

let code = -1;
for (let i = 0; i < 32; i++) {
  const seed = (i << 27) >>> 0;
  if (worldLength(seed) === wanted) { code = i; break; }
}

if (code < 0) {
  console.error(`No exact ${wanted}-screen seed exists with the current length encoding.`);
  process.exit(1);
}

console.log(`${wanted} screens (${count} seeds):`);
for (let i = 0; i < count; i++) {
  const lower = (Math.imul(i + 1, 0x9e3779b1) >>> 0) & 0x07ffffff;
  const seed = (((code << 27) >>> 0) | lower) >>> 0;
  const actual = worldLength(seed);
  if (actual !== wanted) throw new Error(`${seed}: expected ${wanted}, got ${actual}`);
  console.log(seed);
}

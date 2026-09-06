import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'html-minifier-terser';
import { strToU8, zipSync } from 'fflate';

const LIMIT = 13_312;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcPath = path.join(root, 'src', 'index.html');
const distDir = path.join(root, 'dist');
const htmlPath = path.join(distDir, 'index.html');
const zipPath = path.join(distDir, 'game.zip');

const source = fs.readFileSync(srcPath, 'utf8');

const output = await minify(source, {
  collapseWhitespace: true,
  conservativeCollapse: false,
  removeComments: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true,
  removeOptionalTags: false,
  removeRedundantAttributes: true,
  sortAttributes: true,
  sortClassName: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
});

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(htmlPath, output);

const zip = zipSync(
  { 'index.html': strToU8(output) },
  { level: 9 },
);
fs.writeFileSync(zipPath, zip);

const sourceBytes = Buffer.byteLength(source);
const htmlBytes = Buffer.byteLength(output);
const zipBytes = zip.length;
const remaining = LIMIT - zipBytes;
const percent = ((zipBytes / LIMIT) * 100).toFixed(1);

console.log('\n=== js13k build report ===');
console.log(`source html : ${sourceBytes.toLocaleString()} bytes`);
console.log(`minified    : ${htmlBytes.toLocaleString()} bytes`);
console.log(`game.zip    : ${zipBytes.toLocaleString()} / ${LIMIT.toLocaleString()} bytes (${percent}%)`);
console.log(remaining >= 0
  ? `remaining   : ${remaining.toLocaleString()} bytes`
  : `OVER        : ${(-remaining).toLocaleString()} bytes`);
console.log(`output      : ${path.relative(root, zipPath)}`);

if (zipBytes > LIMIT) {
  process.exitCode = 1;
}

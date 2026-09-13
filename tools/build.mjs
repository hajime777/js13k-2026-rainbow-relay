import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'html-minifier-terser';
import { strToU8, zipSync } from 'fflate';

const LIMIT = 13_312;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcPath = path.join(root, 'src', 'index.html');
const logicPath = path.join(root, 'src', 'logic.js');
const compatPath = path.join(root, 'src', 'compat.js');
const distDir = path.join(root, 'dist');
const htmlPath = path.join(distDir, 'index.html');
const zipPath = path.join(distDir, 'game.zip');

const htmlSource = fs.readFileSync(srcPath, 'utf8');
const logicSource = fs.readFileSync(logicPath, 'utf8');
const compatSource = fs.readFileSync(compatPath, 'utf8');
const version = compatSource.match(/\b(v\d+(?:\.\d+)+) Seed\b/)?.[1] ?? 'unknown';
const source = htmlSource.replace(
  '<script src="./logic.js"></script>',
  `<script>${logicSource}\n${compatSource}</script>`,
);

if (source === htmlSource) {
  throw new Error('Could not inline src/logic.js: script tag not found in src/index.html');
}

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

const sourceHtmlBytes = Buffer.byteLength(htmlSource);
const sourceLogicBytes = Buffer.byteLength(logicSource) + Buffer.byteLength(compatSource);
const htmlBytes = Buffer.byteLength(output);
const zipBytes = zip.length;
const remaining = LIMIT - zipBytes;
const percent = ((zipBytes / LIMIT) * 100).toFixed(1);

console.log('\n=== js13k build report ===');
console.log(`version     : ${version}`);
console.log(`source html : ${sourceHtmlBytes.toLocaleString()} bytes`);
console.log(`source logic: ${sourceLogicBytes.toLocaleString()} bytes`);
console.log(`minified    : ${htmlBytes.toLocaleString()} bytes`);
console.log(`game.zip    : ${zipBytes.toLocaleString()} / ${LIMIT.toLocaleString()} bytes (${percent}%)`);

if (remaining >= 0) {
  console.log(`remaining   : ${remaining.toLocaleString()} bytes`);
} else {
  console.warn(`WARNING     : OVER BY ${(-remaining).toLocaleString()} bytes`);
}

console.log(`output      : ${path.relative(root, zipPath)}`);

// The app icons, drawn rather than stored.
//
// Chromium will not offer to install a page unless the manifest names PNG icons at 192 and
// 512 pixels, so an SVG the way the favicon in src/index.html is written cannot serve here.
// A PNG is opaque to review: nobody can read a binary blob and say whether it is still the
// same mark as the favicon, and nobody can regenerate one from a description. So the mark is
// defined here as geometry, the bytes are produced from it, and test/app-icons.test.js
// compares the committed pixels against a fresh run. That makes the committed files a build
// output with a source, which is the same bargain the vendored indexes take.
//
// Zero dependencies, per Constraint 4: node:zlib deflates the image data and everything else
// is arithmetic. Nothing here runs in the browser or at request time.
//
//   node scripts/build-icons.mjs

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const ICON_DIR = join(ROOT, 'src', 'icons');

// Fixed copies of the established dark palette keep the icon stable outside the themed document.
// The accent uses --red rather than the retired --red-line value the old mark retained.
const CARD = [0x17, 0x1a, 0x20];
const PAPER = [0xee, 0xf1, 0xf6];
const FOLD = [0xc6, 0xcd, 0xda];
const INK = [0x66, 0x6c, 0x74];
const RED = [0xd4, 0x33, 0x33];

// Everything below is in a 32 by 32 space, the favicon's viewBox, and scaled to the size being
// drawn. Working in the small space is what keeps the two sizes the same picture rather than
// two pictures that happen to look alike.
const VIEW = 32;
const CORNER = 6;
const PAGE = [[7, 5], [20, 5], [25, 10], [25, 27], [7, 27]];
const PAGE_FOLD = [[20, 5], [20, 10], [25, 10]];
const RECAP_LINES = [
  [10, 13, 22, 15],
  [10, 18, 22, 20],
];
const PROGRESS = [10, 23, 20, 25];

function inPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function inRoundedSquare(x, y) {
  if (x < 0 || y < 0 || x > VIEW || y > VIEW) return false;
  const cx = Math.min(Math.max(x, CORNER), VIEW - CORNER);
  const cy = Math.min(Math.max(y, CORNER), VIEW - CORNER);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= CORNER * CORNER;
}

const SAMPLES = 4;

function inRect(x, y, [left, top, right, bottom]) {
  return x >= left && x <= right && y >= top && y <= bottom;
}

function colourAt(x, y) {
  if (!inRoundedSquare(x, y)) return null;
  if (inRect(x, y, PROGRESS)) return RED;
  if (RECAP_LINES.some((line) => inRect(x, y, line))) return INK;
  if (inPolygon(x, y, PAGE_FOLD)) return FOLD;
  if (inPolygon(x, y, PAGE)) return PAPER;
  return CARD;
}

export function drawIcon(size) {
  const scale = VIEW / size;
  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let painted = 0;
      const channels = [0, 0, 0];
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const px = (x + (sx + 0.5) / SAMPLES) * scale;
          const py = (y + (sy + 0.5) / SAMPLES) * scale;
          const colour = colourAt(px, py);
          if (!colour) continue;
          painted++;
          for (let c = 0; c < 3; c++) channels[c] += colour[c];
        }
      }
      const total = SAMPLES * SAMPLES;
      const at = (y * size + x) * 4;
      if (painted === 0) continue;
      for (let c = 0; c < 3; c++) pixels[at + c] = Math.round(channels[c] / painted);
      pixels[at + 3] = Math.round((painted / total) * 255);
    }
  }
  return pixels;
}

const hex = (colour) => `#${colour.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
const points = (polygon) => polygon.map((point) => point.join(',')).join(' ');

export const SVG_CONTENT = [
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">',
  `  <rect width="32" height="32" rx="${CORNER}" fill="${hex(CARD)}"/>`,
  `  <polygon points="${points(PAGE)}" fill="${hex(PAPER)}"/>`,
  `  <polygon points="${points(PAGE_FOLD)}" fill="${hex(FOLD)}"/>`,
  ...RECAP_LINES.map(([x1, y1, x2, y2]) => (
    `  <rect x="${x1}" y="${y1}" width="${x2 - x1}" height="${y2 - y1}" fill="${hex(INK)}"/>`
  )),
  `  <rect x="${PROGRESS[0]}" y="${PROGRESS[1]}" width="${PROGRESS[2] - PROGRESS[0]}" height="${PROGRESS[3] - PROGRESS[1]}" fill="${hex(RED)}"/>`,
  '</svg>',
  '',
].join('\n');

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
}

// Filter type 0 on every row. The adaptive filters exist to help the compressor on photographs;
// this image is flat colour and the difference measured under 2 KB, which is not worth the
// decoder in the test having to reverse four more filter types.
export function encodePng(size, pixels) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// The sizes Chromium's install criteria name, and nothing else. A third size would be a file
// nobody looks at and one more thing for the manifest to disagree with.
export const SIZES = [192, 512];
export const iconPath = (size) => join(ICON_DIR, `icon-${size}.png`);
export const svgPath = join(ICON_DIR, 'icon.svg');

function build() {
  mkdirSync(ICON_DIR, { recursive: true });
  writeFileSync(svgPath, SVG_CONTENT);
  console.log(`wrote ${svgPath}`);
  for (const size of SIZES) {
    const file = iconPath(size);
    writeFileSync(file, encodePng(size, drawIcon(size)));
    console.log(`wrote ${file}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();

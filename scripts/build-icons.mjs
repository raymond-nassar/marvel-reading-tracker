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

// The favicon's colours, so the installed icon and the tab icon are the same mark. The red is
// the literal in the `rel="icon"` data URL in src/index.html rather than a stylesheet token:
// the icon is not part of the themed surface and never sits behind text, so no palette pair
// covers it and taking `--red` would silently redraw it the next time that token moves.
const RED = [0xe2, 0x36, 0x36];
const WHITE = [0xff, 0xff, 0xff];

// Everything below is in a 32 by 32 space, the favicon's viewBox, and scaled to the size being
// drawn. Working in the small space is what keeps the two sizes the same picture rather than
// two pictures that happen to look alike.
const VIEW = 32;
const CORNER = 7;

// The M, as four quadrilaterals: two uprights and two diagonals meeting at a vee. The favicon
// draws a system-ui glyph, which cannot be reproduced here without embedding a font, so this is
// a geometric M tuned to sit in the same place at the same weight. Coordinates are corners in
// draw order, so a fill test can walk edges pairwise.
const STROKE = 3.7;
const LEFT = 8.5;
const RIGHT = 23.5;
const TOP = 9.5;
const BOTTOM = 23;
const MID_X = (LEFT + RIGHT) / 2;
const VEE_Y = TOP + (BOTTOM - TOP) * 0.62;

const GLYPH = [
  [[LEFT, TOP], [LEFT + STROKE, TOP], [LEFT + STROKE, BOTTOM], [LEFT, BOTTOM]],
  [[RIGHT - STROKE, TOP], [RIGHT, TOP], [RIGHT, BOTTOM], [RIGHT - STROKE, BOTTOM]],
  [[LEFT, TOP], [LEFT + STROKE, TOP], [MID_X + STROKE / 2, VEE_Y], [MID_X - STROKE / 2, VEE_Y]],
  [[RIGHT - STROKE, TOP], [RIGHT, TOP], [MID_X + STROKE / 2, VEE_Y], [MID_X - STROKE / 2, VEE_Y]],
];

function inPolygon(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// A rounded square, tested by distance from the nearest corner centre rather than by drawing
// arcs. Outside it the pixel is transparent, which is what lets the platform put the icon on
// whatever background it likes.
function inRoundedSquare(x, y) {
  if (x < 0 || y < 0 || x > VIEW || y > VIEW) return false;
  const cx = Math.min(Math.max(x, CORNER), VIEW - CORNER);
  const cy = Math.min(Math.max(y, CORNER), VIEW - CORNER);
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= CORNER * CORNER;
}

// Four by four supersampling. The mark is a hard-edged shape at 192 pixels and an unsampled
// edge on a diagonal reads as a staircase at that size, which is the size the taskbar shows.
const SAMPLES = 4;

// Straight RGBA rather than premultiplied, because that is what PNG stores. The glyph is only
// drawn where the tile is solid, so an edge pixel carries the tile's colour at partial alpha
// and never a fringe of white against nothing.
export function drawIcon(size) {
  const scale = VIEW / size;
  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let tile = 0;
      let ink = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          const px = (x + (sx + 0.5) / SAMPLES) * scale;
          const py = (y + (sy + 0.5) / SAMPLES) * scale;
          if (!inRoundedSquare(px, py)) continue;
          tile++;
          if (GLYPH.some((poly) => inPolygon(px, py, poly))) ink++;
        }
      }
      const total = SAMPLES * SAMPLES;
      const at = (y * size + x) * 4;
      if (tile === 0) continue;
      const inkShare = ink / tile;
      for (let c = 0; c < 3; c++) {
        pixels[at + c] = Math.round(RED[c] * (1 - inkShare) + WHITE[c] * inkShare);
      }
      pixels[at + 3] = Math.round((tile / total) * 255);
    }
  }
  return pixels;
}

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

function build() {
  mkdirSync(ICON_DIR, { recursive: true });
  for (const size of SIZES) {
    const file = iconPath(size);
    writeFileSync(file, encodePng(size, drawIcon(size)));
    console.log(`wrote ${file}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build();

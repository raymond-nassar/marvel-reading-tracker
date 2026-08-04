// Zero-dependency static server pinned to a single loopback origin.
//
// The origin matters: Chromium restricts IndexedDB on file://, ES modules do not load from
// file://, and file:// / localhost / 127.0.0.1 are three separate storage buckets. Always
// launching on the same origin is what keeps your reading progress where you left it.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('./src', import.meta.url)));
const HOST = '127.0.0.1';
const PORT = Number(process.env.MRT_PORT || 8787);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const rel = normalize(decoded).replace(/^([/\\])+/, '');
  const full = resolve(join(ROOT, rel === '' ? 'index.html' : rel));
  // Reject anything that escapes src/ regardless of how it was encoded.
  if (full !== ROOT && !full.startsWith(ROOT + sep)) return null;
  return full;
}

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { allow: 'GET, HEAD' }).end('Method Not Allowed');
    return;
  }

  const target = safePath(req.url || '/');
  if (!target) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    let file = target;
    const info = await stat(file).catch(() => null);
    if (info?.isDirectory()) file = join(file, 'index.html');

    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error(`If the tracker is already running, open http://${HOST}:${PORT}/ instead.`);
    console.error(`Otherwise start it on another port:  set MRT_PORT=8788 && npm start\n`);
    process.exit(1);
  }
  throw err;
});

// Loopback only. This server is never exposed to the network.
server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}/`;
  console.log(`Marvel Reading Tracker running at ${url}`);
  console.log('Always use this exact address — other addresses are separate browser storage.');
  console.log('Press Ctrl+C to stop.');
  if (process.env.MRT_NO_OPEN !== '1') openBrowser(url);
});

function openBrowser(url) {
  import('node:child_process')
    .then(({ spawn }) => {
      const cmd =
        process.platform === 'win32'
          ? ['cmd', ['/c', 'start', '', url]]
          : process.platform === 'darwin'
            ? ['open', [url]]
            : ['xdg-open', [url]];
      spawn(cmd[0], cmd[1], { stdio: 'ignore', detached: true }).unref();
    })
    .catch(() => {});
}

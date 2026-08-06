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

// The app renders titles, creator names and descriptions that come from a third-party
// metadata service, so it is worth assuming that response could one day be hostile or
// compromised. `script-src 'self'` is the directive that actually matters here: it means
// markup smuggled through a field like an issue title cannot execute. Everything under
// src/ loads from a file for exactly that reason, so no inline allowance is needed.
//
// `connect-src` and `img-src` are deliberately wider than the default endpoint. The API
// base is user-configurable at runtime, and the rule for what is accepted lives in
// src/js/lib/apiBase.js: any https origin, or plain http to loopback. Pinning this to
// marvel.emreparker.com would silently break anyone pointing the app at their own mirror.
// Restricting the scheme still rules out plaintext http to arbitrary hosts. The loopback
// entries here have to stay in step with that module, or a base the settings form accepts
// would be blocked at fetch time with no obvious explanation. Covers can come from
// whatever host the configured
// API names, and the favicon in index.html is a data: SVG.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' https: data:",
  "font-src 'self'",
  "connect-src 'self' https: http://127.0.0.1:* http://localhost:*",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

function safePath(urlPath) {
  // decodeURIComponent throws URIError on a malformed escape such as "/%" or "/a%2". This runs
  // before the request handler's try block, so an unhandled rejection would terminate the whole
  // process, and any web page the user has open could trigger it with a single fetch. Treat a
  // malformed path as simply not found.
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  } catch {
    return null;
  }
  const rel = normalize(decoded).replace(/^([/\\])+/, '');
  const full = resolve(join(ROOT, rel === '' ? 'index.html' : rel));
  // Reject anything that escapes src/ regardless of how it was encoded.
  if (full !== ROOT && !full.startsWith(ROOT + sep)) return null;
  return full;
}

const server = createServer(async (req, res) => {
  try {
    await handle(req, res);
  } catch (err) {
    // A request must never be able to kill the process. Without this, any throw in the handler
    // becomes an unhandled rejection and Node exits, taking the user's session with it.
    console.error(`Request failed: ${req.method} ${req.url}: ${err?.message ?? err}`);
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    if (!res.writableEnded) res.end('Internal error');
  }
});

async function handle(req, res) {
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
    let info = await stat(file).catch(() => null);
    if (info?.isDirectory()) {
      file = join(file, 'index.html');
      info = await stat(file).catch(() => null);
    }

    // Everything here is served no-cache, so the browser revalidates on every load and always
    // sees a rebuilt file immediately. Without a validator it cannot revalidate, only re-fetch:
    // each reload pulled the whole of every asset, which the vendored search indexes turned into
    // 455 KB. Size and modification time identify a build well enough to answer that with a 304,
    // and the stat above has already paid for them.
    const etag = info ? `"${info.size.toString(16)}-${Math.round(info.mtimeMs).toString(16)}"` : null;
    const headers = {
      'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'content-security-policy': CSP,
      // frame-ancestors above is the modern control; this is the companion header for
      // anything that still honours only the older one.
      'x-frame-options': 'DENY',
      ...(etag ? { etag } : {}),
    };

    if (etag && req.headers['if-none-match'] === etag) {
      res.writeHead(304, headers);
      res.end();
      return;
    }

    // Read after the 304 check, so an unchanged file is never loaded into memory at all. A file
    // that vanished between the stat and here still falls through to the 404 below.
    const body = await readFile(file);
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}

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
  console.log('Always use this exact address. Other addresses are separate browser storage.');
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

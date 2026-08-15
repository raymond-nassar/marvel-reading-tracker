// Which hosts the app is willing to request a cover image from.
//
// Pure and browser-free, like the rest of src/js/lib: no fetch, no DOM, no storage.
//
// Two places need this answer and have to give the same one, which is why it is a module and not
// a literal in each: `normalizeCover` in model.js decides which cover URLs may be built, and the
// `img-src` directive in server.mjs decides which the browser will fetch. server.mjs imports the
// constant below rather than repeating it, so the URL policy and the image policy cannot drift
// apart. They did not previously agree at all: the policy accepted any https host and the
// directive permitted any https origin, while the interface told the reader covers came from
// Marvel's own servers.
//
// The pin is measured rather than assumed. Every cover in the bundled reading orders names this
// host, 700 of 700, and the supported metadata service named it for all 36 issues sampled from
// its single-issue endpoint across 1963, 1985, 2005, 2015, 2021 and 2025 on 2026-08-15. Not one
// counter-example was found in either population.
//
// Pinning `img-src` was previously declined on the grounds that it would break self-hosted
// mirrors. That reasoning holds for `connect-src`, which must stay wide because the API base
// really is user-configurable and the app really does connect to it. It does not hold here,
// because the app never requests an image from the API base. A cover URL is a field inside the
// response body, and a mirror serving the metadata shape serves Marvel's own image paths with
// it, so a mirror keeps working. What stops working is a service naming a host of its own, which
// is the case this exists to stop.
export const COVER_IMAGE_HOST = 'i.annihil.us';

// The host is compared whole, against the parsed URL's host, rather than by prefix or suffix.
// A suffix test would accept `i.annihil.us.tracker.example`, a prefix test would accept
// `i.annihil.us.evil` and a substring test would accept `tracker.example/i.annihil.us`, all of
// which are third-party addresses wearing the pinned host as text. Parsing first is what makes
// the comparison a comparison of hosts rather than of strings that contain one.
//
// `host` rather than `hostname`, so a port cannot be smuggled in: the pinned host reached on port
// 8080 is a different endpoint from the CDN and is refused, which matches the directive, since a
// source expression without a port permits only the default one.
export function isAllowedCoverUrl(value) {
  let u;
  try {
    u = new URL(String(value));
  } catch {
    return false;
  }
  // Stated positively, the way isAllowedApiBase states its schemes: a URL has to match both
  // clauses to be allowed, so an unexpected scheme is refused by default rather than by omission.
  return u.protocol === 'https:' && u.host === COVER_IMAGE_HOST;
}

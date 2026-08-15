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
export function allowedCoverUrl(value) {
  let u;
  try {
    u = new URL(String(value));
  } catch {
    return null;
  }
  // Written as the one pair of values that is accepted, the way isAllowedApiBase enumerates its
  // schemes, so an unexpected scheme is refused by default rather than by omission from a list of
  // known-bad ones. The early return inverts that pair to reach the refusal; it does not widen it.
  if (u.protocol !== 'https:' || u.host !== COVER_IMAGE_HOST) return null;
  // The serialized URL, not the caller's string. Comparing a parsed copy and then keeping the
  // original leaves the parser's escaping behind, and one of the characters it escapes is the
  // double quote. A cover path carrying one really is on the pinned host, so it passes, and the
  // hero background is built as url("<address>"), so the quote closes that layer and a second
  // layer naming any host can follow it. Returning the serialized form percent-encodes the quote
  // at the one place a cover address is admitted rather than at each place one is interpolated,
  // which is the property the rest of this file claims. Nothing shipped changes: all 700 bundled
  // cover paths serialize to themselves.
  return u.href;
}

// The question rather than the admission, for callers testing an address they are not about to
// store. Both forms answer from the same parse so they cannot come apart.
export function isAllowedCoverUrl(value) {
  return allowedCoverUrl(value) !== null;
}

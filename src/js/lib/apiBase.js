// Which API base URLs the app is willing to talk to.
//
// Pure and browser-free, like the rest of src/js/lib: no fetch, no DOM, no storage.
//
// Two places need this answer and have to give the same one: the settings form in
// src/js/main.js decides what may be stored, and the launch page in src/open.js decides
// what may be read back out and fetched from. When they each carried their own copy of
// the rule they carried the same defect:
//
//   protocol !== 'https:' && hostname !== '127.0.0.1' && hostname !== 'localhost'
//
// That only rejects a non-https scheme when the host is *not* loopback, so the whole
// check fell away for loopback hosts and `ftp://localhost` was accepted by both. The
// rule below is stated positively instead: a scheme has to be named here to be allowed,
// so an unexpected one is refused by default rather than by omission.

// The URL parser lowercases the scheme and host, so neither needs lowercasing again here.
//
// The IPv6 loopback `[::1]` is deliberately absent. It is genuinely the local machine, but
// a Content-Security-Policy `connect-src` cannot express an IPv6 literal: Chrome rejects
// `http://[::1]:*` as an invalid source expression and drops it. Accepting it here would
// let the settings form store a base that CSP then blocks at fetch time, which reads to
// the user as the service being down. Refusing it up front is the honest failure.
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost']);

export function isAllowedApiBase(value) {
  let u;
  try {
    u = new URL(String(value));
  } catch {
    return false;
  }
  if (u.protocol === 'https:') return true;
  // Plain http is allowed only against the machine the app is already running on, which
  // is how the app is served in development. Anywhere else it would put the reader's
  // requests on the network in the clear.
  return u.protocol === 'http:' && LOOPBACK_HOSTS.has(u.hostname);
}

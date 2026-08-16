// Registering the offline worker, kept out of main.js so it can be tested without a browser.
//
// The worker itself is src/sw.js and the reason it exists is written there. This is only the
// wiring, and the wiring has one job beyond calling register: it must never be able to stop the
// app booting. A reader whose browser refuses service workers, or who has them switched off, or
// who is somehow on an origin that is not treated as secure, still has a working tracker. The
// offline launch is the thing that is lost, and it is the only thing that is lost.

// Resolved against the document rather than against this module. The worker's scope is the
// directory it is served from, so a worker fetched from js/lib/ would only ever see requests for
// js/lib/, and the navigation that matters is the one for the page itself. index.html sits at
// the root of what is served, so this reaches src/sw.js and takes the whole app as its scope.
export const WORKER_URL = './sw.js';

// Every reason to do nothing, as a returned string rather than a thrown error or a silent
// return. The caller logs it, and a name is what turns "offline did not work" into a question
// with an answer.
export const SKIPPED = {
  unsupported: 'this browser has no service worker support',
  insecure: 'this address is not treated as a secure origin',
};

export function registerOffline(scope = globalThis) {
  const nav = scope.navigator;
  if (!nav || !nav.serviceWorker) return Promise.resolve({ ok: false, reason: SKIPPED.unsupported });
  // Checked rather than assumed. http://127.0.0.1 is a secure origin and so is localhost, which
  // is why this app can have a worker at all without a certificate, but a reader who reached the
  // page some other way would otherwise get a rejected promise and a console error naming
  // nothing they could act on.
  if (scope.isSecureContext === false) return Promise.resolve({ ok: false, reason: SKIPPED.insecure });

  return nav.serviceWorker.register(WORKER_URL)
    .then(() => ({ ok: true, reason: null }))
    // The failure that matters in practice is a checkout with no src/sw.js in it, which answers
    // the register with the index page under the wrong content type. There is nothing the reader
    // can do about it and nothing on screen it should change, so it is reported to the console
    // and the app carries on exactly as it did before this file existed.
    .catch((err) => ({ ok: false, reason: String(err && err.message ? err.message : err) }));
}

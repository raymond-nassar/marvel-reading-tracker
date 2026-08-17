// Real-browser regression evidence, made reproducible.
//
// The backlog and the UX study rest on browser verification that was real but unrepeatable: the
// scripts lived outside the tree, so a clean clone could rerun none of it. This file is that
// evidence, committed. It drives installed Edge through the six journeys the app is for, and it
// is the only place where a claim about what the interface does in a browser can be checked
// rather than argued.
//
// **puppeteer-core is not a dependency of this repository and must not become one.** It is
// resolved at run time from outside the tree, and its absence is a prerequisite failure with
// instructions attached, not a test failure. Nothing here is installed by `npm ci`, nothing here
// runs in CI, and `package.json` gains no entry for it. If your first instinct on reading the
// import below is to add it to devDependencies, that is the instinct this paragraph exists to
// stop.
//
// **The server binds an ephemeral port, and that is a guarantee rather than a convenience.**
// Constraint 5 says a different origin is a different storage bucket. For the app that is a
// hazard; for a check that writes corrupt state and starts fresh, it is exactly the isolation
// wanted. Running on a port the app never uses means this file structurally cannot read, damage
// or clear the reading progress saved at 127.0.0.1:8787. That is also the whole of the cleanup
// story: there is nothing to tidy up, because nothing durable was ever written where the app
// would look for it.
//
// **The data is fixtures, not the catalog.** The scenarios assert what the interface does, and
// the vendored orders have their own gates. Stubbing `fetch` for the two data files keeps this
// check fast, deterministic and immune to a catalog edit that has nothing to do with it.

import { createStaticServer, HOST } from '../server.mjs';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Exit 2 rather than 1 for a missing prerequisite. A failed assertion and an uninstalled browser
// driver are different answers to different questions, and a caller that cannot tell them apart
// reports "the app is broken" when the truth is "the driver is not here".
const EXIT_PREREQ = 2;

// ------------------------------------------------------------------ prerequisites

// Every published layout of the entry point, newest first. puppeteer-core moved it once, so a
// machine with an older scratch install still resolves.
const DRIVER_SUFFIXES = [
  join('lib', 'puppeteer', 'puppeteer-core.js'),
  join('lib', 'esm', 'puppeteer', 'puppeteer-core.js'),
];

function driverCandidates() {
  const roots = [];
  if (process.env.MRT_PUPPETEER) roots.push(process.env.MRT_PUPPETEER);
  for (const dir of ['.mrt-scratch', 'mrt-scratch-pptr', 'mrt-scratch']) {
    roots.push(join(homedir(), dir));
  }

  const out = [];
  for (const root of roots) {
    // MRT_PUPPETEER may name the entry file itself, the package, or the directory the package was
    // installed into. All three are things a person reasonably types.
    if (root.endsWith('.js')) out.push(root);
    for (const suffix of DRIVER_SUFFIXES) {
      out.push(join(root, suffix));
      out.push(join(root, 'node_modules', 'puppeteer-core', suffix));
    }
  }
  return out;
}

function resolveDriver() {
  for (const candidate of driverCandidates()) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

const EDGE_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/microsoft-edge',
];

function resolveEdge() {
  if (process.env.MRT_EDGE) return existsSync(process.env.MRT_EDGE) ? process.env.MRT_EDGE : null;
  return EDGE_CANDIDATES.find((p) => existsSync(p)) ?? null;
}

function prerequisiteFailure(what, how) {
  console.error(`\nCannot run the browser check: ${what}\n`);
  for (const line of how) console.error(`  ${line}`);
  console.error('');
  process.exit(EXIT_PREREQ);
}

// ------------------------------------------------------------------ fixtures

// Three issues is the smallest order that can still show an order: a first, a middle and a last.
// The second deliberately has no digitalId, because the launcher has two paths and only one of
// them is exercised by an issue we already know the reference for.
const ORDER_FILE = 'browser_check_fixture.json';

const ORDER = {
  id: 'browser-check',
  name: 'Browser Check Order',
  description: 'A fixture order used only by the browser check.',
  source: null,
  sourceOrigin: 'Fixture',
  sourceLicense: null,
  generatedAt: '2026-01-01T00:00:00.000Z',
  apiBase: null,
  count: 3,
  placeholders: 0,
  unresolved: 0,
  items: [
    {
      issueId: 900001,
      title: 'Browser Check (2026) #1',
      number: '1',
      url: 'https://www.marvel.com/comics/issue/900001/browser_check_1',
      seriesId: 90000,
      seriesName: 'Browser Check (2026)',
      onSale: '2026-01-01T00:00:00+0000',
      mu: '2026-02-01T00:00:00+0000',
      digitalId: 700001,
      cover: null,
      description: null,
      pageCount: 0,
      creators: [],
    },
    {
      issueId: 900002,
      title: 'Browser Check (2026) #2',
      number: '2',
      url: 'https://www.marvel.com/comics/issue/900002/browser_check_2',
      seriesId: 90000,
      seriesName: 'Browser Check (2026)',
      onSale: '2026-02-01T00:00:00+0000',
      mu: null,
      digitalId: null,
      cover: null,
      description: null,
      pageCount: 0,
      creators: [],
    },
    {
      issueId: 900003,
      title: 'Browser Check (2026) #3',
      number: '3',
      url: 'https://www.marvel.com/comics/issue/900003/browser_check_3',
      seriesId: 90000,
      seriesName: 'Browser Check (2026)',
      onSale: '2026-03-01T00:00:00+0000',
      mu: '2026-04-01T00:00:00+0000',
      digitalId: 700003,
      cover: null,
      description: null,
      pageCount: 0,
      creators: [],
    },
  ],
};

const CATALOG = {
  lists: [
    {
      id: 'browser-check',
      file: ORDER_FILE,
      name: 'Browser Check Order',
      description: 'A fixture order used only by the browser check.',
      type: 'event',
      depth: 'complete',
      count: 3,
      collections: 0,
      characters: [],
      keywords: [],
      group: null,
      groupName: null,
      variant: null,
      beginner: false,
      cover: null,
      source: null,
      sourceOrigin: 'Fixture',
      sourceLicense: null,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ],
};

const IMPORT_BUTTON = `button[aria-label="Import ${CATALOG.lists[0].name}"]`;
const ORDER_COUNT = ORDER.items.length;
const EXPECTED_TITLES = ORDER.items.map((i) => i.title);

// ------------------------------------------------------------------ mutations

// A check that has never been seen to fail is not evidence. Each entry below breaks one capability
// a scenario asserts, and --prove runs them and records which scenarios each one turns red. They
// are injected into the page rather than edited into a source file, so a killed run cannot leave
// the tree modified, which is a failure mode a file-editing harness has and this one cannot.
const MUTATIONS = [
  {
    id: 'import-fail',
    breaks: 'import',
    why: 'the order file cannot be fetched, so an import that reports success is reporting nothing',
    script: () => {
      window.__mrtMutation = 'import-fail';
    },
  },
  {
    id: 'persist-noop',
    breaks: 'persistence',
    why: 'writes to the state key are dropped, so progress that survives a reload cannot be real',
    script: () => {
      const real = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItem(key, value) {
        if (key === 'mrt.state.v2') return undefined;
        return real.call(this, key, value);
      };
    },
  },
  {
    id: 'forget-marks',
    breaks: 'persistence',
    why: 'read marks are stripped from every write, so a mark that appears to reach storage never did',
    script: () => {
      const real = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItem(key, value) {
        if (key !== 'mrt.state.v2') return real.call(this, key, value);
        try {
          const parsed = JSON.parse(value);
          // Only touch a write the app made. The recovery scenario writes a corrupt payload of its
          // own through this same setItem, and rewriting that one would redden recovery's
          // byte-for-byte row as harness interference rather than as an app fault.
          if (!Object.prototype.hasOwnProperty.call(parsed, 'read')) return real.call(this, key, value);
          parsed.read = {};
          return real.call(this, key, JSON.stringify(parsed));
        } catch {
          return real.call(this, key, value);
        }
      };
    },
  },
  {
    id: 'route-freeze',
    breaks: 'navigation',
    why: 'history stops recording, so an address bar that tracks the view cannot be doing so',
    script: () => {
      history.pushState = () => {};
      history.replaceState = () => {};
    },
  },
  {
    id: 'hide-blocked',
    breaks: 'recovery',
    why: 'the banner is forced hidden, so unreadable data would be met with silence',
    script: () => {
      document.addEventListener('DOMContentLoaded', () => {
        const banner = document.querySelector('#blocked-banner');
        if (!banner) return;
        new MutationObserver(() => {
          if (!banner.hidden) banner.hidden = true;
        }).observe(banner, { attributes: true });
        banner.hidden = true;
      });
    },
  },
  {
    id: 'disable-recovery',
    breaks: 'recovery',
    why: 'the banner still appears but its two buttons are unusable, so the reader is told their data is unreadable and offered no way out of it',
    script: () => {
      document.addEventListener('DOMContentLoaded', () => {
        for (const id of ['#btn-download-salvage', '#btn-start-fresh']) {
          const el = document.querySelector(id);
          if (el) el.disabled = true;
        }
      });
    },
  },
  {
    id: 'fade-recovery',
    breaks: 'recovery',
    why: 'the two buttons are faded out the way this stylesheet already hides row actions, so they are on screen and out of reach',
    script: () => {
      document.addEventListener('DOMContentLoaded', () => {
        // Inserted through the CSSOM rather than as a <style> element, because the app sends
        // style-src 'self' and an injected stylesheet would be refused rather than applied.
        const sheet = document.styleSheets[0];
        if (!sheet) return;
        sheet.insertRule('#btn-download-salvage, #btn-start-fresh { opacity: 0; pointer-events: none; }', sheet.cssRules.length);
      });
    },
  },
  {
    id: 'wipe-original',
    breaks: 'recovery',
    why: 'the unreadable original is deleted once it has been copied aside, which is the wipe the banner promises has not happened',
    script: () => {
      const real = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItem(key, value) {
        const out = real.call(this, key, value);
        if (String(key).startsWith('mrt.state.salvage')) this.removeItem('mrt.state.v2');
        return out;
      };
    },
  },
  {
    id: 'open-async',
    breaks: 'handoff',
    why: 'the tab is opened after an await, which is the shape constraint 7 says gets popup blocked',
    script: () => {
      const real = window.open.bind(window);
      window.open = (...args) => {
        Promise.resolve().then(() => real(...args));
        return null;
      };
    },
  },
  {
    id: 'synopsis-attempts',
    breaks: 'synopsis',
    why: 'the running line is rewritten to report attempts rather than answers, which is the miscount this scenario exists to catch',
    script: () => {
      // The counter itself lives in a module the page cannot reach, so the rendered line is
      // rewritten instead. Against a service refusing everything, requests settled is exactly the
      // number refused, so this restores the line the app printed before it learned to subtract.
      // The first mutation aimed here made the service answer instead, which starved the wait and
      // reddened only the catch-all row: it proved the scenario could break, not that any named
      // claim in it could fail.
      document.addEventListener('DOMContentLoaded', () => {
        const status = document.querySelector('#synopsis-status');
        if (!status) return;
        const restate = () => {
          const text = status.textContent ?? '';
          const next = text.replace(/^Fetching synopses 0 of /, `Fetching synopses ${window.__mrtRefused ?? 0} of `);
          // Converges rather than loops: once rewritten the line no longer starts with a zero, so
          // the write this observer makes cannot match its own pattern a second time.
          if (next !== text) status.textContent = next;
        };
        new MutationObserver(restate).observe(status, { childList: true, characterData: true, subtree: true });
        restate();
      });
    },
  },
];

// ------------------------------------------------------------------ scenarios

// Every scenario gets its own browser context, so its storage bucket is its own and the order
// they run in cannot matter. A scenario that passed only because the one before it left the right
// state behind is not evidence either.
const SCENARIOS = [
  {
    id: 'import',
    title: 'a curated order can be imported from the catalog',
    async run(page, t) {
      await open(page, '/');
      await click(page, '[data-view="catalog"]');
      await page.waitForSelector(IMPORT_BUTTON, { timeout: 15000 });
      t.check('the catalog offers the order', true);

      await click(page, IMPORT_BUTTON);
      await page.waitForSelector('#full', { timeout: 15000 });
      await openFullOrder(page);

      const rows = await page.$$eval('#rows .row', (els) => els.length);
      t.check('every issue in the order is on screen', rows === ORDER_COUNT, `${rows} rows, expected ${ORDER_COUNT}`);

      const titles = await page.$$eval('#rows .rt', (els) => els.map((e) => e.textContent.trim()));
      t.check('the issues are the ones the order names', titles.join('|') === EXPECTED_TITLES.join('|'), titles.join(' / '));

      const saved = await readState(page);
      const lists = Object.values(saved?.lists ?? {});
      t.check('the import was written to storage', lists.length === 1, `${lists.length} list(s) saved`);
      t.check('the saved list carries the order', (lists[0]?.itemIds?.length ?? 0) === ORDER_COUNT, `${lists[0]?.itemIds?.length ?? 0} item(s) saved`);
    },
  },
  {
    id: 'navigation',
    title: 'the address bar tracks the view, and back returns to it',
    async run(page, t) {
      await importOrder(page);

      const readHash = await page.evaluate(() => location.hash);
      t.check('the reading view has an address of its own', readHash.length > 1, JSON.stringify(readHash));

      await click(page, '.brand[data-view="home"]');
      await page.waitForFunction('location.hash !== ' + JSON.stringify(readHash), { timeout: 15000 });
      const homeHash = await page.evaluate(() => location.hash);
      t.check('home has a different address', homeHash !== readHash, `${JSON.stringify(homeHash)} vs ${JSON.stringify(readHash)}`);
      t.check('home is the visible view', await visibleView(page) === 'view-home', await visibleView(page));

      await page.goBack({ waitUntil: 'load' }).catch(() => {});
      await page.waitForFunction('location.hash === ' + JSON.stringify(readHash), { timeout: 15000 }).catch(() => {});
      t.check('back returns to the reading view', await page.evaluate(() => location.hash) === readHash, await page.evaluate(() => location.hash));
      t.check('and the reading view is what is shown', await visibleView(page) === 'view-read', await visibleView(page));
    },
  },
  {
    id: 'persistence',
    title: 'progress survives a reload',
    async run(page, t) {
      await importOrder(page);

      await click(page, 'button.cb[data-act="read"][data-key="900001"]');
      await page.waitForFunction(
        'document.querySelector(\'button.cb[data-act="read"][data-key="900001"]\')?.getAttribute("aria-pressed") === "true"',
        { timeout: 15000 },
      );
      t.check('an issue can be marked read', true);

      const before = await readState(page);
      // Not a substring search over the serialised state: createList already writes the issue id
      // into the list's itemIds, so `includes('900001')` is true the moment the order imports and
      // says nothing about the mark. Read marks live in their own map, keyed by issue id.
      const marked = Object.prototype.hasOwnProperty.call(before?.read ?? {}, '900001');
      t.check('the mark reached storage', marked, `read keys: ${JSON.stringify(Object.keys(before?.read ?? {}))}`);

      await page.reload({ waitUntil: 'load' });
      await openFullOrder(page);

      const pressed = await page.$eval('button.cb[data-act="read"][data-key="900001"]', (el) => el.getAttribute('aria-pressed'));
      t.check('the mark is still there after a reload', pressed === 'true', `aria-pressed=${pressed}`);

      const others = await page.$$eval('button.cb[data-act="read"]', (els) => els.filter((e) => e.getAttribute('aria-pressed') === 'true').length);
      t.check('and only the issue that was marked is marked', others === 1, `${others} marked read`);
    },
  },
  {
    id: 'recovery',
    title: 'unreadable saved data is met with an offer rather than a wipe',
    async run(page, t) {
      await importOrder(page);
      const real = await page.evaluate(() => localStorage.getItem('mrt.state.v2'));
      t.check('there is real progress to lose', typeof real === 'string' && real.length > 0);

      // A schema from the future is the shape the store was built for: valid JSON that migrate()
      // refuses, which is what a downgrade after using a newer build actually looks like.
      const corrupt = JSON.stringify({ schemaVersion: 99, lists: {}, note: 'from a newer build' });
      await page.evaluate((bytes) => {
        localStorage.setItem('mrt.state.v2', bytes);
      }, corrupt);
      await page.reload({ waitUntil: 'load' });
      await page.waitForSelector('#blocked-banner:not([hidden])', { timeout: 15000 });
      t.check('the reader is told, rather than finding an empty tracker', true);

      const why = await page.$eval('#blocked-why', (el) => el.textContent.trim());
      t.check('the banner says why', why.length > 0, JSON.stringify(why));

      // Presence is not the claim. Both buttons are static markup inside the banner, so
      // querySelector finds them on a perfectly healthy app with the banner hidden. What the
      // shipped copy promises is that the reader can act on them, so the query is scoped to the
      // banner only while it is showing, and asks whether each button is reachable and enabled.
      //
      // checkVisibility() with no argument answers a narrower question than it looks like it does:
      // it defaults every option off and so returns true for both `visibility: hidden` and
      // `opacity: 0`. The second is not hypothetical here. `src/styles.css:649` hides the row
      // actions with exactly `opacity: 0`, so it is this stylesheet's established way of putting a
      // control out of reach, and the defaults are blind to it. Measured in the same Edge this
      // drives: with the two buttons faded that way both rows passed while nothing sat under the
      // pointer at either button's centre.
      const offers = await page.evaluate(() => {
        const banner = document.querySelector('#blocked-banner:not([hidden])');
        const usable = (sel) => {
          const el = banner?.querySelector(sel);
          if (!el) return { found: false, visible: false, enabled: false };
          const visible = el.checkVisibility({
            visibilityProperty: true,
            opacityProperty: true,
            contentVisibilityAuto: true,
          });
          return { found: true, visible, enabled: !el.disabled };
        };
        return { download: usable('#btn-download-salvage'), fresh: usable('#btn-start-fresh') };
      });
      t.check(
        'a copy of the unreadable data can be downloaded',
        offers.download.found && offers.download.visible && offers.download.enabled,
        JSON.stringify(offers.download),
      );
      t.check(
        'and starting fresh is offered as a separate, second choice',
        offers.fresh.found && offers.fresh.visible && offers.fresh.enabled,
        JSON.stringify(offers.fresh),
      );

      const salvaged = await page.evaluate(() => Object.keys(localStorage).some((k) => k.startsWith('mrt.state.salvage')));
      t.check('the unreadable bytes were copied aside before anything else', salvaged);

      // The other half of "rather than a wipe", and the half a salvage copy alone cannot show.
      // The banner promises the original has not been changed or deleted, so compare it byte for
      // byte with what was written, not merely for presence.
      const kept = await page.evaluate(() => localStorage.getItem('mrt.state.v2'));
      t.check(
        'and the unreadable original is still there, byte for byte',
        kept === corrupt,
        kept === null ? 'the key is gone' : `${kept.length} bytes vs ${corrupt.length}`,
      );
    },
  },
  {
    id: 'handoff',
    title: 'the reader tab opens synchronously, inside the gesture',
    async run(page, t) {
      await importOrder(page);

      // The proof that no await intervenes is that the call is recorded during the click's own
      // dispatch. A handler that opened the tab after any await would record it afterwards, and
      // that is the shape constraint 7 says the browser blocks. The recorder itself was installed
      // before the app loaded, in preparePage.
      await page.evaluate(() => { window.__opened = []; });

      await page.evaluate(() => {
        const btn = document.querySelector('button.mini[data-act="open"][data-key="900001"]');
        window.__dispatching = true;
        btn.click();
        window.__dispatching = false;
      });

      const opened = await page.evaluate(() => window.__opened);
      t.check('clicking Read opens exactly one tab', opened.length === 1, `${opened.length} call(s)`);
      t.check('and it opens during the click itself, with no await in between', opened[0]?.dispatching === true);

      const url = opened[0]?.url ?? '';
      t.check('the tab goes to our own launcher, not straight to Marvel', url.includes('/open.html?'), url);
      t.check('carrying the reference we already hold', url.includes('d=700001'), url);
      t.check('and opened without handing over a window reference', (opened[0]?.features ?? '').includes('noopener'), opened[0]?.features);

      // The second issue has no digitalId, so the launcher has to resolve one. It must still open
      // synchronously: waiting for the lookup is what loses the user activation.
      await page.evaluate(() => {
        window.__opened = [];
        const btn = document.querySelector('button.mini[data-act="open"][data-key="900002"]');
        window.__dispatching = true;
        btn.click();
        window.__dispatching = false;
      });
      const second = await page.evaluate(() => window.__opened);
      t.check('an issue with no reference still opens a tab at once', second.length === 1 && second[0].dispatching === true, JSON.stringify(second));
      // Require the record before reading it. A bare negated substring reports this as satisfied
      // when nothing was opened at all, which is the one case it is meant to catch, and it reads
      // the parameter rather than the string so a title containing "d=" cannot decide it.
      const asks = second.length === 1
        && !new URL(second[0].url, page.__origin).searchParams.has('d');
      t.check('and asks the launcher to resolve it', asks, JSON.stringify(second.map((o) => o.url)));
    },
  },
  {
    id: 'synopsis',
    title: 'a synopsis run counts what it was told, not what it asked',
    async run(page, t) {
      // Registered before the first navigation, because the stub in preparePage is installed the
      // same way and a flag set after load is one the app has already gone past. Read at fetch
      // time rather than at install time so the two orderings cannot matter.
      await page.evaluateOnNewDocument(() => { window.__mrtSynopsis = 'refuse'; });
      await importOrder(page);

      await click(page, '#btn-synopsis');
      await page.waitForFunction(() => document.querySelector('#ask')?.open === true, { timeout: 15000 });
      await click(page, '#ask-ok');

      // Waiting on the harness's own count of refusals rather than on the status line, and rather
      // than on a clock. The line is what is under test, so waiting for it to name a refusal makes
      // a broken build starve the wait and report a timeout instead of the claim that failed; and
      // the run is three issues at 400ms each, so a fixed sleep is either too early to have lost
      // anything or late enough that the queue has emptied.
      await page.waitForFunction(() => (window.__mrtRefused ?? 0) >= 1, { timeout: 20000 });

      // Read and stopped inside one evaluation on purpose. Reading the line, returning it, and
      // then sending a second call to click stop leaves a gap in which the run can finish, and a
      // finished run makes the claim untestable rather than false.
      const at = await page.evaluate(() => {
        const line = document.querySelector('#synopsis-status')?.textContent ?? '';
        const stop = document.querySelector('#btn-cancel-synopsis');
        const going = stop?.hidden === false;
        stop?.click();
        return { line, going };
      });
      t.check('the run against a refusing service was still going when it was stopped', at.going, JSON.stringify(at));

      const running = /^Fetching synopses (\d+) of (\d+)/.exec(at.line);
      t.check('a running line counts none of the refusals as fetched',
        !!running && Number(running[1]) === 0 && Number(running[2]) === ORDER_COUNT, JSON.stringify(at.line));
      t.check('a running line names what it could not reach',
        / \d+ could not be reached\.$/.test(at.line), JSON.stringify(at.line));

      await page.waitForFunction(
        () => /^Stopped after /.test(document.querySelector('#synopsis-status')?.textContent ?? ''),
        { timeout: 15000 },
      );
      const after = await page.evaluate(() => ({
        line: document.querySelector('#synopsis-status')?.textContent ?? '',
        fetchHidden: document.querySelector('#btn-synopsis')?.hidden ?? null,
      }));

      const stopped = /^Stopped after (\d+) of (\d+)\./.exec(after.line);
      t.check('a stopped run counts none of the refused requests as fetched',
        !!stopped && Number(stopped[1]) === 0 && Number(stopped[2]) === ORDER_COUNT, JSON.stringify(after.line));
      // Asserted apart from the count, because the two are separate promises made by separate
      // fixes. Deleting the failure clause from the stopped line leaves every other assertion here
      // green, so without this the first fix of this series would be the one part of it that
      // nothing watched.
      t.check('a stopped run names what it could not reach',
        /^Stopped after \d+ of \d+\. \d+ could not be reached\.$/.test(after.line), JSON.stringify(after.line));
      // The one that matters most. Both lines read the same counter, and while only some of the
      // readers subtracted the failures the number moved backwards in front of the reader at the
      // moment they pressed stop: a run showing three fetched became a run that had stopped after
      // none.
      t.check('and the count a stop leaves behind is the one that was already on screen',
        !!running && !!stopped && running[1] === stopped[1], `${JSON.stringify(at.line)} then ${JSON.stringify(after.line)}`);
      t.check('the fetch button comes back once the run is stopped', after.fetchHidden === false, JSON.stringify(after));
    },
  },
];

// ------------------------------------------------------------------ page helpers

async function open(page, path) {
  await page.goto(`${page.__origin}${path}`, { waitUntil: 'load' });
}

// page.click is unreliable here: an element the app has just rendered is frequently reported as
// not clickable while it is perfectly present and wired. Dispatching the click from inside the
// page is what the app's own handlers see anyway.
async function click(page, selector) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.evaluate((s) => document.querySelector(s).click(), selector);
}

async function visibleView(page) {
  return page.evaluate(() => document.querySelector('.view:not([hidden])')?.id ?? null);
}

async function readState(page) {
  const raw = await page.evaluate(() => localStorage.getItem('mrt.state.v2'));
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function importOrder(page) {
  await open(page, '/');
  await click(page, '[data-view="catalog"]');
  await click(page, IMPORT_BUTTON);
  await page.waitForSelector('#full', { timeout: 15000 });
  await openFullOrder(page);
}

// The full order lives inside a <details> that starts closed, and main.js deliberately builds no
// rows while it is: opening it is what asks for them. A check that waited for `#rows .row` without
// opening it would wait forever against a perfectly working app.
async function openFullOrder(page) {
  await page.evaluate(() => {
    const d = document.querySelector('#full');
    if (d && !d.open) d.open = true;
  });
  await page.waitForSelector('#rows .row', { timeout: 15000 });
}

// The stub is installed with evaluateOnNewDocument rather than after load, because the catalog is
// memoized on first read: a stub installed afterwards is a stub the app has already gone past.
async function preparePage(page, origin, mutation) {
  page.__origin = origin;
  await page.setViewport({ width: 1280, height: 900 });
  await page.evaluateOnNewDocument(
    (catalog, order, orderFile) => {
      const real = window.fetch.bind(window);
      const json = (body, status = 200) => new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      });
      window.fetch = (input, init) => {
        const url = typeof input === 'string' ? input : input?.url ?? '';
        if (url.endsWith('data/catalog.json')) return Promise.resolve(json(catalog));
        if (url.endsWith(`data/${orderFile}`)) {
          if (window.__mrtMutation === 'import-fail') return Promise.resolve(json({ error: 'mutation' }, 500));
          return Promise.resolve(json(order));
        }
        // Only the synopsis scenario sets the flag, and it sets it before the first navigation.
        // Left unset this line is reached by no request any other scenario makes, so what they
        // see is the stub they saw before it was added.
        const issue = window.__mrtSynopsis ? /\/issues\/(\d+)(?:\?|$)/.exec(url) : null;
        if (issue) {
          const answers = window.__mrtSynopsis === 'answer';
          // Delayed on purpose, and this is the whole reason the scenario can make its claim. An
          // immediate refusal empties a three issue queue before a click on stop can land, and
          // what is under test is the line a run shows while it is still running.
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (answers) resolve(json({ id: Number(issue[1]), description: `Fixture synopsis for ${issue[1]}.` }));
              // A network refusal rather than a 404: a 404 is the service answering, and the app
              // counts that as an answer on purpose. Only a request that got nothing at all is
              // what the running line is meant to hold back from its count.
              else {
                // Counted here rather than read off the status line, because the status line is
                // the thing under test. A scenario that waited for the line to mention a refusal
                // could only ever be satisfied by the behaviour it is meant to be able to find
                // missing, so on a broken build it would starve and report a timeout instead of
                // reporting the claim that failed.
                window.__mrtRefused = (window.__mrtRefused ?? 0) + 1;
                reject(new TypeError('Failed to fetch'));
              }
            }, 400);
          });
        }
        return real(input, init);
      };

      // Installed here, before a single line of the app has run, and deliberately not from the
      // handoff scenario after load. Both the instrument and a mutation replace window.open by
      // wrapping what they find, so whichever is installed last is the one the app reaches first.
      // Recording after load put the instrument outermost, which erased the mutation aimed at it
      // and made the handoff scenario the one scenario that could not be shown to fail.
      window.__opened = [];
      const realOpen = window.open.bind(window);
      window.open = (url, target, features) => {
        window.__opened.push({ url, target, features, dispatching: window.__dispatching === true });
        // The real open is never called: a check that spawned a Marvel tab per assertion would be
        // both slow and a request to a third party this repository has no business making.
        void realOpen;
        return null;
      };
    },
    CATALOG,
    ORDER,
    ORDER_FILE,
  );
  // Handed to puppeteer as a function rather than stringified and passed to `new Function`, which
  // the app's own CSP refuses: server.mjs sends `script-src 'self'` with no 'unsafe-eval'. A
  // debugger-injected script is not subject to that, so this is both simpler and the only form
  // that runs. The first shape written here failed on every mutation for exactly that reason.
  if (mutation) await page.evaluateOnNewDocument(mutation.script);
}

// ------------------------------------------------------------------ running

function tally() {
  const rows = [];
  return {
    rows,
    check(name, ok, detail) {
      rows.push({ name, ok: !!ok, detail: ok ? null : (detail ?? null) });
    },
  };
}

async function runScenario(browser, origin, scenario, mutation) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const t = tally();
  let error = null;
  try {
    await preparePage(page, origin, mutation);
    await scenario.run(page, t);
  } catch (err) {
    error = err?.message ?? String(err);
    t.check(`${scenario.id} ran to the end`, false, error);
  } finally {
    await context.close().catch(() => {});
  }
  return { id: scenario.id, title: scenario.title, rows: t.rows, error };
}

function report(results, { quiet = false } = {}) {
  let passed = 0;
  let failed = 0;
  for (const r of results) {
    if (!quiet) console.log(`\n${r.title}`);
    for (const row of r.rows) {
      if (row.ok) passed += 1;
      else failed += 1;
      if (quiet) continue;
      console.log(`  ${row.ok ? 'ok  ' : 'FAIL'} ${row.name}${row.detail ? `\n         ${row.detail}` : ''}`);
    }
  }
  return { passed, failed };
}

async function withStack(fn) {
  const driver = resolveDriver();
  if (!driver) {
    prerequisiteFailure('puppeteer-core was not found.', [
      'It is deliberately not a dependency of this repository. Install it outside the tree:',
      '',
      '  mkdir ~/.mrt-scratch && cd ~/.mrt-scratch',
      '  npm init -y && npm i puppeteer-core',
      '',
      'or point MRT_PUPPETEER at an existing install:',
      '',
      '  MRT_PUPPETEER=/path/to/dir/containing/node_modules npm run browser',
    ]);
  }

  const edge = resolveEdge();
  if (!edge) {
    prerequisiteFailure('Microsoft Edge was not found.', [
      'The check drives the browser the app is actually used in. Set MRT_EDGE to its executable:',
      '',
      '  MRT_EDGE="C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" npm run browser',
    ]);
  }

  // existsSync is not enough for either. A scratch install that is partial or built for another
  // Node, and an Edge path that exists but will not execute, are both "the driver is not here"
  // answers wearing the costume of "the app is broken". Routing them to the same exit code as an
  // absent one is the whole point of keeping EXIT_PREREQ distinct from a failing assertion.
  let puppeteer;
  try {
    ({ default: puppeteer } = await import(pathToFileURL(driver).href));
  } catch (err) {
    prerequisiteFailure(`puppeteer-core was found at ${driver} but could not be loaded.`, [
      String(err?.message ?? err),
      '',
      'Reinstall it outside the tree, or point MRT_PUPPETEER at a working install.',
    ]);
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: edge,
      headless: !process.env.MRT_HEADED,
      args: ['--no-first-run', '--no-default-browser-check'],
    });
  } catch (err) {
    prerequisiteFailure(`Microsoft Edge was found at ${edge} but could not be launched.`, [
      String(err?.message ?? err),
      '',
      'Check that MRT_EDGE names the executable itself, not the directory holding it.',
    ]);
  }

  // Created only once the browser is up, so no exit path above can leave a listening socket
  // behind. Everything from here is covered by the finally.
  const server = createStaticServer();
  try {
    await new Promise((resolve) => server.listen(0, HOST, resolve));
    const origin = `http://${HOST}:${server.address().port}`;
    return await fn({ browser, origin, driver, edge });
  } finally {
    await browser.close().catch(() => {});
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

async function main() {
  const prove = process.argv.includes('--prove');
  const only = process.argv.find((a) => a.startsWith('--only='))?.slice('--only='.length) ?? null;

  const code = await withStack(async ({ browser, origin, driver, edge }) => {
    console.log(`driver  ${driver}`);
    console.log(`browser ${edge}`);
    console.log(`origin  ${origin}  (an ephemeral port, so the reading progress saved at :8787 is untouched)`);

    const scenarios = only ? SCENARIOS.filter((s) => s.id === only) : SCENARIOS;
    if (scenarios.length === 0) {
      console.error(`No scenario named ${only}. Known: ${SCENARIOS.map((s) => s.id).join(', ')}`);
      return 1;
    }

    const results = [];
    for (const scenario of scenarios) results.push(await runScenario(browser, origin, scenario, null));
    const { passed, failed } = report(results);
    console.log(`\n${passed} assertion(s) passed, ${failed} failed, across ${results.length} scenario(s)`);
    if (failed > 0) return 1;

    if (!prove) return 0;

    // The point of this pass is not that the mutations break something, it is that each one breaks
    // the scenario it is aimed at, on the assertion that carries the claim. A mutation that turns
    // nothing red means the scenario it was written for is not asserting what it claims to.
    //
    // Two of the ten redden every scenario, and that is not loose aim. Every scenario imports the
    // fixture order first, so a mutation of the import or of the write that import performs is
    // upstream of all of them by construction. What distinguishes aim is the named assertion that
    // fails in the aimed-at scenario, which is why it is printed rather than a bare scenario id.
    console.log('\nproving each scenario can fail:');
    let unproved = 0;
    for (const mutation of MUTATIONS) {
      const runs = [];
      for (const scenario of SCENARIOS) runs.push(await runScenario(browser, origin, scenario, mutation));
      report(runs, { quiet: true });
      const red = runs.filter((r) => r.rows.some((row) => !row.ok)).map((r) => r.id);
      const aimed = runs.find((r) => r.id === mutation.breaks);
      // The detail matters here and not in the ordinary report. Three of these mutations fail a
      // scenario by starving a wait rather than by failing a named claim, so the row name alone
      // reads as "it broke somehow". The detail says which wait went unanswered, which is the
      // difference between evidence and a green tick.
      const broke = (aimed?.rows ?? []).filter((row) => !row.ok)
        .map((row) => (row.detail ? `${row.name} (${row.detail})` : row.name));
      const caught = broke.length > 0;
      if (!caught) unproved += 1;
      console.log(`  ${caught ? 'ok  ' : 'FAIL'} ${mutation.id}: ${mutation.why}`);
      console.log(`         aimed at ${mutation.breaks}, where it breaks: ${broke.join('; ') || 'nothing'}`);
      console.log(`         also turns red: ${red.filter((id) => id !== mutation.breaks).join(', ') || 'nothing else'}`);
    }
    console.log(`\n${MUTATIONS.length - unproved}/${MUTATIONS.length} mutation(s) caught by the scenario they were aimed at`);
    return unproved === 0 ? 0 : 1;
  });

  process.exit(code);
}

// Without this an unexpected throw leaves an unhandled rejection, which Node reports as a bare
// stack and exits 1 on. Exit 1 is this check's word for "an assertion failed", so an internal
// fault would be read as a finding about the app.
main().catch((err) => {
  console.error(`\nThe check itself failed before it could report on the app:\n${err?.stack ?? err}`);
  process.exit(1);
});

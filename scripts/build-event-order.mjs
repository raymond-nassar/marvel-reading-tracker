// Build-time generation of event reading orders from Marvel's own series metadata.
//
// A Marvel event is published as a main series plus a set of mini-series and one-shots that
// Marvel itself branded with the event's name. Those series, read in the order they were
// published, are a reading order. That is what this script writes: it is a restatement of
// Marvel's catalogue, not an editorial curation of it, which is why the orders it produces can
// ship here without borrowing anyone else's work.
//
// It emits a markdown checklist per event into src/data/orders/. The checklist is committed, so
// the order arrives as a reviewable diff rather than as an opaque blob, and `npm run vendor`
// pins it exactly like any hand-written order. Running this again only ever changes the orders
// whose upstream metadata changed.
//
//   node scripts/build-event-order.mjs                  # every event
//   node scripts/build-event-order.mjs civil-war        # one event
//   node scripts/build-event-order.mjs --dry-run        # print, write nothing
//   node scripts/build-event-order.mjs --audit          # check the audit trail is complete, then build
//
// What it deliberately does NOT do: include crossover chapters published in ongoing titles that
// Marvel did not brand with the event name (Amazing Spider-Man #529-538 during Civil War, Venom
// #30-35 during King in Black). Those are a judgement call about which chapters of an unrelated
// run belong to an event, and this script does not make judgement calls. Each list says so.

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RateLimiter } from '../src/js/lib/limiter.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://marvel.emreparker.com/v1';
const ORDERS_DIR = join(ROOT, 'src', 'data', 'orders');

// Each event names the series Marvel branded with it, by id, because a name filter alone cannot
// tell an event apart from its own sequel, its facsimiles, its trade collections or its
// handbooks. `main` is the spine, used only to break ties between issues that shipped the same
// day so the main series is never read after the tie-in that reacts to it.
//
// `excluded` is the record of what the name filter matched and why it was rejected, so a future
// maintainer re-deriving a list can see that the omissions were decided rather than missed. It is
// not documentation: `--audit` re-runs the name filter against the live catalogue and fails if any
// series it matches is in neither list, because a record that claims to be complete and is not is
// the same failure as a reading order that is quietly missing issues.
export const EVENTS = [
  {
    id: 'house-of-m',
    name: 'House of M',
    file: 'house-of-m.md',
    main: 855,
    series: [
      855, // House of M (2005)
      875, // Spider-Man: House of M (2005)
      933, // Fantastic Four: House of M (2005)
      936, // Iron Man: House of M (2005)
      974, // Decimation: House of M - The Day After (2005)
    ],
    excluded: {
      'reference and primer books': [920],
      'published outside the event, as a later retrospective': [3065],
      'a different story of the same name': [19462, 20312, 42703, 5730, 7859],
      'trade collections': [1615, 28227],
      'What If?': [6376, 8949],
    },
  },
  {
    id: 'civil-war',
    name: 'Civil War',
    file: 'civil-war.md',
    main: 1067,
    series: [
      1067, // Civil War (2006 - 2007)
      1109, // Civil War: Front Line (2006 - 2007)
      1110, // Civil War: X-Men (2006)
      1114, // Civil War: Young Avengers & Runaways (2006)
      2316, // Civil War: Choosing Sides (2006)
      1150, // Civil War: War Crimes (2006)
      1158, // Civil War: The Return (2007)
      3904, // Civil War: The Confession (2007)
      1867, // Civil War: The Initiative (2007)
    ],
    excluded: {
      'reference and primer books': [1101, 1871],
      'a parody one-shot outside the main continuity': [1156],
      'Civil War II (2016), a different event': [
        21417, 21691, 21692, 20814, 21693, 21695, 22391, 21696, 20644, 22847, 22128, 21660, 21425,
      ],
      'facsimile reprints': [43627, 43628, 43629],
      'a 2020 retrospective one-shot, outside the 2006-2007 window': [27948],
      // Matches both this event's name filter and House of M's, so it has to be accounted for in
      // both maps: being excluded from one event says nothing about the other.
      'a 2008-2009 series set in the House of M reality, outside the window': [5730],
      'the Secret Wars (2015) Battleworld tie-in and its 2016 reissues': [19350, 20302, 20733, 20737],
      'film and all-ages adaptations': [21018, 21002, 21433, 21447, 23798],
      'trade collections': [2226, 2429, 2706, 2246, 8894],
      'What If?': [3914, 4592],
    },
  },
  {
    id: 'annihilation',
    name: 'Annihilation',
    file: 'annihilation.md',
    main: 3613,
    series: [
      1077, // Annihilation Prologue (2006)
      1078, // Annihilation: Silver Surfer (2006)
      1079, // Annihilation: Ronan (2006)
      1080, // Annihilation: Super-Skrull (2006)
      1081, // Annihilation: Nova (2006)
      3613, // Annihilation (2006 - 2007)
      1864, // Annihilation: Heralds of Galactus (2007)
    ],
    excluded: {
      'reference and primer books': [1115, 2211],
      'Annihilation: Conquest (2007), a sequel event that deserves its own list': [
        3061, 2420, 2524, 2532, 2541, 3454, 3272,
      ],
      'later stories of the same name': [27982, 27983, 27984, 27985, 27986, 28069, 28289, 39603, 32833, 32834],
      'True Believers reprints': [29512, 29513, 29514, 29515, 29516, 29517, 29518, 29519, 29520, 29521],
      'trade collections': [1971, 2436, 7561, 24212, 24256, 28016, 14726],
      'What If?': [3084],
    },
  },
  {
    id: 'secret-invasion',
    name: 'Secret Invasion',
    file: 'secret-invasion.md',
    main: 4423,
    series: [
      4423, // Secret Invasion (2008)
      5213, // Secret Invasion: Front Line (2008 - 2009)
      5352, // Secret Invasion: Inhumans (2008 - 2009)
      5364, // Secret Invasion: X-Men (2008)
      5362, // Secret Invasion: The Amazing Spider-Man (2008)
      4886, // Secret Invasion: Fantastic Four (2008)
      5046, // Secret Invasion: Runaways/Young Avengers (2008)
      5370, // Secret Invasion: Thor (2008 - 2009)
      5050, // Secret Invasion: Who Do You Trust? (2008)
      6391, // Secret Invasion: Dark Reign (2008)
      8249, // Secret Invasion: Requiem (2008)
    ],
    excluded: {
      'reference and primer books': [4017],
      'reprints of an issue already in the order': [5266],
      'a digital serial the metadata holds only one chapter of': [5109],
      'prologue and aftermath one-shots belonging to the events either side': [6595, 7216],
      'a different story of the same name': [25968, 33963],
      'trade collections': [31022, 33897, 33900, 36264, 6640, 7255],
      'What If? and all-ages adaptations': [8606, 4879, 6863],
    },
  },
  {
    id: 'king-in-black',
    name: 'King in Black',
    file: 'king-in-black.md',
    main: 30150,
    series: [
      30150, // King in Black (2020 - 2021)
      31379, // King in Black: Namor (2020 - 2021)
      31035, // Symbiote Spider-Man: King in Black (2020 - 2021)
      31388, // King in Black: Return of the Valkyries (2021)
      31380, // King in Black: Gwenom Vs. Carnage (2021)
      31384, // King in Black: Planet of the Symbiotes (2021)
      31385, // King in Black: Thunderbolts (2021)
      31376, // King in Black: Black Knight (2021)
      31377, // King in Black: Black Panther (2021)
      31378, // King in Black: Captain America (2021)
      31705, // King in Black: Ghost Rider (2021)
      31381, // King in Black: Immortal Hulk (2020)
      31382, // King in Black: Iron Man/Doom (2020)
      31383, // King in Black: Marauders (2021)
      31706, // King in Black: Scream (2021)
      31788, // King in Black: Spider-Man (2021)
      31547, // King in Black: Wiccan and Hulkling (2021)
    ],
    excluded: {
      'reference books': [30565],
      'trade collections and omnibuses': [34341, 30896, 30902],
      'a later story of the same name': [44948],
    },
  },
];

// A trade collection is a different kind of record from an issue, and Marvel says so in the URL:
// collections are /comics/collection/<id>/, issues are /comics/issue/<id>/. Filtering on this is
// what keeps `Black Panther: Civil War (Trade Paperback)` out of the Civil War order without
// anyone having to notice it by hand. It is also load-bearing for the vendor step, which can
// only resolve /comics/issue/ links and would otherwise pin a collection as a placeholder.
const ISSUE_URL = /^https:\/\/(?:www\.)?marvel\.com\/comics\/issue\/\d+(?:\/|$)/i;

const limiter = new RateLimiter();

async function getJson(url, attempt = 0) {
  return limiter.schedule(async () => {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    limiter.observe(res.headers);
    if (res.status === 429 || res.status >= 500) {
      if (attempt >= 5) throw new Error(`${res.status} after retries: ${url}`);
      const wait = limiter.backoff(attempt);
      limiter.penalize(wait);
      await new Promise((r) => setTimeout(r, wait));
      return getJson(url, attempt + 1);
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  });
}

// An issue with no on-sale date cannot be placed in a publication order, and a series that
// returns nothing usable means the metadata moved under us. Both are reported as failures rather
// than quietly shortening the list: a reading order that is missing issues nobody was told about
// is worse than no reading order.
async function seriesIssues(seriesId) {
  const body = await getJson(`${API}/series/${seriesId}/issues?limit=200`);
  const items = Array.isArray(body?.items) ? body.items : [];
  if (body?.has_next) {
    throw new Error(`series ${seriesId} has more than one page of issues; the fetch would be truncated`);
  }
  const kept = [];
  const undated = [];
  for (const item of items) {
    if (!ISSUE_URL.test(String(item?.detailUrl ?? ''))) continue; // a collection, not an issue
    if (!item.onSaleDate) {
      undated.push(item.title ?? `issue ${item.id}`);
      continue;
    }
    kept.push({
      id: item.id,
      title: String(item.title ?? '').trim(),
      url: item.detailUrl,
      onSale: String(item.onSaleDate).slice(0, 10),
      number: issueNumber(item),
      seriesId,
      seriesName: String(body.series_name ?? '').trim(),
    });
  }
  if (undated.length) {
    throw new Error(`series ${seriesId} has ${undated.length} issue(s) with no on-sale date: ${undated.join(', ')}`);
  }
  if (!kept.length) throw new Error(`series ${seriesId} returned no readable issues`);
  return kept;
}

function issueNumber(item) {
  const n = Number(item?.issueNumber);
  if (Number.isFinite(n)) return n;
  const m = /#\s*([0-9]+(?:\.[0-9]+)?)/.exec(String(item?.title ?? ''));
  return m ? Number(m[1]) : 0;
}

// --- completeness audit -----------------------------------------------------------------------
//
// Selection is by explicit id, so a series nobody listed is silently absent rather than visibly
// wrong. That makes `excluded` load-bearing: it is the claim that the omissions were decided. A
// claim that is not checked drifts, so this checks it -- it re-runs the name filter against the
// live catalogue and fails if any series the filter matches is in neither `series` nor `excluded`.
//
// It deliberately does not assert the reverse. The name filter cannot find series Marvel did not
// brand with the event name, and those crossover chapters are the known gap each list documents.
// This audits the record of the name filter, which is all the record ever claimed to be.

// Word-boundary containment on a punctuation-insensitive fold, so "Civil War" matches
// "Civil War: Front Line" and "Civil War II" (both must be accounted for) but not "Civil Warriors".
function fold(s) {
  return ` ${String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
}

function nameMatches(seriesName, eventName) {
  return fold(seriesName).includes(fold(eventName));
}

// PR #4 adds a byte-faithful src/data/series-index.json covering all 6,990 series; once that
// merges this check costs zero requests. Until then it pages the API, which is 35 requests at the
// maximum page size of 200 (limit=201 returns 422). Do not read the session-cache copy of this
// index: it lost characters to an encoding round-trip and is fit for choosing ids, nothing else.
async function allSeries() {
  try {
    const parsed = JSON.parse(await readFile(join(ROOT, 'src', 'data', 'series-index.json'), 'utf8'));
    const items = Array.isArray(parsed) ? parsed : parsed?.items;
    if (Array.isArray(items) && items.length) return { from: 'src/data/series-index.json', items };
  } catch {
    /* not merged yet -- page the API instead */
  }
  const items = [];
  for (let offset = 0; ; offset += 200) {
    const body = await getJson(`${API}/series?limit=200&offset=${offset}`);
    const page = Array.isArray(body?.items) ? body.items : [];
    items.push(...page);
    if (!body?.has_next || !page.length) break;
    if (items.length > 50000) throw new Error('series paging did not terminate');
  }
  return { from: `${API}/series`, items };
}

async function audit(targets) {
  const { from, items } = await allSeries();
  console.log(`audit: ${items.length} series from ${from}`);
  const problems = [];

  for (const event of targets) {
    const included = new Set(event.series);
    const excluded = new Set(Object.values(event.excluded).flat());
    for (const id of included) {
      if (excluded.has(id)) problems.push(`${event.id}: ${id} is listed as both included and excluded`);
    }
    const matched = items.filter((s) => nameMatches(s?.name, event.name));
    const missing = matched.filter((s) => !included.has(s.id) && !excluded.has(s.id));
    console.log(
      `  ${event.id.padEnd(16)} ${String(matched.length).padStart(3)} match "${event.name}"  ` +
        `${String(included.size).padStart(2)} included  ${String(excluded.size).padStart(3)} excluded  ` +
        `${missing.length} unaccounted`,
    );
    for (const s of missing) {
      problems.push(`${event.id}: ${s.id} ${s.name} (issueCount ${s.issueCount ?? '?'})`);
    }
  }

  if (problems.length) {
    throw new Error(
      `the audit trail is incomplete -- ${problems.length} series match an event name but are in ` +
        `neither its include list nor its excluded map:\n  ${problems.join('\n  ')}`,
    );
  }
  console.log('audit: every name-matching series is accounted for');
}

// Publication order, with the main series first when issues shipped on the same day. Marvel ships
// a week's worth of an event at once, and within that week the main series is the chapter the
// tie-ins react to, so reading it last would spoil itself. Series name and issue number then make
// the order total, so regenerating an unchanged event produces a byte-identical file.
function readingOrder(event, issues) {
  return [...issues].sort(
    (a, b) =>
      a.onSale.localeCompare(b.onSale) ||
      Number(b.seriesId === event.main) - Number(a.seriesId === event.main) ||
      a.seriesName.localeCompare(b.seriesName) ||
      a.number - b.number ||
      a.id - b.id,
  );
}

function escapeLinkText(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\]/g, '\\]');
}

function render(event, order) {
  const lines = [
    `# ${event.name} \u2014 Issue-by-Issue Reading Checklist`,
    '',
    'Generated by `scripts/build-event-order.mjs` from Marvel series metadata, in publication order.',
    'It covers the series Marvel branded with the event name; it does not include crossover chapters',
    'published in ongoing titles that carry no event branding. Edit the script, not this file.',
    '',
  ];
  let month = null;
  for (const item of order) {
    const m = item.onSale.slice(0, 7);
    if (m !== month) {
      if (month !== null) lines.push('');
      month = m;
    }
    lines.push(`- [ ] [${escapeLinkText(item.title)}](${item.url})`);
  }
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const wanted = argv.filter((a) => !a.startsWith('--'));
  for (const id of wanted) {
    // A typo would otherwise build nothing and look like a success.
    if (!EVENTS.some((e) => e.id === id)) {
      throw new Error(`"${id}" is not an event in this script; known ids: ${EVENTS.map((e) => e.id).join(', ')}`);
    }
  }
  const targets = wanted.length ? EVENTS.filter((e) => wanted.includes(e.id)) : EVENTS;

  if (argv.includes('--audit')) await audit(targets);

  for (const event of targets) {
    const issues = [];
    for (const seriesId of event.series) issues.push(...(await seriesIssues(seriesId)));
    const order = readingOrder(event, issues);

    const path = join(ORDERS_DIR, event.file);
    const text = render(event, order);
    let before = null;
    try {
      before = await readFile(path, 'utf8');
    } catch {
      /* first run for this event */
    }
    if (dryRun) {
      console.log(`${event.id}: ${order.length} issues from ${event.series.length} series (dry run, not written)`);
      continue;
    }
    await writeFile(path, text, 'utf8');
    const state = before === null ? 'created' : before === text ? 'unchanged' : 'updated';
    console.log(
      `${event.id}: ${order.length} issues from ${event.series.length} series -> src/data/orders/${event.file} (${state})`,
    );
  }

  if (!dryRun) console.log('\nNow run: npm run vendor -- --only=' + targets.map((e) => e.id).join(','));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

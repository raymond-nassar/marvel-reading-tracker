import test from 'node:test';
import assert from 'node:assert/strict';

import { WIKI_API, lookupIssue, searchUrl, wikitextUrl } from '../src/js/lib/wiki.js';

// Synthetic wikitext again, for the same licence reason as the parser's fixtures.
const ISSUE = `{{Marvel Database:Comic Template
| ReleaseDate = March 4, 2027
| Pages       = 32
| Writer1_1   = Ada Fictional
}}`;

const VOLUME = `{{Marvel Database:Volume Template
| Publisher = Marvel Comics
}}`;

function reply(body) {
  return { ok: true, status: 200, json: async () => body };
}

// A fetch that records what it was asked for and answers from a script, so the request shape can
// be held to a rule without a network.
function recorder(replies) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    const next = replies[calls.length - 1];
    if (!next) throw new Error(`unscripted request ${calls.length}`);
    return next;
  };
  return { calls, fetchImpl };
}

const searchHits = (...titles) => reply({ query: { search: titles.map((title) => ({ title })) } });

const pages = (entries) => reply({
  query: {
    pages: Object.fromEntries(entries.map(([title, text], i) => [
      String(i + 1),
      { title, revisions: [{ slots: { main: { '*': text } } }] },
    ])),
  },
});

test('every request asks for a cross-origin read, which is what makes the answer readable', () => {
  assert.match(searchUrl('Invented Comic 1'), /[?&]origin=\*(&|$)/);
  assert.match(wikitextUrl(['Invented Comic Vol 1 1']), /[?&]origin=\*(&|$)/);
});

test('the search is scoped to article space and to one phrase', () => {
  const params = new URL(searchUrl('Invented Comic 1')).searchParams;
  assert.equal(params.get('srnamespace'), '0');
  assert.equal(params.get('srsearch'), 'Invented Comic 1');
  assert.equal(params.get('list'), 'search');
});

test('the request carries the typed words and nothing else about the reader', () => {
  const url = new URL(searchUrl('Invented Comic 1'));
  assert.equal(`${url.origin}${url.pathname}`, WIKI_API);
  // The parameter names are fixed. A new one is how a request would start carrying something the
  // disclosure beside the button does not mention.
  assert.deepEqual([...url.searchParams.keys()].sort(), [
    'action', 'format', 'list', 'origin', 'srlimit', 'srnamespace', 'srsearch',
  ]);
  // And every value is either a constant of this module or the phrase itself.
  const constants = new Set(['query', 'json', '*', 'search', '6', '0']);
  for (const [key, value] of url.searchParams) {
    if (key === 'srsearch') continue;
    assert.equal(constants.has(value), true, `${key}=${value} is neither fixed nor the phrase`);
  }
});

test('the candidates are fetched in one request rather than one each', async () => {
  const titles = ['Invented Comic Vol 1 1', 'Invented Comic Vol 1 2', 'Invented Comic Vol 1 3'];
  const url = new URL(wikitextUrl(titles));
  assert.equal(url.searchParams.get('titles'), titles.join('|'));
  assert.equal(url.searchParams.get('rvslots'), '*');

  const { calls, fetchImpl } = recorder([
    searchHits(...titles),
    pages(titles.map((title) => [title, ISSUE])),
  ]);
  await lookupIssue('Invented Comic', { fetchImpl });
  assert.equal(calls.length, 2);
});

test('no cookies and no referrer go to the wiki', async () => {
  const { calls, fetchImpl } = recorder([
    searchHits('Invented Comic Vol 1 1'),
    pages([['Invented Comic Vol 1 1', ISSUE]]),
  ]);
  await lookupIssue('Invented Comic', { fetchImpl });
  for (const { options } of calls) {
    assert.equal(options.credentials, 'omit');
    assert.equal(options.referrerPolicy, 'no-referrer');
    assert.equal(options.cache, 'no-store');
  }
});

test('an empty box asks nobody anything', async () => {
  const { calls, fetchImpl } = recorder([]);
  assert.deepEqual(await lookupIssue('   ', { fetchImpl }), []);
  assert.equal(calls.length, 0);
});

test('a search that finds nothing does not go on to ask for wikitext', async () => {
  const { calls, fetchImpl } = recorder([reply({ query: { search: [] } })]);
  assert.deepEqual(await lookupIssue('Invented Comic', { fetchImpl }), []);
  assert.equal(calls.length, 1);
});

test('a series page among the results is dropped, because it cannot be added as an issue', async () => {
  const { fetchImpl } = recorder([
    searchHits('Invented Comic Vol 1', 'Invented Comic Vol 1 1'),
    pages([['Invented Comic Vol 1', VOLUME], ['Invented Comic Vol 1 1', ISSUE]]),
  ]);
  const found = await lookupIssue('Invented Comic', { fetchImpl });
  assert.deepEqual(found.map((c) => c.title), ['Invented Comic Vol 1 1']);
  assert.equal(found[0].onSale, '2027-03-04');
  assert.equal(found[0].pageCount, 32);
  assert.equal(found[0].seriesName, 'Invented Comic Vol 1');
});

test('candidates keep the search ranking, which is the only signal about which was meant', async () => {
  const { fetchImpl } = recorder([
    searchHits('Invented Comic Vol 1 3', 'Invented Comic Vol 1 1'),
    // Answered in the other order, as MediaWiki is free to do.
    pages([['Invented Comic Vol 1 1', ISSUE], ['Invented Comic Vol 1 3', ISSUE]]),
  ]);
  const found = await lookupIssue('Invented Comic', { fetchImpl });
  assert.deepEqual(found.map((c) => c.title), ['Invented Comic Vol 1 3', 'Invented Comic Vol 1 1']);
});

test('a page answered under a normalized title is still matched to the candidate', async () => {
  const { fetchImpl } = recorder([
    searchHits('Invented Comic Vol 1 1'),
    reply({
      query: {
        normalized: [{ from: 'Invented Comic Vol 1 1', to: 'Invented comic Vol 1 1' }],
        pages: { 1: { title: 'Invented comic Vol 1 1', revisions: [{ slots: { main: { '*': ISSUE } } }] } },
      },
    }),
  ]);
  const found = await lookupIssue('Invented Comic', { fetchImpl });
  assert.equal(found.length, 1);
});

test('a wiki that answers with an error status raises rather than reporting no matches', async () => {
  const { fetchImpl } = recorder([{ ok: false, status: 503, json: async () => ({}) }]);
  await assert.rejects(lookupIssue('Invented Comic', { fetchImpl }), /503/);
});

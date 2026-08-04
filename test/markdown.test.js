import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseChecklist, parseTitleList, serializeChecklist, issueIdFromUrl,
  isSafeMarvelUrl, normalizeTitle, resolveUniqueExact, stripInlineMarkdown,
} from '../src/js/lib/markdown.js';

test('parses the upstream checklist format', () => {
  const { entries } = parseChecklist(
    '- [ ] [Secret Warriors (2009) #1](https://www.marvel.com/comics/issue/23648/secret_warriors_2009_1)',
  );
  assert.equal(entries.length, 1);
  assert.equal(entries[0].issueId, 23648);
  assert.equal(entries[0].title, 'Secret Warriors (2009) #1');
  assert.equal(entries[0].read, false);
});

test('- [x] imports as already read, in either case', () => {
  const { entries } = parseChecklist([
    '- [x] [A](https://www.marvel.com/comics/issue/1/a)',
    '- [X] [B](https://www.marvel.com/comics/issue/2/b)',
    '- [ ] [C](https://www.marvel.com/comics/issue/3/c)',
  ].join('\n'));
  assert.deepEqual(entries.map((e) => e.read), [true, true, false]);
});

test('collects headings and uses them as list-name candidates', () => {
  const { headings } = parseChecklist('# Hickman to Secret Wars\n\n## Phase one\n- [ ] x');
  assert.deepEqual(headings, ['Hickman to Secret Wars', 'Phase one']);
});

test('lines without a Marvel issue link are surfaced, never dropped', () => {
  const { entries, unresolved } = parseChecklist([
    '- [ ] [Good](https://www.marvel.com/comics/issue/5/good)',
    '- [ ] Some Comic Nobody Linked',
    '- [x] [Offsite](https://example.com/whatever)',
  ].join('\n'));

  assert.equal(entries.length, 1);
  assert.equal(unresolved.length, 2);
  assert.equal(unresolved[0].title, 'Some Comic Nobody Linked');
  assert.equal(unresolved[1].read, true, 'read state must survive so it is not silently lost');
  assert.equal(unresolved[1].url, null, 'a non-Marvel URL must not be carried through');
});

test('accepts bullets, asterisks, indentation and non-breaking spaces', () => {
  const { entries } = parseChecklist([
    '  - [ ] [A](https://www.marvel.com/comics/issue/1/a)',
    '* [ ] [B](https://www.marvel.com/comics/issue/2/b)',
    '-\u00a0[ ] [C](https://www.marvel.com/comics/issue/3/c)',
    '- [D](https://www.marvel.com/comics/issue/4/d)',
  ].join('\n'));
  assert.deepEqual(entries.map((e) => e.issueId), [1, 2, 3, 4]);
});

test('ignores prose and blank lines', () => {
  const { entries, unresolved } = parseChecklist('Just a sentence.\n\n\nAnother one.');
  assert.equal(entries.length, 0);
  assert.equal(unresolved.length, 0);
});

test('issueIdFromUrl accepts real shapes and rejects lookalikes', () => {
  assert.equal(issueIdFromUrl('https://www.marvel.com/comics/issue/52447/slug'), 52447);
  assert.equal(issueIdFromUrl('http://marvel.com/comics/issue/1/'), 1);
  assert.equal(issueIdFromUrl('https://www.marvel.com/comics/issue/99'), 99);
  assert.equal(issueIdFromUrl('https://evil.com/comics/issue/1/x'), null);
  assert.equal(issueIdFromUrl('https://www.marvel.com.evil.com/comics/issue/1/x'), null);
  assert.equal(issueIdFromUrl('not a url'), null);
  assert.equal(issueIdFromUrl(null), null);
});

test('isSafeMarvelUrl rejects other hosts and dangerous schemes', () => {
  assert.ok(isSafeMarvelUrl('https://www.marvel.com/comics/issue/1/x'));
  assert.ok(isSafeMarvelUrl('https://read.marvel.com/#/book/123'));
  assert.equal(isSafeMarvelUrl('javascript:alert(1)'), false);
  assert.equal(isSafeMarvelUrl('data:text/html,<script>'), false);
  assert.equal(isSafeMarvelUrl('https://marvel.com.attacker.net/'), false);
  assert.equal(isSafeMarvelUrl('https://notmarvel.com/'), false);
});

test('serialize then parse is lossless for id, title and read state', () => {
  const items = [
    { issueId: 1, title: 'One', url: 'https://www.marvel.com/comics/issue/1/one', read: true },
    { issueId: 2, title: 'Two', url: 'https://www.marvel.com/comics/issue/2/two', read: false },
  ];
  const { entries } = parseChecklist(serializeChecklist({ name: 'L', description: 'D', items }));
  assert.deepEqual(
    entries.map((e) => ({ issueId: e.issueId, title: e.title, read: e.read })),
    items.map((i) => ({ issueId: i.issueId, title: i.title, read: i.read })),
  );
});

test('serializer escapes brackets so titles cannot break the link syntax', () => {
  const md = serializeChecklist({
    name: 'x',
    items: [{ issueId: 1, title: 'Weird ] Title', url: 'https://www.marvel.com/comics/issue/1/x', read: false }],
  });
  const { entries } = parseChecklist(md);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].issueId, 1);
});

test('serializer emits a usable URL when only an id is known', () => {
  const md = serializeChecklist({ name: 'x', items: [{ issueId: 42, title: 'Forty Two', read: false }] });
  assert.match(md, /https:\/\/www\.marvel\.com\/comics\/issue\/42\//);
});

test('parseTitleList strips bullets and checkboxes', () => {
  const out = parseTitleList('- [x] Read One\n* Two\nThree\n\n');
  assert.deepEqual(out, [
    { title: 'Read One', read: true },
    { title: 'Two', read: false },
    { title: 'Three', read: false },
  ]);
});

test('stripInlineMarkdown keeps link text and drops emphasis', () => {
  assert.equal(stripInlineMarkdown('**Bold** and [linked](http://x)'), 'Bold and linked');
});

test('normalizeTitle folds punctuation, case and ampersands', () => {
  assert.equal(normalizeTitle('The Avengers (2012) #1'), normalizeTitle('the  avengers 2012 1'));
  assert.equal(normalizeTitle('Cloak & Dagger'), normalizeTitle('Cloak and Dagger'));
  assert.equal(normalizeTitle('Spider\u2019s Web'), normalizeTitle("Spider's Web"));
});

test('resolveUniqueExact auto-accepts only a single exact match', () => {
  const one = resolveUniqueExact('Avengers (2012) #1', [
    { title: 'Avengers (2012) #1', issueId: 1 },
    { title: 'Avengers (2012) #10', issueId: 2 },
  ]);
  assert.equal(one.status, 'resolved');
  assert.equal(one.match.issueId, 1);

  const many = resolveUniqueExact('Avengers (2012) #1', [
    { title: 'Avengers (2012) #1', issueId: 1 },
    { title: 'Avengers (2012) #1', issueId: 9 },
  ]);
  assert.equal(many.status, 'ambiguous', 'duplicates must never auto-resolve');

  assert.equal(resolveUniqueExact('Nope', [{ title: 'Other' }]).status, 'unmatched');
  assert.equal(resolveUniqueExact('', [{ title: 'x' }]).status, 'ambiguous');
  assert.equal(resolveUniqueExact('x', []).status, 'unmatched');
});

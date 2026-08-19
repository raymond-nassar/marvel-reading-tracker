import test from 'node:test';
import assert from 'node:assert/strict';

import {
  cleanValue,
  credits,
  isVolumePage,
  issueFacts,
  releaseDateToIso,
  splitFields,
  templateBody,
  titleParts,
} from '../src/js/lib/wikitext.js';

// Every fixture below is written here, using the field names a real page uses and values that are
// invented. Wiki prose is CC BY-SA and share-alike, so copying a real page into this repository
// would attach that licence to the tree. The parser only ever sees field names anyway, so a
// fixture made of invented values exercises it exactly as a real page would.
const ISSUE = `{{Marvel Database:Comic Template
| Image1            = Invented Comic Vol 1 1.jpg
| Image1_Text       = A cover that does not exist
| Image1_Artist1    = Nobody Atall
| Month             = 2
| Year              = 2027
| ReleaseDate       = March 4, 2027
| Pages             = 32
| Rating            = Rated T
| OriginalPrice     = 4.99
| MarvelUnlimitedID = 999999
| Quotation         = A line of dialogue that belongs to the wiki.
| Speaker           = Someone Invented
| Appearing1        = {{a|[[Someone Invented (Earth-000)|Someone]]}} and {{a|[[Another One]]}}
| StoryTitle1       = The First Invented Story
| Writer1_1         = [[Ada Fictional]]
| Writer1_2         = Bo Imaginary <!--credited as B. Imaginary-->
| Penciler1_1       = [[Cal Notreal|Cal N.]]
| Inker1_1          =
| Colorist1_1       = '''Dee Pretend'''
| Letterer1_1       = Eli Madeup
| Editor1_1         = Fay Invented
| StoryTitle2       = The Second Invented Story
| Writer2_1         = Ada Fictional
| Penciler2_1       = Gus Fabricated
| Editor2_1         = Fay Invented
| Editor-in-Chief   = Hal Pretend
}}
'''Prose the wiki holds, which nothing here reads.'''`;

const VOLUME = `{{Marvel Database:Volume Template
| Image     = Invented Comic Vol 1.jpg
| Publisher = Marvel Comics
| Years     = 2027
}}`;

const facts = () => issueFacts(ISSUE, 'Invented Comic Vol 1 1');

test('a series page is not an issue page, so it yields no facts', () => {
  assert.equal(isVolumePage(VOLUME), true);
  assert.equal(isVolumePage(ISSUE), false);
  assert.equal(issueFacts(VOLUME, 'Invented Comic Vol 1'), null);
});

test('the release date becomes an ISO date, which is what the app stores', () => {
  assert.equal(facts().onSale, '2027-03-04');
});

test('a date written as links reads the same once the links are resolved', () => {
  assert.equal(releaseDateToIso('[[March 4]], [[2027]]'), '2027-03-04');
});

test('an ISO date is passed through, and anything unrecognised is refused rather than guessed', () => {
  assert.equal(releaseDateToIso('2027-03-04'), '2027-03-04');
  assert.equal(releaseDateToIso('Sometime in spring'), null);
  assert.equal(releaseDateToIso('Marchtember 4, 2027'), null);
  assert.equal(releaseDateToIso('March 44, 2027'), null);
  assert.equal(releaseDateToIso(''), null);
});

test('the page count is a number', () => {
  assert.equal(facts().pageCount, 32);
});

test('a page with no page count reports null rather than NaN', () => {
  const without = issueFacts(ISSUE.replace('| Pages             = 32\n', ''), 'Invented Comic Vol 1 1');
  assert.equal(without.pageCount, null);
});

test('credits are collected across every story and each person appears once', () => {
  const names = facts().creators.map((c) => `${c.role}:${c.name}`);
  assert.deepEqual(names, [
    'writer:Ada Fictional',
    'writer:Bo Imaginary',
    'penciler:Cal N.',
    'colorist:Dee Pretend',
    'letterer:Eli Madeup',
    'editor:Fay Invented',
    'penciler:Gus Fabricated',
  ]);
});

test('an empty credit contributes nobody', () => {
  assert.equal(facts().creators.some((c) => c.role === 'inker'), false);
});

test('the cover artist and the editor in chief are not the creative team', () => {
  const names = facts().creators.map((c) => c.name);
  assert.equal(names.includes('Nobody Atall'), false);
  assert.equal(names.includes('Hal Pretend'), false);
});

test('nothing outside the allowlist is extracted, so wiki prose cannot arrive', () => {
  const carried = JSON.stringify(facts());
  for (const prose of ['dialogue', 'Someone Invented', 'Another One', 'Invented Story', '4.99']) {
    assert.equal(carried.includes(prose), false, `${prose} reached the caller`);
  }
});

test('Marvel\u2019s own issue id is read, because it builds the official page for the comic', () => {
  assert.equal(facts().marvelIssueId, 999999);
});

test('an issue id that is not plainly a number is refused rather than half read', () => {
  const cases = ['', 'unknown', '12a', '1 to 5', '-3', '0', 'TBC'];
  for (const bad of cases) {
    const page = ISSUE.replace('| MarvelUnlimitedID = 999999', `| MarvelUnlimitedID = ${bad}`);
    assert.equal(issueFacts(page, 'Invented Comic Vol 1 1').marvelIssueId, null, `accepted ${bad || 'an empty value'}`);
  }
});

test('a pipe inside a nested template or link does not end the field', () => {
  const fields = splitFields(templateBody(ISSUE, 'Marvel Database:Comic Template'));
  assert.equal(fields.has('Appearing1'), true);
  assert.match(fields.get('Appearing1'), /Another One/);
  // The field after the nested one is still a field, which is what a naive split loses.
  assert.equal(fields.has('StoryTitle1'), true);
});

test('a value keeps the display half of a link and loses the markup around it', () => {
  assert.equal(cleanValue('[[Cal Notreal|Cal N.]]'), 'Cal N.');
  assert.equal(cleanValue('[[Ada Fictional]]'), 'Ada Fictional');
  assert.equal(cleanValue("'''Dee Pretend'''"), 'Dee Pretend');
  assert.equal(cleanValue('Bo Imaginary <!--credited as B. Imaginary-->'), 'Bo Imaginary');
  assert.equal(cleanValue('Eli Madeup<ref name="x">A note</ref>'), 'Eli Madeup');
  assert.equal(cleanValue('{{a|Only markup}}'), '');
});

test('a title carrying the volume marker splits into series and number', () => {
  assert.deepEqual(titleParts('X-Men Vol 7 26'), { seriesName: 'X-Men Vol 7', number: '26' });
  assert.deepEqual(titleParts('Amazing Spider-Man Annual Vol 1 1'), {
    seriesName: 'Amazing Spider-Man Annual Vol 1',
    number: '1',
  });
});

test('a title without the volume marker gives two nulls rather than half a guess', () => {
  assert.deepEqual(titleParts('Amazing Spider-Man 2026 annual'), { seriesName: null, number: null });
  assert.deepEqual(titleParts(''), { seriesName: null, number: null });
});

test('an unclosed template is refused, so a truncated page cannot invent fields', () => {
  const truncated = ISSUE.slice(0, ISSUE.indexOf('| Editor-in-Chief'));
  assert.equal(templateBody(truncated, 'Marvel Database:Comic Template'), null);
  assert.equal(issueFacts(truncated, 'Invented Comic Vol 1 1'), null);
});

test('a page with no comic template at all yields nothing', () => {
  assert.equal(issueFacts('Just some text.', 'Invented Comic Vol 1 1'), null);
  assert.deepEqual(credits(new Map()), []);
});

test('a repeated field takes the last value, as the wiki itself does', () => {
  const twice = ISSUE.replace('| Rating            = Rated T', '| Pages             = 48');
  assert.equal(issueFacts(twice, 'Invented Comic Vol 1 1').pageCount, 48);
});

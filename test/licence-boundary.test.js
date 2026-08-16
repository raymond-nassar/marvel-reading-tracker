import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const catalogUrl = new URL('../src/data/catalog.json', import.meta.url);

async function shippedOrders() {
  const catalog = JSON.parse(await readFile(catalogUrl, 'utf8'));
  const out = [];
  for (const list of catalog.lists) {
    out.push({ file: list.file, order: JSON.parse(await readFile(new URL(`../src/data/${list.file}`, import.meta.url), 'utf8')) });
  }
  return out;
}

// The licence boundary is a property of the committed bytes, so it is checked against the committed
// bytes rather than against the script that writes them. A future vendoring run, a hand edit or a
// restored backup can all put the field back, and only this notices.
//
// The field is Marvel's own prose reproduced verbatim, which is what separates it from every other
// copied field: an id, a title, a number, a date, a series and a link are all facts about a
// publication. 798 of 1,473 records carried one, 151,840 characters in all, and the provenance
// record named it as the field to look at hardest. Removing it cost one sentence on one screen.
test('no shipped reading order carries Marvel description prose', async () => {
  const orders = await shippedOrders();
  assert.ok(orders.length > 0, 'no orders were read, so this test proves nothing');

  const offenders = [];
  let items = 0;
  for (const { file, order } of orders) {
    for (const item of order.items) {
      items += 1;
      assert.ok('description' in item, `${file}: ${item.issueId} is missing the description key`);
      if (item.description !== null) offenders.push(`${file}: ${item.issueId} carries ${JSON.stringify(item.description).slice(0, 60)}`);
    }
  }

  assert.ok(items > 1000, `only ${items} items were checked, so the data tree is not what this test thinks it is`);
  assert.deepEqual(offenders, [], `Marvel description prose is committed again in ${offenders.length} record(s)`);
});

// The strip above is one edit away from a silent product regression, because the order carries a
// description of its own with the same field name. That one is editorial copy written here, it is
// what the catalog shows a reader and what catalog search matches on, and it must survive.
test('every shipped order keeps its own editorial description', async () => {
  const orders = await shippedOrders();
  for (const { file, order } of orders) {
    assert.equal(typeof order.description, 'string', `${file} lost its own description`);
    assert.ok(order.description.length > 40, `${file} has a description too short to be the editorial one`);
  }
});

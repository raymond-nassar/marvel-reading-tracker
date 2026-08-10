// The render paths BL-033 changed, exercised rather than scanned.
//
// Until BL-064 these were covered by source-text tests in test/library.test.js, which matched
// the shape of the code rather than what it does. BL-033's own block says why that was
// unsatisfying: all six mutations tried against them changed exactly the text the scans read,
// so passing was close to tautological. These call the functions.
import test from 'node:test';
import assert from 'node:assert/strict';

import { commitRows, rowCacheKey } from '../src/js/main.js';

// The smallest node that commitRows actually uses: childNodes, remove() and insertBefore().
// A DOM implementation would do, but nothing here needs one, which is the point.
function container(children = []) {
  const box = {
    childNodes: [...children],
    insertBefore(node, ref) {
      const from = this.childNodes.indexOf(node);
      if (from !== -1) this.childNodes.splice(from, 1);
      const at = ref === null ? this.childNodes.length : this.childNodes.indexOf(ref);
      this.childNodes.splice(at === -1 ? this.childNodes.length : at, 0, node);
      return node;
    },
  };
  for (const child of box.childNodes) child.parent = box;
  return box;
}

function row(name) {
  const node = { name, parent: null };
  node.remove = function remove() {
    if (!this.parent) return;
    const at = this.parent.childNodes.indexOf(this);
    if (at !== -1) this.parent.childNodes.splice(at, 1);
    this.parent = null;
  };
  return node;
}

const names = (box) => box.childNodes.map((n) => n.name);

test('commitRows leaves a list that is already correct completely alone', () => {
  const [a, b, c] = [row('a'), row('b'), row('c')];
  const box = container([a, b, c]);
  let moves = 0;
  const insertBefore = box.insertBefore.bind(box);
  box.insertBefore = (node, ref) => { moves += 1; return insertBefore(node, ref); };

  commitRows(box, [a, b, c]);

  assert.deepEqual(names(box), ['a', 'b', 'c']);
  assert.equal(moves, 0, 'an unchanged order must not touch the tree at all');
});

test('commitRows removes what the new order does not ask for', () => {
  const [a, b, c] = [row('a'), row('b'), row('c')];
  const box = container([a, b, c]);

  commitRows(box, [a, c]);

  assert.deepEqual(names(box), ['a', 'c']);
  assert.equal(b.parent, null, 'the dropped row must be detached, not merely skipped');
});

test('commitRows adds a new row in the position the order gives it', () => {
  const [a, c] = [row('a'), row('c')];
  const box = container([a, c]);
  const b = row('b');

  commitRows(box, [a, b, c]);

  assert.deepEqual(names(box), ['a', 'b', 'c']);
});

// This is the defect BL-033's block records: the first version placed before it dropped, which
// left the stale node in front of the reused ones, shifted every later index by one, and turned
// one rebuilt row into a move of all the rest. It scored 217 of 219 rows reused and still
// churned 219 nodes. Ordering is the whole of the fix, so the test counts moves rather than
// only checking the result, because the wrong order still arrives at the right list.
test('commitRows drops before it places, so one replaced row costs one move', () => {
  const rows = ['a', 'b', 'c', 'd', 'e'].map(row);
  const box = container(rows);
  let moves = 0;
  const insertBefore = box.insertBefore.bind(box);
  box.insertBefore = (node, ref) => { moves += 1; return insertBefore(node, ref); };

  // 'a' is rebuilt; the other four are reused untouched.
  const fresh = row('a2');
  commitRows(box, [fresh, ...rows.slice(1)]);

  assert.deepEqual(names(box), ['a2', 'b', 'c', 'd', 'e']);
  assert.equal(moves, 1, 'placing before dropping would move every later row as well');
});

test('commitRows reorders a reused row without rebuilding it', () => {
  const rows = ['a', 'b', 'c'].map(row);
  const box = container(rows);
  const [a, b, c] = rows;

  commitRows(box, [c, a, b]);

  assert.deepEqual(names(box), ['c', 'a', 'b']);
  assert.equal(box.childNodes[0], c, 'the moved node must be the same object, not a copy');
});

test('commitRows empties a container when the order asks for nothing', () => {
  const rows = ['a', 'b'].map(row);
  const box = container(rows);

  commitRows(box, []);

  assert.deepEqual(names(box), []);
});

// The key is the whole item, which is what stops a field being left out of an enumerated list
// and silently freezing a row. Changing any field at all has to change the key.
test('the row cache key changes when any field of the item changes', () => {
  const item = { issueId: 1, read: false, title: 'One', date: '2025-01-01' };
  const base = rowCacheKey(item, 9, '2025-06-01');

  for (const [field, value] of [['read', true], ['title', 'Two'], ['date', '2025-02-02']]) {
    const changed = rowCacheKey({ ...item, [field]: value }, 9, '2025-06-01');
    assert.notEqual(changed, base, `changing ${field} must invalidate the cached row`);
  }
});

test('the row cache key changes when the row becomes the one up next', () => {
  const item = { issueId: 1, read: false };
  assert.notEqual(rowCacheKey(item, 1, '2025-06-01'), rowCacheKey(item, 9, '2025-06-01'));
});

// The midnight bug, which the BL-033 review found after the first pass asserted currentId was
// the only input outside the item. availability() and describe() both default `today` to the
// local day at call time, and it is date > today that decides between "soon scheduled" and
// "MU Unlimited", so a tab left open across local midnight reused yesterday's row for good.
test('the row cache key changes when the day changes under an open tab', () => {
  const item = { issueId: 1, read: false, date: '2025-06-02' };
  assert.notEqual(rowCacheKey(item, 9, '2025-06-01'), rowCacheKey(item, 9, '2025-06-02'));
});

test('the row cache key is stable when nothing has changed', () => {
  const item = { issueId: 1, read: false, title: 'One' };
  assert.equal(rowCacheKey(item, 9, '2025-06-01'), rowCacheKey({ ...item }, 9, '2025-06-01'));
});

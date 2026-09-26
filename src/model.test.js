import test from "node:test";
import assert from "node:assert/strict";
import {
  SIZE,
  makeSeed,
  paint,
  replaceColor,
  validatePattern,
  countStitches,
} from "./model.js";

test("save and reopen preserves every stitch", () => {
  const original = paint(makeSeed(), 0, 6);
  const reopened = validatePattern(JSON.parse(JSON.stringify(original)));
  assert.deepEqual(reopened, original);
  assert.equal(reopened.cells.length, SIZE * SIZE);
});

test("invalid palette index rejects an import without mutating current pattern", () => {
  const current = makeSeed();
  const invalid = JSON.parse(JSON.stringify(current));
  invalid.cells[0] = 8;
  assert.throws(() => validatePattern(invalid), /invalid stitches/);
  assert.equal(current.cells[0], -1);
});

test("replace changes only the selected color and stitch count follows", () => {
  const before = makeSeed();
  const after = replaceColor(before, 1, 2);
  before.cells.forEach((color, index) =>
    assert.equal(after.cells[index], color === 1 ? 2 : color),
  );
  const counts = countStitches(after);
  assert.equal(counts[1], 0);
  assert.equal(
    counts.reduce((sum, n) => sum + n, 0),
    after.cells.filter((c) => c >= 0).length,
  );
});

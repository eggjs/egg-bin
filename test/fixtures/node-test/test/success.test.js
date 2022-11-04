let test;
try {
  test = require('node:test');
} catch {
  test = require('test');
}
const assert = require('assert');

test('synchronous passing test', () => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(1, 1);
});

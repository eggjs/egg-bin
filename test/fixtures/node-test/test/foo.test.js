'use strict';

let test;
try {
  test = require('node:test');
} catch {
  test = require('test');
}
const assert = require('assert');
const utils = require('../utils');

test('node-test subtest 1', async t => {
  await t.test('should work', () => {
    assert(true);
  });

  await t.test('should fail', () => {
    assert(1 === 0);
  });
});

test('node-test subtest 2', async t => {
  await t.test('should work', () => {
    assert(true);
  });

  await t.test('should fail', () => {
    assert(1 === 0);
  });
});

test('synchronous passing test', () => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(utils.foo(), 'bar');
});

test('synchronous failing test', () => {
  // This test fails because it throws an exception.
  assert.strictEqual(1, 2);
});

test('asynchronous passing test', async () => {
  // This test passes because the Promise returned by the async
  // function is not rejected.
  assert.strictEqual(1, 1);
});

test('asynchronous failing test', async () => {
  // This test fails because the Promise returned by the async
  // function is rejected.
  assert.strictEqual(1, 2);
});

test('failing test using Promises', () => {
  // Promises can be used directly as well.
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      reject(new Error('this will cause the test to fail'));
    });
  });
});

test('callback passing test', (_, done) => {
  // done() is the callback function. When the setImmediate() runs, it invokes
  // done() with no arguments.
  setImmediate(done);
});

test('callback failing test', (_, done) => {
  // When the setImmediate() runs, done() is invoked with an Error object and
  // the test fails.
  setImmediate(() => {
    done(new Error('callback failure'));
  });
});

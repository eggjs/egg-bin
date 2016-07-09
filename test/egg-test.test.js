'use strict';

const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const mm = require('mm');

describe('egg-bin test', () => {
  const eggBin = require.resolve('../bin/egg-bin.js');

  afterEach(mm.restore);

  it('should success', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, ['test'], {
      cwd: path.join(__dirname, 'fixtures/test-files'),
    })
    .expect('stdout', /✓ should success/)
    .expect('stdout', /a.test.js/)
    .expect('stdout', /b\/b.test.js/)
    .expect('code', 0)
    .end((err, res) => {
      assert.ifError(err);
      assert.ok(!/a.js/.test(res.stdout));
      done();
    });
  });

  it('should only test files specified by TESTS', done => {
    mm(process.env, 'TESTS', 'test/a.test.js');
    coffee.fork(eggBin, ['test'], {
      cwd: path.join(__dirname, 'fixtures/test-files'),
    })
    .expect('stdout', /✓ should success/)
    .expect('stdout', /a.test.js/)
    .expect('code', 0)
    .end((err, res) => {
      assert.ifError(err);
      assert.ok(!/b\/b.test.js/.test(res.stdout));
      done();
    });
  });

  it('should use process.env.TEST_REPORTER', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    mm(process.env, 'TEST_REPORTER', 'dot');
    coffee.fork(eggBin, ['test'], {
      cwd: path.join(__dirname, 'fixtures/test-files'),
    })
    .expect('stdout', /\․\․\n/)
    .expect('code', 0)
    .end((err, res) => {
      assert.ifError(err);
      assert.ok(!/b\/b.test.js/.test(res.stdout));
      done();
    });
  });

  it('should use process.env.TEST_TIMEOUT', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    mm(process.env, 'TEST_TIMEOUT', '60000');
    coffee.fork(eggBin, ['test'], {
      cwd: path.join(__dirname, 'fixtures/test-files'),
    })
    .expect('stdout', /✓ should success/)
    .expect('code', 0)
    .end(done);
  });

  it.skip('should check node dependencies fail', done => {
    coffee.fork(eggBin, ['test'], {
      cwd: path.join(__dirname, 'fixtures/check-deps-fail'),
    })
    .expect('stderr', /AssertionError: /)
    .expect('code', 1)
    .end(done);
  });
});

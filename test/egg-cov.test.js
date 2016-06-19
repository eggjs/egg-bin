'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const mm = require('mm');

describe('egg-bin cov', () => {
  const eggBin = require.resolve('../bin/egg-bin.js');
  const appdir = path.join(__dirname, 'fixtures/test-files');

  afterEach(mm.restore);

  it('should success', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, ['cov'], {
      cwd: appdir,
      autoCoverage: true,
    })
    // .debug()
    .expect('stdout', /\/test\/fixtures\/test-files\/\.tmp true/)
    .expect('stdout', /✓ should success/)
    .expect('stdout', /a.test.js/)
    .expect('stdout', /b\/b.test.js/)
    .expect('stdout', /Statements\ \ \ :\ 75% \(\ 3\/4\ \)/)
    .expect('code', 0)
    .end((err, res) => {
      assert.ifError(err);
      assert.ok(!/a.js/.test(res.stdout));
      // 测试 report json
      assert.ok(fs.existsSync(path.join(appdir, 'coverage/coverage-final.json')));
      // 测试 report lcov
      assert.ok(fs.existsSync(path.join(appdir, 'coverage/lcov-report/index.html')));
      assert.ok(fs.existsSync(path.join(appdir, 'coverage/lcov.info')));
      // 已删除
      assert.ok(!fs.existsSync(path.join(appdir, '.tmp')));
      done();
    });
  });

  it('should fail when test fail', done => {
    mm(process.env, 'TESTS', 'test/fail.js');
    coffee.fork(eggBin, ['cov'], {
      cwd: appdir,
      autoCoverage: true,
    })
    // .debug()
    .expect('stdout', /1\) should fail/)
    .expect('stdout', /1 failing/)
    .expect('code', 1)
    .end(done);
  });
});

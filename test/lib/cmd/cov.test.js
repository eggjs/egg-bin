'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const mm = require('mm');

describe('test/lib/cmd/cov.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/test-files');

  afterEach(mm.restore);

  it('should success', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    mm(process.env, 'NYC_CWD', cwd);
    coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b[\/|\\]b\.test\.js/)
      .notExpect('stdout', /a.js/)
      // .expect('stdout', /Statements {3}: 80% \( 4[\/|\\]5 \)/)
      .expect('code', 0)
      .end(err => {
        assert.ifError(err);
        assert.ok(fs.existsSync(path.join(cwd, 'coverage/coverage-final.json')));
        assert.ok(fs.existsSync(path.join(cwd, 'coverage/coverage-summary.json')));
        assert.ok(fs.existsSync(path.join(cwd, 'coverage/lcov-report/index.html')));
        assert.ok(fs.existsSync(path.join(cwd, 'coverage/lcov.info')));
        done();
      });
  });

  it('should success with COV_EXCLUDES', function* () {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    mm(process.env, 'COV_EXCLUDES', 'ignore/*');
    yield coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b[\/|\\]b\.test\.js/)
      .notExpect('stdout', /a.js/)
      // .expect('stdout', /Statements {3}: 75% \( 3[\/|\\]4 \)/)
      .expect('code', 0)
      .end();
    assert(fs.existsSync(path.join(cwd, 'coverage/coverage-final.json')));
    assert(fs.existsSync(path.join(cwd, 'coverage/lcov-report/index.html')));
    assert(fs.existsSync(path.join(cwd, 'coverage/lcov.info')));
    const lcov = fs.readFileSync(path.join(cwd, 'coverage/lcov.info'), 'utf8');
    assert(!/ignore[\/|\\]a.js/.test(lcov));
  });

  it('should success with -x to ignore files', function* () {
    yield coffee.fork(eggBin, [ 'cov', '-x', 'ignore/*', 'test/**/*.test.js' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b[\/|\\]b\.test\.js/)
      .notExpect('stdout', /a.js/)
      // .expect('stdout', /Statements {3}: 75% \( 3[\/|\\]4 \)/)
      .expect('code', 0)
      .end();
    assert(fs.existsSync(path.join(cwd, 'coverage/coverage-final.json')));
    assert(fs.existsSync(path.join(cwd, 'coverage/lcov-report/index.html')));
    assert(fs.existsSync(path.join(cwd, 'coverage/lcov.info')));
    const lcov = fs.readFileSync(path.join(cwd, 'coverage/lcov.info'), 'utf8');
    assert(!/ignore[\/|\\]a.js/.test(lcov));
  });

  it('should fail when test fail', done => {
    mm(process.env, 'TESTS', 'test/fail.js');
    coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .expect('stdout', /1\) should fail/)
      .expect('stdout', /1 failing/)
      .expect('code', 1)
      .end(done);
  });

  it('should fail when test fail with power-assert', done => {
    mm(process.env, 'TESTS', 'test/power-assert-fail.js');
    coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .expect('stdout', /1\) should fail/)
      .expect('stdout', /1 failing/)
      .expect('stdout', /assert\(1 === 2\)/)
      .expect('code', 1)
      .end(done);
  });

  it('should warn when require intelli-espower-loader', done => {
    mm(process.env, 'TESTS', 'test/power-assert-fail.js');
    coffee.fork(eggBin, [ 'cov', '-r', 'intelli-espower-loader' ], { cwd })
      // .debug()
      .expect('stderr', /manually require `intelli-espower-loader`/)
      .expect('stdout', /1\) should fail/)
      .expect('stdout', /1 failing/)
      .expect('stdout', /assert\(1 === 2\)/)
      .expect('code', 1)
      .end(done);
  });

  it('should run cov when no test files', function* () {
    mm(process.env, 'TESTS', 'noexist.js');
    const cwd = path.join(__dirname, '../../fixtures/prerequire');
    yield coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .expect('code', 0)
      .end();
  });
});

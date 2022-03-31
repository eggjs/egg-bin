'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');
const assert = require('assert');
const semver = require('semver');
const changed = require('jest-changed-files');
const Command = require('../../../lib/cmd/test');

describe('test/lib/cmd/test.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/test-files');

  afterEach(mm.restore);

  it('should success', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, [ 'test' ], { cwd })
    // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b\/b\.test\.js/)
      .notExpect('stdout', /\ba\.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should ignore node_modules and fixtures', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, [ 'test' ], { cwd: path.join(__dirname, '../../fixtures/test-files-glob') })
    // .debug()
      .expect('stdout', /should test index/)
      .expect('stdout', /should test sub/)
      .notExpect('stdout', /no-load\.test\.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should only test files specified by TESTS', done => {
    mm(process.env, 'TESTS', 'test/a.test.js');
    coffee.fork(eggBin, [ 'test' ], { cwd })
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .notExpect('stdout', /b\/b.test.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should only test files specified by TESTS with multi pattern', done => {
    mm(process.env, 'TESTS', 'test/a.test.js,test/b/b.test.js');
    coffee.fork(eggBin, [ 'test' ], { cwd })
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b\/b.test.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should only test files specified by TESTS argv', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, [ 'test', 'test/a.test.js' ], { cwd })
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .notExpect('stdout', /b\/b.test.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should exit when not test files', done => {
    coffee.fork(eggBin, [ 'test', 'test/**/*.nth.js' ], { cwd })
    // .debug()
      .expect('stdout', /No test files found/)
      .expect('code', 0)
      .end(done);
  });

  it('should use process.env.TEST_REPORTER', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    mm(process.env, 'TEST_REPORTER', 'json');
    coffee.fork(eggBin, [ 'test' ], { cwd })
    // .debug()
      .expect('stdout', /"stats":/)
      .expect('stdout', /"tests":/)
      .expect('code', 0)
      .end(done);
  });

  it('should use process.env.TEST_TIMEOUT', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    mm(process.env, 'TEST_TIMEOUT', '60000');
    coffee.fork(eggBin, [ 'test' ], { cwd })
      .expect('stdout', /should success/)
      .expect('code', 0)
      .end(done);
  });

  it('should fail when test fail with power-assert', done => {
    mm(process.env, 'TESTS', 'test/power-assert-fail.js');
    coffee.fork(eggBin, [ 'test' ], { cwd })
    // .coverage(false)
    // .debug()
      .expect('stdout', /1\) should fail/)
      .expect('stdout', /assert\(1 === 2\)/)
      .expect('stdout', /1 failing/)
      .expect('code', 1)
      .end(done);
  });

  describe('intelli-espower-loader', () => {
    it('should warn when require intelli-espower-loader', () => {
      mm(process.env, 'TESTS', 'test/power-assert-fail.js');
      return coffee.fork(eggBin, [ 'test', '-r', 'intelli-espower-loader' ], { cwd })
      // .coverage(false)
      // .debug()
        .expect('stderr', /manually require `intelli-espower-loader`/)
        .expect('stdout', /1\) should fail/)
        .expect('stdout', /assert\(1 === 2\)/)
        .expect('stdout', /1 failing/)
        .expect('code', 1)
        .end();
    });

    it('should default require intelli-espower-loader', () => {
      mm(process.env, 'TESTS', 'test/power-assert-fail.js');
      return coffee.fork(eggBin, [ 'test', '--dry-run' ], { cwd })
      // .coverage(false)
      // .debug()
        .expect('stdout', /--require=.*intelli-espower-loader\.js/)
        .end();
    });

    it('should not require intelli-espower-loader with --espower=false', () => {
      mm(process.env, 'TESTS', 'test/power-assert-fail.js');
      return coffee.fork(eggBin, [ 'test', '--espower=false', '--dry-run' ], { cwd })
      // .coverage(false)
      // .debug()
        .notExpect('stdout', /--require=.*intelli-espower-loader\.js/)
        .end();
    });

    it('should default require espower-typescript when typescript', () => {
      mm(process.env, 'TESTS', 'test/power-assert-fail.js');
      return coffee.fork(eggBin, [ 'test', '--typescript', '--dry-run' ], { cwd })
      // .coverage(false)
      // .debug()
        .expect('stdout', /--require=.*espower-typescript\.js/)
        .end();
    });

    it('should not require ntelli-espower-loader/espower-typescript when typescript with --espower=false', () => {
      mm(process.env, 'TESTS', 'test/power-assert-fail.js');
      return coffee.fork(eggBin, [ 'test', '--typescript', '--espower=false', '--dry-run' ], { cwd })
      // .coverage(false)
      // .debug()
        .notExpect('stdout', /--require=.*intelli-espower-loader\.js/)
        .notExpect('stdout', /--require=.*espower-typescript\.js/)
        .end();
    });
  });

  it('should auto require test/.setup.js', () => {
    // example: https://github.com/lelandrichardson/enzyme-example-mocha
    mm(process.env, 'TESTS', 'test/Foo.test.js');
    return coffee.fork(eggBin, [ 'test' ], { cwd: path.join(__dirname, '../../fixtures/enzyme-example-mocha') })
    // .debug()
      .expect('stdout', /before hook: delay 10ms/)
      .expect('stdout', /3 passing/)
      .expect('code', 0)
      .end();
  });

  it('should auto require test/.setup.ts', () => {
    // example: https://github.com/lelandrichardson/enzyme-example-mocha
    mm(process.env, 'TESTS', 'test/a.test.ts');
    return coffee.fork(eggBin, [ 'test', '--typescript' ], { cwd: path.join(__dirname, '../../fixtures/setup-ts') })
      .expect('stdout', /this is a before function/)
      .expect('stdout', /hello egg/)
      .expect('stdout', /is end!/)
      .expect('code', 0)
      .end();
  });
  it('should force exit', () => {
    const cwd = path.join(__dirname, '../../fixtures/no-exit');
    return coffee.fork(eggBin, [ 'test' ], { cwd })
      .debug()
      .expect('code', 0)
      .end();
  });

  it('run not test with dry-run option', () => {
    const cwd = path.join(__dirname, '../../fixtures/mocha-test');
    mm(process.env, 'TESTS', 'test/foo.test.js');
    return coffee.fork(eggBin, [ 'test', '--timeout=12345', '--dry-run' ], { cwd })
      .expect('stdout', [
        /_mocha/g,
        /--timeout=12345/,
        /--exit/,
        /--require=.*mocha-clean\.js/,
        /--require=.*intelli-espower-loader\.js/,
        /foo\.test\.js/,
      ])
      .notExpect('stdout', /--dry-run/)
      .expect('code', 0)
      .end();
  });

  describe('simplify mocha error stack', () => {
    const cwd = path.join(__dirname, '../../fixtures/test-files-stack');

    it('should clean assert error stack', done => {
      mm(process.env, 'TESTS', 'test/assert.test.js');
      coffee.fork(eggBin, [ 'test' ], { cwd })
      // .debug()
        .end((err, { stdout, code }) => {
          assert(stdout.match(/AssertionError/));
          if (semver.satisfies(process.version, '^6.0.0')) {
            // assert stack missing these three lines on node >= 7.0.0
            assert(stdout.match(/at forEach .*assert.test.js:\d+:\d+/));
            assert(stdout.match(/at Context.it .*assert.test.js:\d+:\d+/));
            assert(stdout.match(/\bat\s+/g).length === 3);
          }
          assert(code === 1);
          done(err);
        });
    });

    it('should should show full stack trace', done => {
      mm(process.env, 'TESTS', 'test/assert.test.js');
      coffee.fork(eggBin, [ 'test', '--full-trace' ], { cwd })
      // .debug()
        .end((err, { stdout, code }) => {
          assert(stdout.match(/AssertionError/));
          if (semver.satisfies(process.version, '^6.0.0')) {
            assert(stdout.match(/at .*node_modules.*mocha/));
            assert(stdout.match(/\bat\s+/g).length > 10);
          }
          assert(code === 1);
          done(err);
        });
    });

    it('should clean co error stack', done => {
      mm(process.env, 'TESTS', 'test/promise.test.js');
      coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .end((err, result) => {
          if (err) return done(err);
          const { stdout, code } = result;
          assert(stdout.match(/Error: this is an error/));
          assert(stdout.match(/test[\/\\]{1}promise.test.js:\d+:\d+/));
          assert(stdout.match(/\bat\s+/g).length);
          assert(code === 1);
          done(err);
        });
    });

    it('should clean callback error stack', done => {
      mm(process.env, 'TESTS', 'test/sleep.test.js');
      coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .end((err, result) => {
          if (err) return done(err);
          const { stdout, code } = result;
          assert(stdout.match(/Error: this is an error/));
          assert(stdout.match(/test[\/\\]{1}sleep.test.js:\d+:\d+/));
          assert(stdout.match(/node_modules[\/\\]{1}my-sleep[\/\\]{1}index.js:\d+:\d+/));
          assert(stdout.match(/\bat\s+/g).length);
          assert(code === 1);
          done(err);
        });
    });
  });

  // changed need to mock getChangedFilesForRoots, so we just test formatTestArgs directly
  describe('changed', () => {
    it('should return undefined if no test file changed', function* () {
      const cmd = new Command([ '--changed' ]);
      mm.data(changed, 'getChangedFilesForRoots', {
        changedFiles: new Set(),
      });
      const args = yield cmd.formatTestArgs(cmd.context);
      assert(!args);
    });

    it('should return file changed', function* () {
      const cmd = new Command([ '--changed' ]);
      mm.data(changed, 'getChangedFilesForRoots', {
        changedFiles: new Set([ __filename ]),
      });
      const args = yield cmd.formatTestArgs(cmd.context);
      assert(args.includes('--changed', __filename));
    });

    it('should filter not test file', function* () {
      const cmd = new Command([ '--changed' ]);
      mm.data(changed, 'getChangedFilesForRoots', {
        changedFiles: new Set([ __filename + '.tmp', 'abc.test.js' ]),
      });
      const args = yield cmd.formatTestArgs(cmd.context);
      assert(!args);
    });
  });

  describe('no-timeouts', () => {
    it('should timeout', done => {
      mm(process.env, 'TEST_TIMEOUT', '5000');
      mm(process.env, 'TESTS', 'test/**/no-timeouts.test.js');
      coffee.fork(eggBin, [ 'test' ], { cwd })
        .expect('stdout', /timeout: 5000/)
        .expect('code', 0)
        .end(done);
    });

    it('should no-timeout at debug mode', done => {
      mm(process.env, 'TESTS', 'test/**/no-timeouts.test.js');
      coffee.fork(eggBin, [ 'test', '--inspect' ], { cwd })
      // .debug()
        .expect('stdout', /timeout: 0/)
        .expect('code', 0)
        .end(done);
    });

    it('should no-timeout at WebStorm debug mode', done => {
      mm(process.env, 'TESTS', 'test/**/no-timeouts.test.js');
      mm(process.env, 'JB_DEBUG_FILE', __filename);
      coffee.fork(eggBin, [ 'test' ], { cwd })
      // .debug()
        .expect('stdout', /timeout: 0/)
        .expect('code', 0)
        .end(done);
    });
  });
});

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');
const assert = require('assert');
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

  it('should success with --mochawesome', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, [ 'test', '--mochawesome' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b\/b\.test\.js/)
      .expect('stdout', /\[mochawesome] Report JSON saved to/)
      .expect('stdout', /node_modules\/\.mochawesome-reports\/mochawesome\.json/)
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
    it('should return undefined if no test file changed', async () => {
      const cmd = new Command([ '--changed' ]);
      mm.data(changed, 'getChangedFilesForRoots', {
        changedFiles: new Set(),
      });
      const args = await cmd.formatTestArgs(cmd.context);
      assert(!args);
    });

    it('should return file changed', async () => {
      const cmd = new Command([ '--changed' ]);
      mm.data(changed, 'getChangedFilesForRoots', {
        changedFiles: new Set([ __filename ]),
      });
      const args = await cmd.formatTestArgs(cmd.context);
      assert(args.includes('--changed', __filename));
    });

    it('should filter not test file', async () => {
      const cmd = new Command([ '--changed' ]);
      mm.data(changed, 'getChangedFilesForRoots', {
        changedFiles: new Set([ __filename + '.tmp', 'abc.test.js' ]),
      });
      const args = await cmd.formatTestArgs(cmd.context);
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

  it('test parallel', () => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    return coffee.fork(eggBin, [ 'test', '--parallel' ], { cwd: path.join(__dirname, '../../fixtures/test-demo-app') })
      // .debug()
      .expect('stdout', /should work/)
      .expect('stdout', /a\.test\.js/)
      .expect('code', 0)
      .end();
  });

  it('env should work', async () => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    return coffee.fork(eggBin, [ 'test', '--parallel' ], {
      cwd: path.join(__dirname, '../../fixtures/test-demo-app'),
      env: Object.assign({
        MOCHA_FILE: path.join(__dirname, '../../fixtures/bin/fake_mocha.js'),
      }, process.env),
    })
      // .debug()
      .expect('stdout', /env\.AUTO_AGENT: true/)
      .expect('stdout', /env\.ENABLE_MOCHA_PARALLEL: true/)
      .expect('code', 0)
      .end();
  });
});

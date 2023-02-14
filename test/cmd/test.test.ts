import path from 'node:path';
import coffee from '../coffee';

describe('test/cmd/test.test.ts', () => {
  const eggBin = path.join(__dirname, '../../src/bin/cli.ts');
  const fixtures = path.join(__dirname, '../fixtures');
  const cwd = path.join(fixtures, 'test-files');

  describe('egg-bin test', () => {
    it('should success js', () => {
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .expect('stdout', /should success/)
        .expect('stdout', /a\.test\.js/)
        .expect('stdout', /b\/b\.test\.js/)
        .notExpect('stdout', /\ba\.js/)
        .expect('code', 0)
        .end();
    });

    it('should success on ts', async () => {
      const cwd = path.join(fixtures, 'example-ts');
      await coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .expect('stdout', /should work/)
        .expect('stdout', /1 passing/)
        .expect('code', 0)
        .end();
    });

    it('should success with --mochawesome', () => {
      return coffee.fork(eggBin, [ 'test', '--mochawesome' ], { cwd })
        // .debug()
        .expect('stdout', /should success/)
        .expect('stdout', /a\.test\.js/)
        .expect('stdout', /b\/b\.test\.js/)
        .expect('stdout', /\[mochawesome] Report JSON saved to/)
        .expect('stdout', /mochawesome\.json/)
        .notExpect('stdout', /\ba\.js/)
        .expect('code', 0)
        .end();
    });

    it('should ignore node_modules and fixtures', () => {
      return coffee.fork(eggBin, [ 'test' ], { cwd: path.join(fixtures, 'test-files-glob') })
      // .debug()
        .expect('stdout', /should test index/)
        .expect('stdout', /should test sub/)
        .notExpect('stdout', /no-load\.test\.js/)
        .expect('code', 0)
        .end();
    });

    it('should only test files specified by TESTS', () => {
      return coffee.fork(eggBin, [ 'test' ], { cwd, env: { TESTS: 'test/a.test.js' } })
        .expect('stdout', /should success/)
        .expect('stdout', /a\.test\.js/)
        .notExpect('stdout', /b[\/\\]b.test.js/)
        .expect('code', 0)
        .end();
    });

    it('should only test files specified by TESTS with multi pattern', () => {
      return coffee.fork(eggBin, [ 'test' ], {
        cwd,
        env: { TESTS: 'test/a.test.js,test/b/b.test.js' },
      })
        .expect('stdout', /should success/)
        .expect('stdout', /a\.test\.js/)
        .expect('stdout', /b[\/\\]b.test.js/)
        .expect('code', 0)
        .end();
    });

    it('should only test files specified by TESTS argv', () => {
      return coffee.fork(eggBin, [ 'test', 'test/a.test.js' ], {
        cwd,
        env: { TESTS: 'test/**/*.test.js' },
      })
        .expect('stdout', /should success/)
        .expect('stdout', /a\.test\.js/)
        .notExpect('stdout', /b[\/\\]b.test.js/)
        .expect('code', 0)
        .end();
    });

    it('should grep pattern without error', () => {
      return coffee.fork(eggBin, [ 'test', 'test/a.test.js', '--grep', 'should success' ], {
        cwd,
      })
        // .debug()
        .expect('stdout', /should success/)
        .expect('stdout', /a\.test\.js/)
        .notExpect('stdout', /should show tmp/)
        .expect('code', 0)
        .end();
    });

    it('should exit when not test files', () => {
      return coffee.fork(eggBin, [ 'test', 'test/**/*.nth.js' ], { cwd })
        // .debug()
        .expect('stdout', /No test files found/)
        .expect('code', 0)
        .end();
    });

    it('should use process.env.TEST_REPORTER', () => {
      return coffee.fork(eggBin, [ 'test' ], {
        cwd,
        env: {
          TESTS: 'test/**/*.test.js',
          TEST_REPORTER: 'json',
        },
      })
        // .debug()
        .expect('stdout', /"stats":/)
        .expect('stdout', /"tests":/)
        .expect('code', 0)
        .end();
    });

    it('should use process.env.TEST_TIMEOUT', () => {
      return coffee.fork(eggBin, [ 'test' ], {
        cwd,
        env: {
          TEST_TIMEOUT: '60000',
        },
      })
        .expect('stdout', /should success/)
        .expect('code', 0)
        .end();
    });

    it('should force exit', () => {
      const cwd = path.join(fixtures, 'no-exit');
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .expect('code', 0)
        .end();
    });

    it('run not test with dry-run option', () => {
      const cwd = path.join(fixtures, 'mocha-test');
      return coffee.fork(eggBin, [ 'test', '--timeout=12345', '--dry-run' ], {
        cwd,
        env: {
          TESTS: 'test/foo.test.js',
        },
      })
        // .debug()
        .expect('stdout', /_mocha /)
        .expect('stdout', / --timeout 12345 /)
        .expect('stdout', / --exit /)
        .expect('stdout', /foo\.test\.js/)
        .expect('stdout', /--dry-run/)
        .expect('code', 0)
        .end();
    });

    it('test parallel', () => {
      if (process.platform === 'win32') return;
      return coffee.fork(eggBin, [ 'test', '--parallel' ], {
        cwd: path.join(fixtures, 'test-demo-app'),
      })
        // .debug()
        .expect('stdout', /should work/)
        .expect('stdout', /a\.test\.js/)
        .expect('code', 0)
        .end();
    });

    it('env.MOCHA_FILE should work', () => {
      return coffee.fork(eggBin, [ 'test', '--parallel' ], {
        cwd: path.join(fixtures, 'test-demo-app'),
        env: {
          MOCHA_FILE: path.join(fixtures, 'bin/fake_mocha.js'),
        },
      })
        // .debug()
        .expect('stdout', /env\.NODE_ENV: test/)
        .expect('stdout', /env\.AUTO_AGENT: true/)
        .expect('stdout', /env\.ENABLE_MOCHA_PARALLEL: true/)
        .expect('code', 0)
        .end();
    });
  });

  describe('run test/.setup.js|ts first', () => {
    it('should auto require test/.setup.js', () => {
      return coffee.fork(eggBin, [ 'test', '--no-typescript' ], {
        cwd: path.join(fixtures, 'setup-js'),
        env: {
          TESTS: 'test/a.test.js',
        },
      })
        // .debug()
        .expect('stdout', /this is a before function/)
        .expect('stdout', /hello egg/)
        .expect('stdout', /is end!/)
        .expect('code', 0)
        .end();
    });

    it('should auto require test/.setup.ts', () => {
      return coffee.fork(eggBin, [ 'test', '--typescript' ], {
        cwd: path.join(fixtures, 'setup-ts'),
        env: {
          TESTS: 'test/a.test.ts',
        },
      })
        // .debug()
        .expect('stdout', /this is a before function/)
        .expect('stdout', /hello egg/)
        .expect('stdout', /is end!/)
        .expect('code', 0)
        .end();
    });
  });

  describe('no-timeouts', () => {
    it('should timeout', () => {
      return coffee.fork(eggBin, [ 'test' ], {
        cwd,
        env: {
          TEST_TIMEOUT: '5000',
          TESTS: 'test/**/no-timeouts.test.js',
        },
      })
        // .debug()
        .expect('stdout', /timeout: 5000/)
        .expect('code', 0)
        .end();
    });

    it('should support --no-timeout', () => {
      return coffee.fork(eggBin, [ 'test', '--no-timeout' ], {
        cwd,
        env: {
          TEST_TIMEOUT: '5000',
          TESTS: 'test/**/no-timeouts.test.js',
        },
      })
        // .debug()
        .expect('stdout', /timeout: 0/)
        .expect('code', 0)
        .end();
    });

    it('should no-timeout at inspect mode', () => {
      return coffee.fork(eggBin, [ 'test', '--inspect' ], {
        cwd,
        env: {
          TESTS: 'test/**/no-timeouts.test.js',
        },
      })
        // .debug()
        .expect('stdout', /timeout: 0/)
        .expect('code', 0)
        .end();
    });

    it('should no-timeout at WebStorm debug mode', () => {
      return coffee.fork(eggBin, [ 'test' ], {
        cwd,
        env: {
          TESTS: 'test/**/no-timeouts.test.js',
          JB_DEBUG_FILE: __filename,
        },
      })
        // .debug()
        .expect('stdout', /timeout: 0/)
        .expect('code', 0)
        .end();
    });
  });
});

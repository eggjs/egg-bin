import path from 'node:path';
import coffee from 'coffee';
import mm from 'mm';

describe('test/cmd/test.test.ts', () => {
  const eggBin = path.join(__dirname, '../../bin/cli.ts');
  const fixtures = path.join(__dirname, '../fixtures');
  const cwd = path.join(fixtures, 'test-files');

  afterEach(mm.restore);

  describe('egg-bin test', () => {
    it('should success js', () => {
      mm(process.env, 'TESTS', 'test/**/*.test.js');
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
        .debug()
        .expect('stdout', /should work/)
        .expect('stdout', /1 passing/)
        .expect('code', 0)
        .end();
    });

    it('should success with --mochawesome', () => {
      mm(process.env, 'TESTS', 'test/**/*.test.js');
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
      mm(process.env, 'TESTS', 'test/**/*.test.js');
      return coffee.fork(eggBin, [ 'test' ], { cwd: path.join(fixtures, 'test-files-glob') })
      // .debug()
        .expect('stdout', /should test index/)
        .expect('stdout', /should test sub/)
        .notExpect('stdout', /no-load\.test\.js/)
        .expect('code', 0)
        .end();
    });

    it('should only test files specified by TESTS', () => {
      mm(process.env, 'TESTS', 'test/a.test.js');
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        .expect('stdout', /should success/)
        .expect('stdout', /a\.test\.js/)
        .notExpect('stdout', /b\/b.test.js/)
        .expect('code', 0)
        .end();
    });

    it('should only test files specified by TESTS with multi pattern', () => {
      mm(process.env, 'TESTS', 'test/a.test.js,test/b/b.test.js');
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        .expect('stdout', /should success/)
        .expect('stdout', /a\.test\.js/)
        .expect('stdout', /b\/b.test.js/)
        .expect('code', 0)
        .end();
    });

    it('should only test files specified by TESTS argv', () => {
      mm(process.env, 'TESTS', 'test/**/*.test.js');
      return coffee.fork(eggBin, [ 'test', 'test/a.test.js' ], { cwd })
        .expect('stdout', /should success/)
        .expect('stdout', /a\.test\.js/)
        .notExpect('stdout', /b\/b.test.js/)
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
      mm(process.env, 'TESTS', 'test/**/*.test.js');
      mm(process.env, 'TEST_REPORTER', 'json');
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .expect('stdout', /"stats":/)
        .expect('stdout', /"tests":/)
        .expect('code', 0)
        .end();
    });

    it('should use process.env.TEST_TIMEOUT', () => {
      mm(process.env, 'TESTS', 'test/**/*.test.js');
      mm(process.env, 'TEST_TIMEOUT', '60000');
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        .expect('stdout', /should success/)
        .expect('code', 0)
        .end();
    });

    it('should force exit', () => {
      const cwd = path.join(fixtures, 'no-exit');
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        .debug()
        .expect('code', 0)
        .end();
    });

    it('run not test with dry-run option', () => {
      const cwd = path.join(fixtures, 'mocha-test');
      mm(process.env, 'TESTS', 'test/foo.test.js');
      return coffee.fork(eggBin, [ 'test', '--timeout=12345', '--dry-run' ], { cwd })
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
      mm(process.env, 'TESTS', 'test/**/*.test.js');
      return coffee.fork(eggBin, [ 'test', '--parallel' ], {
        cwd: path.join(fixtures, 'test-demo-app'),
      })
        .debug()
        .expect('stdout', /should work/)
        .expect('stdout', /a\.test\.js/)
        .expect('code', 0)
        .end();
    });

    it('env.MOCHA_FILE should work', async () => {
      mm(process.env, 'TESTS', 'test/**/*.test.js');
      return coffee.fork(eggBin, [ 'test', '--parallel' ], {
        cwd: path.join(fixtures, 'test-demo-app'),
        env: Object.assign({
          MOCHA_FILE: path.join(fixtures, 'bin/fake_mocha.js'),
        }, process.env),
      })
        .debug()
        .expect('stdout', /env\.AUTO_AGENT: true/)
        .expect('stdout', /env\.ENABLE_MOCHA_PARALLEL: true/)
        .expect('code', 0)
        .end();
    });
  });

  describe('run test/.setup.js|ts first', () => {
    it('should auto require test/.setup.js', () => {
      mm(process.env, 'TESTS', 'test/a.test.js');
      return coffee.fork(eggBin, [ 'test', '--no-typescript' ], { cwd: path.join(__dirname, '../fixtures/setup-js') })
        .debug()
        .expect('stdout', /this is a before function/)
        .expect('stdout', /hello egg/)
        .expect('stdout', /is end!/)
        .expect('code', 0)
        .end();
    });

    it('should auto require test/.setup.ts', () => {
      mm(process.env, 'TESTS', 'test/a.test.ts');
      return coffee.fork(eggBin, [ 'test', '--typescript' ], { cwd: path.join(__dirname, '../fixtures/setup-ts') })
        .debug()
        .expect('stdout', /this is a before function/)
        .expect('stdout', /hello egg/)
        .expect('stdout', /is end!/)
        .expect('code', 0)
        .end();
    });
  });

  describe('no-timeouts', () => {
    it('should timeout', () => {
      mm(process.env, 'TEST_TIMEOUT', '5000');
      mm(process.env, 'TESTS', 'test/**/no-timeouts.test.js');
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .expect('stdout', /timeout: 5000/)
        .expect('code', 0)
        .end();
    });

    it('should support --no-timeout', () => {
      mm(process.env, 'TEST_TIMEOUT', '5000');
      mm(process.env, 'TESTS', 'test/**/no-timeouts.test.js');
      return coffee.fork(eggBin, [ 'test', '--no-timeout' ], { cwd })
        // .debug()
        .expect('stdout', /timeout: 0/)
        .expect('code', 0)
        .end();
    });

    it('should no-timeout at inspect mode', () => {
      mm(process.env, 'TESTS', 'test/**/no-timeouts.test.js');
      return coffee.fork(eggBin, [ 'test', '--inspect' ], { cwd })
        .debug()
        .expect('stdout', /timeout: 0/)
        .expect('code', 0)
        .end();
    });

    it('should no-timeout at WebStorm debug mode', () => {
      mm(process.env, 'TESTS', 'test/**/no-timeouts.test.js');
      mm(process.env, 'JB_DEBUG_FILE', __filename);
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .expect('stdout', /timeout: 0/)
        .expect('code', 0)
        .end();
    });
  });
});

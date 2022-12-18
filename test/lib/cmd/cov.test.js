const fs = require('fs');
const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const mm = require('mm');

describe('test/lib/cmd/cov.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/test-files');

  beforeEach(() => fs.rmSync(path.join(cwd, 'coverage'), { force: true, recursive: true }));
  afterEach(mm.restore);

  function assertCoverage(cwd) {
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/coverage-final.json')));
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/coverage-summary.json')));
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/lcov-report/index.html')));
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/lcov.info')));
  }

  it('should success', async () => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    const child = coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b[\/|\\]b\.test\.js/)
      .notExpect('stdout', /a.js/);

    child.expect('stdout', /Statements {3}:/);

    await child.expect('code', 0).end();
    // only test on npm run test
    if (!process.env.NYC_ROOT_ID) assertCoverage(cwd);
  });

  it('should success with --mochawesome', async () => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    const child = coffee.fork(eggBin, [ 'cov', '--mochawesome' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b[\/|\\]b\.test\.js/)
      .expect('stdout', /\[mochawesome] Report JSON saved to/)
      .expect('stdout', /node_modules\/\.mochawesome-reports\/mochawesome\.json/)
      .notExpect('stdout', /a.js/);

    child.expect('stdout', /Statements {3}:/);

    await child.expect('code', 0).end();
    // only test on npm run test
    if (!process.env.NYC_ROOT_ID) assertCoverage(cwd);
  });

  it('should exit when not test files', () => {
    return coffee.fork(eggBin, [ 'cov', 'test/**/*.nth.js' ], { cwd })
      // .debug()
      .expect('stdout', /No test files found/)
      .expect('code', 0)
      .end();
  });

  it('should hotfixSpawnWrap success on mock windows', async () => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    const child = coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .beforeScript(path.join(__dirname, 'mock-win32.js'))
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b[\/|\\]b\.test\.js/)
      .notExpect('stdout', /a.js/);

    child.expect('stdout', /Statements {3}:/);

    await child.expect('code', 0).end();
    // only test on npm run test
    if (!process.env.NYC_ROOT_ID) assertCoverage(cwd);
  });

  it('should success with COV_EXCLUDES', async () => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    mm(process.env, 'COV_EXCLUDES', 'ignore/*');
    const child = coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b[\/|\\]b\.test\.js/)
      .notExpect('stdout', /a.js/);

    child.expect('stdout', /Statements {3}:/);

    await child.expect('code', 0).end();
    // only test on npm run test
    if (!process.env.NYC_ROOT_ID) {
      assertCoverage(cwd);
      const lcov = fs.readFileSync(path.join(cwd, 'coverage/lcov.info'), 'utf8');
      assert(!/ignore[\/|\\]a.js/.test(lcov));
    }
  });

  it('should success with -x to ignore one dirs', async () => {
    const child = coffee.fork(eggBin, [ 'cov', '-x', 'ignore/', 'test/**/*.test.js' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b[\/|\\]b\.test\.js/)
      .notExpect('stdout', /a.js/);

    child.expect('stdout', /Statements {3}:/);

    await child.expect('code', 0).end();
    // only test on npm run test
    if (!process.env.NYC_ROOT_ID) {
      assertCoverage(cwd);
      const lcov = fs.readFileSync(path.join(cwd, 'coverage/lcov.info'), 'utf8');
      assert(!/ignore[\/|\\]a.js/.test(lcov));
    }
  });

  it('should success with -x to ignore multi dirs', async () => {
    const child = coffee.fork(eggBin, [ 'cov', '-x', 'ignore2/*', '-x', 'ignore/', 'test/**/*.test.js' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b[\/|\\]b\.test\.js/)
      .notExpect('stdout', /a.js/);

    child.expect('stdout', /Statements {3}:/);

    await child.expect('code', 0).end();
    assertCoverage(cwd);
    const lcov = fs.readFileSync(path.join(cwd, 'coverage/lcov.info'), 'utf8');
    assert(!/ignore[\/|\\]a.js/.test(lcov));
  });

  it('should fail when test fail', () => {
    mm(process.env, 'TESTS', 'test/fail.js');
    return coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .expect('stdout', /1\) should fail/)
      .expect('stdout', /1 failing/)
      .expect('code', 1)
      .end();
  });

  it('should run cov when no test files', () => {
    mm(process.env, 'TESTS', 'noexist.js');
    const cwd = path.join(__dirname, '../../fixtures/prerequire');
    return coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .expect('code', 0)
      .end();
  });

  it('should set EGG_BIN_PREREQUIRE', async () => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    const cwd = path.join(__dirname, '../../fixtures/prerequire');
    await coffee.fork(eggBin, [ 'cov' ], { cwd })
      // .debug()
      .coverage(false)
      .expect('stdout', /EGG_BIN_PREREQUIRE undefined/)
      .expect('code', 0)
      .end();

    await coffee.fork(eggBin, [ 'cov', '--prerequire' ], { cwd })
      // .debug()
      .coverage(false)
      .expect('stdout', /EGG_BIN_PREREQUIRE true/)
      .expect('code', 0)
      .end();
  });

  it('should passthrough ignore nyc args', () => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    return coffee.fork(eggBin, [ 'cov', '--nyc=-r teamcity -r text' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /Statements/)
      .end();
  });

  it('env should work', async () => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    return coffee.fork(eggBin, [ 'cov', '--parallel' ], {
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

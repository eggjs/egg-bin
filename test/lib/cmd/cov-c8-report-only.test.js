'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const mm = require('mm');
const rimraf = require('mz-modules/rimraf');

describe('test/lib/cmd/cov-c8-report-only.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/test-files-c8-report-only');

  beforeEach(async () => {
    rimraf(path.join(cwd, 'coverage'));
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    mm(process.env, 'NODE_V8_COVERAGE', 'node_modules/.c8_output');
    const test = coffee.fork(eggBin, [ 'test' ], { cwd });
    await test.expect('code', 0).end();
  });
  afterEach(mm.restore);
  function assertCoverage(cwd) {
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/coverage-final.json')));
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/coverage-summary.json')));
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/lcov-report/index.html')));
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/lcov.info')));
  }

  it('should success when c8-report-only', function* () {
    const child = coffee.fork(eggBin, [ 'cov', '--c8-report-only=true' ], { cwd })
      // .debug()
      .expect('stdout', /Statements {3}: 100% \( 11[\/|\\]11 \)/);
    yield child.expect('code', 0).end();
    assertCoverage(cwd);
  });

  it('should success with COV_EXCLUDES', function* () {
    mm(process.env, 'COV_EXCLUDES', 'ignore/*');
    const child = coffee.fork(eggBin, [ 'cov', '--c8-report-only=true' ], { cwd })
      // .debug()
      .expect('stdout', /Statements {3}: 100% \( 8[\/|\\]8 \)/);
    yield child.expect('code', 0).end();
    assertCoverage(cwd);
    const lcov = fs.readFileSync(path.join(cwd, 'coverage/lcov.info'), 'utf8');
    assert(!/ignore[\/|\\]a.js/.test(lcov));
  });

  it('should success with -x to ignore one dirs', function* () {
    const child = coffee.fork(eggBin, [ 'cov', '--c8-report-only=true', '-x', 'ignore/', 'test/**/*.test.js' ], { cwd })
      .expect('stdout', /Statements {3}: 100% \( 8[\/|\\]8 \)/);
    yield child.expect('code', 0).end();
    assertCoverage(cwd);
    const lcov = fs.readFileSync(path.join(cwd, 'coverage/lcov.info'), 'utf8');
    assert(!/ignore[\/|\\]a.js/.test(lcov));
  });

  it('should success with -x to ignore multi dirs', function* () {
    const child = coffee.fork(eggBin, [ 'cov', '--c8-report-only=true', '-x', 'ignore2/*', '-x', 'ignore/', 'test/**/*.test.js' ], { cwd })
      .expect('stdout', /Statements {3}: 100% \( 8[\/|\\]8 \)/);
    yield child.expect('code', 0).end();
    assertCoverage(cwd);
    const lcov = fs.readFileSync(path.join(cwd, 'coverage/lcov.info'), 'utf8');
    assert(!/ignore[\/|\\]a.js/.test(lcov));
  });

  it('should passthrough c8 args', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, [ 'cov', '--c8-report-only=true', '--c8=-r teamcity -r text' ], { cwd })
      // .debug()
      .expect('stdout', /##teamcity\[blockOpened name='Code Coverage Summary'\]/)
      .expect('stdout', /##teamcity\[blockClosed name='Code Coverage Summary'\]/)
      .end(done);
  });
});

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const coffee = require('coffee');

describe('test/node-test-cov.test.js', () => {
  const eggBin = require.resolve('../bin/egg-bin.js');
  const cwd = path.join(__dirname, 'fixtures/node-test');

  beforeEach(() => fs.rmSync(path.join(cwd, 'coverage'), { force: true, recursive: true }));

  function assertCoverage(cwd) {
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/coverage-final.json')));
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/coverage-summary.json')));
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/lcov-report/index.html')));
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/lcov.info')));
    assert.ok(fs.existsSync(path.join(cwd, 'coverage/cobertura-coverage.xml')));
  }

  it('should run with node-test mode work', async () => {
    await coffee.fork(eggBin, [ 'node-test-cov' ], { cwd })
      .debug()
      .expect('stdout', /# tests 2/)
      .expect('stdout', /# pass 1/)
      .expect('stdout', /# fail 1/)
      .expect('stdout', /Statements {3}: 100% \( 3\/3 \)/)
      .expect('code', 1)
      .end();
    assertCoverage(cwd);
  });
});

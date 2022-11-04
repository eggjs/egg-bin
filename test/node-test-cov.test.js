const path = require('path');
const coffee = require('coffee');

describe('test/node-test-cov.test.js', () => {
  // https://github.com/bcoe/c8/issues/422#issuecomment-1291572456
  // skip temp on Node.js
  if (process.version.startsWith('v18.')) return;

  const eggBin = require.resolve('../bin/egg-bin.js');
  const cwd = path.join(__dirname, 'fixtures/node-test');

  it('should run with node-test mode work', () => {
    return coffee.fork(eggBin, [ 'node-test-cov' ], { cwd })
      .debug()
      .expect('stdout', /# tests 2/)
      .expect('stdout', /# pass 1/)
      .expect('stdout', /# fail 1/)
      .expect('stdout', /Statements {3}: 100% \( 3\/3 \)/)
      .expect('code', 1)
      .end();
  });
});

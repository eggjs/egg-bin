const path = require('path');
const coffee = require('coffee');

describe('test/node-test.test.js', () => {
  const eggBin = require.resolve('../bin/egg-bin.js');
  const cwd = path.join(__dirname, 'fixtures/node-test');

  it('should run with node-test mode work', () => {
    return coffee.fork(eggBin, [ 'node-test' ], { cwd })
      .debug()
      .expect('stdout', /# tests 2/)
      .expect('stdout', /# pass 1/)
      .expect('stdout', /# fail 1/)
      .expect('code', 1)
      .end();
  });
});

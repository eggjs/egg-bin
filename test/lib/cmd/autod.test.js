const path = require('path');
const coffee = require('coffee');

const eggBin = require.resolve('../../../bin/egg-bin.js');

describe('test/lib/cmd/autod.test.js', () => {
  it('should autod show deprecated message', () => {
    const cwd = path.join(__dirname, '../../fixtures/autod-missing');
    return coffee.fork(eggBin, [ 'autod' ], { cwd })
      // .debug()
      .expect('stdout', '[deprecated] please remove this command\n')
      .expect('code', 0)
      .end();
  });
});

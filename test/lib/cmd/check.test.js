'use strict';

const path = require('path');
const coffee = require('coffee');

const eggBin = require.resolve('../../../bin/egg-bin.js');

describe('test/lib/cmd/check.test.js', () => {
  it('should check eggache', function* () {
    const cwd = path.join(__dirname, '../../fixtures/check-eggache');
    yield coffee.fork(eggBin, [ 'check' ], { cwd })
      // .debug()
      .expect('stdout', /eggache\/no-override-exports/)
      .expect('stdout', /eggache\/no-unexpected-plugin-keys/)
      .notExpect('stdout', /no-unused-vars/)
      .notExpect('stdout', /\/other.js/)
      .expect('code', 1)
      .end();
  });

  it('should check eggache with --baseDir', function* () {
    const cwd = path.join(__dirname, '../../fixtures/check-eggache');
    yield coffee.fork(eggBin, [ 'check', '--baseDir', cwd ])
      // .debug()
      .expect('stdout', /eggache\/no-override-exports/)
      .expect('stdout', /eggache\/no-unexpected-plugin-keys/)
      .notExpect('stdout', /no-unused-vars/)
      .notExpect('stdout', /\/other.js/)
      .expect('code', 1)
      .end();
  });
});

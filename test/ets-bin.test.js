'use strict';

const path = require('path');
const coffee = require('coffee');

describe('test/ets-bin.test.js', () => {
  const etsBin = require.resolve('../bin/ets.js');
  const cwd = path.join(__dirname, 'fixtures/example-ts-ets');

  it('should test with mocha', () => {
    return coffee.fork(etsBin, [], {
      cwd,
      env: {
        ...process.env,
        ETS_SILENT: 'false',
      },
    })
      // .debug()
      .expect('stdout', /\[egg-ts-helper\] create/)
      .expect('code', 0)
      .end();
  });
});

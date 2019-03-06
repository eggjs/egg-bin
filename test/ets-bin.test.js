'use strict';

const path = require('path');
const coffee = require('coffee');
const semver = require('semver');

describe('test/ets-bin.test.js', () => {
  const etsBin = require.resolve('../bin/ets.js');
  const cwd = path.join(__dirname, 'fixtures/example-ts-ets');

  it('should test with ets', () => {
    const higherVersion = semver.gte(process.version, '8.0.0');
    if (!higherVersion) {
      // skip 6.x, egg-ts-helper only works in >=8.0.0
      return;
    }

    return coffee.fork(etsBin, [], {
      cwd,
      env: Object.assign({}, process.env, {
        ETS_SILENT: 'false',
      }),
    })
      // .debug()
      .expect('stdout', /\[egg-ts-helper\] create/)
      .expect('code', 0)
      .end();
  });
});

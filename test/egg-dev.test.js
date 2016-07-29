'use strict';

const path = require('path');
const coffee = require('coffee');

describe('egg-bin dev', () => {
  const eggBin = require.resolve('../bin/egg-bin.js');
  const appdir = path.join(__dirname, 'fixtures/demo-app');

  it('should startCluster success', done => {
    coffee.fork(eggBin, [ 'dev' ], {
      cwd: appdir,
    })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","workers":1}\n`)
    .expect('code', 0)
    .end(done);
  });

  it('should startCluster with port', done => {
    coffee.fork(eggBin, [ 'dev', '--port', '6001' ], {
      cwd: appdir,
    })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","port":"6001","workers":1}\n`)
    .expect('code', 0)
    .end(done);
  });
});

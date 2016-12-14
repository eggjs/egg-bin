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
    .expect('stdout', `{"baseDir":"${appdir}","workers":1,"port":"6001"}\n`)
    .expect('code', 0)
    .end(done);
  });

  it.skip('should startCluster with execArgv --debug', done => {
    coffee.fork(eggBin, [ 'dev', '--debug=7000' ], {
      cwd: appdir,
    })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","workers":1}\n`)
    .expect('stderr', /Debugger listening on .*7000/)
    .expect('code', 0)
    .end(done);
  });

  it.skip('should startCluster with execArgv --inspect', done => {
    coffee.fork(eggBin, [ 'dev', '--inspect=7000' ], {
      cwd: appdir,
    })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","workers":1}\n`)
    .expect('stderr', /Debugger listening on .*7000/)
    .expect('code', 0)
    .end(done);
  });
});

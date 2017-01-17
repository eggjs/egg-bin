'use strict';

const path = require('path');
const coffee = require('coffee');
const net = require('net');

describe('egg-bin dev', () => {
  const eggBin = require.resolve('../bin/egg-bin.js');
  const appdir = path.join(__dirname, 'fixtures/demo-app');
  const customEgg = path.join(appdir, 'node_modules/aliyun-egg');

  it('should startCluster success', done => {
    coffee.fork(eggBin, [ 'dev' ], { cwd: appdir })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","workers":1,"customEgg":"${customEgg}"}\n`)
    .expect('code', 0)
    .end(done);
  });

  it('should startCluster with --port', done => {
    coffee.fork(eggBin, [ 'dev', '--port', '6001' ], { cwd: appdir })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","workers":1,"port":"6001","customEgg":"${customEgg}"}\n`)
    .expect('code', 0)
    .end(done);
  });

  it('should startCluster with -p', done => {
    coffee.fork(eggBin, [ 'dev', '-p', '6001' ], { cwd: appdir })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","workers":1,"port":"6001","customEgg":"${customEgg}"}\n`)
    .expect('code', 0)
    .end(done);
  });

  it('should startCluster with custom yadan framework', done => {
    const baseDir = path.join(__dirname, 'fixtures/custom-framework-app');
    const customEgg = path.join(baseDir, 'node_modules', 'yadan');
    coffee.fork(eggBin, [ 'dev' ], { cwd: baseDir })
    // .debug()
    .expect('stdout', `yadan start: {"baseDir":"${baseDir}","workers":1,"customEgg":"${customEgg}"}\n`)
    .expect('code', 0)
    .end(done);
  });

  describe('auto detect available port', () => {
    let server;
    before(done => {
      server = net.createServer();
      server.listen(7001, done);
    });

    after(() => server.close());

    it('should auto detect available port', done => {
      coffee.fork(eggBin, [ 'dev' ], { cwd: appdir })
      // .debug()
      .expect('stdout', `{"baseDir":"${appdir}","workers":1,"port":"7002","customEgg":"${customEgg}"}\n`)
      .expect('stderr', /\[egg-bin] server port 7001 is in use/)
      .expect('code', 0)
      .end(done);
    });
  });

  it.skip('should startCluster with execArgv --debug', done => {
    coffee.fork(eggBin, [ 'dev', '--debug=7000' ], { cwd: appdir })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","workers":1,"customEgg":"${customEgg}"}\n`)
    .expect('stderr', /Debugger listening on .*7000/)
    .expect('code', 0)
    .end(done);
  });

  it.skip('should startCluster with execArgv --inspect', done => {
    coffee.fork(eggBin, [ 'dev', '--inspect=7000' ], { cwd: appdir })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","workers":1,"customEgg":"${customEgg}"}\n`)
    .expect('stderr', /Debugger listening on .*7000/)
    .expect('code', 0)
    .end(done);
  });
});

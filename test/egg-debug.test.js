'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');
const rimraf = require('rimraf');
const net = require('net');

describe('egg-bin debug', () => {
  const eggBin = require.resolve('../bin/egg-bin.js');
  const appdir = path.join(__dirname, 'fixtures/demo-app');
  const customEgg = path.join(appdir, 'node_modules/aliyun-egg');

  before(() => {
    rimraf.sync(path.join(appdir, 'node_modules/iron-node'));
    rimraf.sync(path.join(appdir, 'node_modules/.npminstall'));
  });
  afterEach(mm.restore);

  it('should startCluster success', done => {
    coffee.fork(eggBin, [ 'debug' ], { cwd: appdir })
    // .debug()
    .expect('stdout', /,"workers":1,/)
    .expect('code', 0)
    .end(done);
  });

  it('should startCluster with port', done => {
    coffee.fork(eggBin, [ 'debug', '--port', '6001' ], { cwd: appdir })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","workers":1,"port":"6001","customEgg":"${customEgg}"}\nprocess.execArgv: [ '--inspect' ]\n`)
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
      coffee.fork(eggBin, [ 'debug' ], { cwd: appdir })
      // .debug()
      .expect('stdout', /,"workers":1,/)
      .expect('stderr', /\[egg-bin] server port 7001 is in use/)
      .expect('code', 0)
      .end(done);
    });
  });
});

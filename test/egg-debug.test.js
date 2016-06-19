'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');
const rimraf = require('rimraf');

describe('egg-bin debug', () => {
  const eggBin = require.resolve('../bin/egg-bin.js');
  const appdir = path.join(__dirname, 'fixtures/demo-app');

  before(() => {
    rimraf.sync(path.join(appdir, 'node_modules/iron-node'));
    rimraf.sync(path.join(appdir, 'node_modules/.npminstall'));
  });
  afterEach(mm.restore);

  it('should startCluster success', done => {
    coffee.fork(eggBin, ['debug'], {
      cwd: appdir,
      autoCoverage: true,
    })
    // .debug()
    .expect('stdout', /,"workers":1}/)
    .expect('code', 0)
    .end(done);
  });

  it('should startCluster with port', done => {
    coffee.fork(eggBin, ['debug', '--port', '6001'], {
      cwd: appdir,
      autoCoverage: true,
    })
    // .debug()
    .expect('stdout', `{"baseDir":"${appdir}","port":"6001","workers":1}\n`)
    .expect('code', 0)
    .end(done);
  });
});

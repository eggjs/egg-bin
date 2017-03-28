'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');
const net = require('net');

describe('test/lib/cmd/debug.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/demo-app');

  afterEach(mm.restore);

  it('should startCluster success', done => {
    coffee.fork(eggBin, [ 'debug' ], { cwd })
      .expect('stderr', /Debugger listening/)
      .expect('stderr', /chrome-devtools:/)
      .expect('stdout', /"workers":1/)
      .expect('code', 0)
      .end(done);
  });

  it('should startCluster with port', done => {
    coffee.fork(eggBin, [ 'debug', '--port', '6001' ], { cwd })
      // .debug()
      .expect('stderr', /Debugger listening/)
      .expect('stdout', /"port":6001/)
      .expect('stdout', /"workers":1/)
      .expect('stdout', /"baseDir":".*?demo-app"/)
      .expect('stdout', /"framework":".*?aliyun-egg"/)
      .expect('stdout', /--inspect/)
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
      coffee.fork(eggBin, [ 'debug' ], { cwd })
      // .debug()
      .expect('stdout', /,"workers":1/)
      .expect('stderr', /\[egg-bin] server port 7001 is in use/)
      .expect('code', 0)
      .end(done);
    });
  });
});

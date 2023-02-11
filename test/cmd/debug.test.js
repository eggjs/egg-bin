const path = require('path');
const coffee = require('coffee');
const mm = require('egg-mock');
const net = require('net');
const detect = require('detect-port');

describe('test/lib/cmd/debug.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/demo-app');

  afterEach(mm.restore);

  it('should startCluster success', () => {
    return coffee.fork(eggBin, [ 'debug' ], { cwd })
      // .debug()
      .expect('stderr', /Debugger listening/)
      // node 8 missing "devtools" url
      // .expect('stderr', /devtools:/)
      .expect('stdout', /"workers":1/)
      .expect('code', 0)
      .end();
  });

  it('should startCluster with port', () => {
    return coffee.fork(eggBin, [ 'debug', '--port', '6001' ], { cwd })
      // .debug()
      .expect('stderr', /Debugger listening/)
      .expect('stdout', /"port":6001/)
      .expect('stdout', /"workers":1/)
      .expect('stdout', /"baseDir":".*?demo-app"/)
      .expect('stdout', /"framework":".*?aliyun-egg"/)
      .expect('code', 0)
      .end();
  });

  it('should debug with $NODE_DEBUG_OPTION', () => {
    const env = Object.assign({}, process.env, { NODE_DEBUG_OPTION: '--inspect=5555' });
    return coffee.fork(eggBin, [ 'debug' ], { cwd, env })
      // .debug()
      .expect('stderr', /Debugger listening.*5555/)
      .expect('stdout', /"workers":1/)
      .expect('code', 0)
      .end();
  });

  describe('auto detect available port', () => {
    let server;
    let serverPort;
    before(async () => {
      serverPort = await detect(7001);
      server = net.createServer();
      await new Promise(resolve => {
        server.listen(serverPort, resolve);
      });
    });

    after(() => server.close());

    it('should auto detect available port', () => {
      return coffee.fork(eggBin, [ 'debug' ], {
        cwd,
        env: { ...process.env, EGG_BIN_DEFAULT_PORT: serverPort },
      })
        // .debug()
        .expect('stdout', /,"workers":1/)
        .expect('stderr', /\[egg-bin] server port \d+ is in use/)
        .expect('code', 0)
        .end();
    });
  });

  describe('real egg', () => {
    const cwd = path.join(__dirname, '../../fixtures/example');

    it('should proxy', () => {
      mm(process.env, 'VSCODE_CLI', '');
      const app = coffee.fork(eggBin, [ 'debug' ], { cwd });
      // app.debug();
      app.expect('stdout', /DevTools → devtools:.*:9999/);
      return app.expect('stderr', /Debugger listening/)
        .expect('stdout', /Debug Proxy online, now you could attach to 9999/)
        .expect('code', 0)
        .end();
    });

    it('should proxy with port', () => {
      mm(process.env, 'VSCODE_CLI', '');
      const app = coffee.fork(eggBin, [ 'debug', '--proxy=6666' ], { cwd });
      // app.debug();
      app.expect('stdout', /DevTools → devtools:.*:6666/);
      return app.expect('stderr', /Debugger listening/)
        .expect('stdout', /Debug Proxy online, now you could attach to 6666/)
        .expect('code', 0)
        .end();
    });

    it('should not print devtools at vscode', () => {
      mm(process.env, 'VSCODE_CLI', '1');
      const app = coffee.fork(eggBin, [ 'debug' ], { cwd });
      // app.debug();
      return app.expect('stderr', /Debugger listening/)
        .notExpect('stdout', /DevTools → devtools:.*:9999/)
        .notExpect('stdout', /Debug Proxy online, now you could attach to 9999/)
        .expect('code', 0)
        .end();
    });
  });
});

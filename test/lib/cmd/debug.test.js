'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('egg-mock');
const net = require('net');
const semver = require('semver');

describe('test/lib/cmd/debug.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/demo-app');

  afterEach(mm.restore);

  it('should startCluster success', () => {
    return coffee.fork(eggBin, [ 'debug' ], { cwd })
      // .debug()
      .expect('stderr', /Debugger listening/)
      // node 8 missing "chrome-devtools" url
      // .expect('stderr', /chrome-devtools:/)
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
    before(done => {
      server = net.createServer();
      server.listen(7001, done);
    });

    after(() => server.close());

    it('should auto detect available port', () => {
      return coffee.fork(eggBin, [ 'debug' ], { cwd })
      // .debug()
        .expect('stdout', /,"workers":1/)
        .expect('stderr', /\[egg-bin] server port 7001 is in use/)
        .expect('code', 0)
        .end();
    });
  });

  describe('real egg', () => {
    const cwd = path.join(__dirname, '../../fixtures/example');
    const newDebugger = semver.gte(process.version, '7.0.0');

    it('should proxy', function* () {
      mm(process.env, 'VSCODE_CLI', '');
      const app = coffee.fork(eggBin, [ 'debug' ], { cwd });
      // app.debug();
      if (newDebugger) app.expect('stdout', /DevTools → chrome-devtools:.*:9999/);
      yield app.expect('stderr', /Debugger listening/)
        .expect('stdout', /Debug Proxy online, now you could attach to 9999/)
        .expect('code', 0)
        .end();
    });

    it('should proxy with port', function* () {
      mm(process.env, 'VSCODE_CLI', '');
      const app = coffee.fork(eggBin, [ 'debug', '--proxy=6666' ], { cwd });
      // app.debug();
      if (newDebugger) app.expect('stdout', /DevTools → chrome-devtools:.*:6666/);
      yield app.expect('stderr', /Debugger listening/)
        .expect('stdout', /Debug Proxy online, now you could attach to 6666/)
        .expect('code', 0)
        .end();
    });

    it('should not print devtools at vscode', function* () {
      mm(process.env, 'VSCODE_CLI', '1');
      const app = coffee.fork(eggBin, [ 'debug' ], { cwd });
      // app.debug();
      yield app.expect('stderr', /Debugger listening/)
        .notExpect('stdout', /DevTools → chrome-devtools:.*:9999/)
        .notExpect('stdout', /Debug Proxy online, now you could attach to 9999/)
        .expect('code', 0)
        .end();
    });

    it('should not print devtools at webstorm', function* () {
      mm(process.env, 'NODE_DEBUG_OPTION', '--debug-port=5555');
      const app = coffee.fork(eggBin, [ 'debug' ], { cwd });
      // app.debug();
      yield app.expect('stderr', /Debugger listening/)
        .notExpect('stdout', /Debug Proxy online, now you could attach to 9999/)
        .notExpect('stdout', /DevTools → chrome-devtools:.*:9999/)
        .expect('code', 0)
        .end();
    });

    it('should not print devtools at webstorm 2019', function* () {
      mm(process.env, 'JB_DEBUG_FILE', __filename);
      const app = coffee.fork(eggBin, [ 'debug' ], { cwd });
      // app.debug();
      yield app.expect('stderr', /Debugger listening/)
        .notExpect('stdout', /Debug Proxy online, now you could attach to 9999/)
        .notExpect('stdout', /DevTools → chrome-devtools:.*:9999/)
        .expect('code', 0)
        .end();
    });
  });
});

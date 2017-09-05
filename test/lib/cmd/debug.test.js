'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');
const net = require('net');

describe('test/lib/cmd/debug.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/demo-app');

  afterEach(mm.restore);

  it('should startCluster success', () => {
    return coffee.fork(eggBin, [ 'debug' ], { cwd })
      .debug()
      .notExpect('stderr', /Debugger listening/)
      .expect('stdout', /options: {.*"debug":true/)
      .notExpect('stdout', /process.execArgv:/)
      .expect('code', 0)
      .end();
  });

  it('--debug-port=7777', () => {
    return coffee.fork(eggBin, [ 'debug', '--debug-port=7777' ], { cwd })
      // .debug()
      .notExpect('stderr', /Debugger listening/)
      .expect('stdout', /options: {.*"debug":7777/)
      .notExpect('stdout', /process.execArgv:/)
      .expect('code', 0)
      .end();
  });

  it('--inspect=7777', () => {
    return coffee.fork(eggBin, [ 'debug', '--inspect=7777' ], { cwd })
      // .debug()
      .notExpect('stderr', /Debugger listening/)
      .expect('stdout', /options: {.*"debug":7777/)
      .notExpect('stdout', /options: {.*"inspect"/)
      .notExpect('stdout', /process.execArgv:/)
      .expect('code', 0)
      .end();
  });

  it('--debug-brk --debug-agent --debug-agent-brk --inspect-brk', () => {
    return coffee.fork(eggBin, [ 'debug', '--debug-brk', '--debug-agent', '--debug-agent-brk', '--inspect-brk' ], { cwd })
      // .debug()
      .notExpect('stderr', /Debugger listening/)
      .expect('stdout', /options: {.*"debugBrk":true,"debugAgent":true,"debugAgentBrk":true,"debug":true/)
      .notExpect('stdout', /options: {.*"inspect"/)
      .notExpect('stdout', /process.execArgv:/)
      .expect('code', 0)
      .end();
  });

  it('--brk --agent', () => {
    return coffee.fork(eggBin, [ 'debug', '--brk', '--agent' ], { cwd })
      // .debug()
      .notExpect('stderr', /Debugger listening/)
      .expect('stdout', /options: {.*"debugBrk":true,"debugAgent":true,"debug":true/)
      .notExpect('stdout', /options: {.*"inspect"/)
      .notExpect('stdout', /process.execArgv:/)
      .expect('code', 0)
      .end();
  });

  it('--agent=6666', () => {
    return coffee.fork(eggBin, [ 'debug', '--agent=6666' ], { cwd })
      // .debug()
      .notExpect('stderr', /Debugger listening/)
      .expect('stdout', /options: {"debugAgent":6666,"debug":true/)
      .notExpect('stdout', /options: {.*"inspect"/)
      .notExpect('stdout', /process.execArgv:/)
      .expect('code', 0)
      .end();
  });

  it('should startCluster with port', () => {
    return coffee.fork(eggBin, [ 'debug', '--port', '6001' ], { cwd })
      // .debug()
      .notExpect('stderr', /Debugger listening/)
      .expect('stdout', /options: {.*"debug":true/)
      .expect('stdout', /"port":6001/)
      .expect('stdout', /"workers":1/)
      .expect('stdout', /"baseDir":".*?demo-app"/)
      .expect('stdout', /"framework":".*?aliyun-egg"/)
      .expect('code', 0)
      .end();
  });

  it('should debug with $NODE_DEBUG_OPTION', () => {
    const env = Object.assign({}, process.env, { NODE_DEBUG_OPTION: '--inspect-brk=6666' });
    return coffee.fork(eggBin, [ 'debug' ], { cwd, env })
      .debug()
      .notExpect('stderr', /Debugger listening/)
      .expect('stdout', /options: {.*"debug":6666/)
      .expect('stdout', /options: {.*"debugBrk":true/)
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
});

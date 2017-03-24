'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');

describe('test/my-egg-bin.test.js', () => {
  const eggBin = require.resolve('./fixtures/my-egg-bin/bin/my-egg-bin.js');
  const cwd = path.join(__dirname, 'fixtures/test-files');

  afterEach(mm.restore);

  it('should my-egg-bin test success', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, [ 'test' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a.test.js/)
      .expect('stdout', /b\/b.test.js/)
      .notExpect('stdout', /a.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should my-egg-bin nsp success', done => {
    coffee.fork(eggBin, [ 'nsp' ], { cwd })
      // .debug()
      .expect('stdout', /run nsp check at/)
      .expect('code', 0)
      .end(done);
  });

  it('should my-egg-bin dev success', done => {
    coffee.fork(eggBin, [ 'dev' ], { cwd })
      // .debug()
      .expect('stdout', /yadan start/)
      .expect('code', 0)
      .end(done);
  });

  it('should show help message', done => {
    coffee.fork(eggBin, [ '-h' ], { cwd })
      // .debug()
      .expect('stdout', /nsp.*nsp check/)
      .expect('code', 0)
      .end(done);
  });

  it('should show version 2.3.4', done => {
    coffee.fork(eggBin, [ '--version' ], { cwd })
      // .debug()
      .expect('stdout', '2.3.4\n')
      .expect('code', 0)
      .end(done);
  });

  it('should custom context', done => {
    const args = [
      'echo',
      '--baseDir=./dist',
      '--debug=5555', '--debug-brk',
      '--expose_debug_as=v8debug',
      '--inspect', '6666', '--inspect-brk',
      '--es_staging', '--harmony', '--harmony_default_parameters',
    ];
    coffee.fork(eggBin, args, { cwd })
      // .debug()
      .expect('stdout', /"baseDir":".\/dist"/)
      .notExpect('stdout', /"debugBrk":true/)
      .expect('stdout', /"execArgv":\["--debug=5555","--debug-brk","--expose_debug_as=v8debug","--inspect=6666","--inspect-brk","--es_staging","--harmony","--harmony_default_parameters"]/)
      .expect('code', 0)
      .end(done);
  });
});

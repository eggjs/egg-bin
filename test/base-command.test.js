'use strict';

const path = require('path');
const coffee = require('coffee');

describe('base command', () => {
  const eggBin = require.resolve('./fixtures/my-egg-bin/bin/my-egg-bin.js');
  const cwd = path.join(__dirname, 'fixtures/test-files');

  it('should custom context', done => {
    const args = [
      'echo',
      '--baseDir=./dist',
      '--debug=5555', '--debug-brk',
      '--inspect', '6666', '--inspect-brk',
      '--es_staging', '--harmony', '--harmony_default_parameters',
    ];
    coffee.fork(eggBin, args, { cwd })
      // .debug()
      .expect('stdout', /"baseDir":".\/dist"/)
      .notExpect('stdout', /"debugBrk":true/)
      .expect('stdout', /"execArgv":\["--debug=5555","--debug-brk","--inspect=6666","--inspect-brk","--es_staging","--harmony","--harmony_default_parameters"]/)
      .expect('code', 0)
      .end(done);
  });
});

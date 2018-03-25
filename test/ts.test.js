'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');

describe('test/ts.test.js', () => {
  const eggBin = require.resolve('../bin/egg-bin');
  const cwd = path.join(__dirname, './fixtures/ts');

  afterEach(mm.restore);

  it('should support ts', () => {
    mm(process.env, 'NODE_ENV', 'development');
    return coffee.fork(eggBin, [ 'dev', '--typescript' ], { cwd })
      .debug()
      .expect('stdout', /### egg from ts/)
      .expect('stdout', /options.typescript=true/)
      .expect('stdout', /egg started/)
      .expect('code', 0)
      .end();
  });

  it('should support ts test', () => {
    mm(process.env, 'NODE_ENV', 'development');
    return coffee.fork(eggBin, [ 'test', '--typescript' ], { cwd })
      .debug()
      .notExpect('stdout', /false == true/)
      .notExpect('stdout', /should not load js files/)
      .expect('stdout', /--- \[string\] 'wrong assert ts'/)
      .expect('code', 1)
      .end();
  });
});

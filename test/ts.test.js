'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');

describe('test/ts.test.js', () => {
  const eggBin = require.resolve('../bin/egg-bin');
  let cwd;

  afterEach(mm.restore);

  it('should support ts', () => {
    cwd = path.join(__dirname, './fixtures/ts');
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
    cwd = path.join(__dirname, './fixtures/ts');
    mm(process.env, 'NODE_ENV', 'development');
    return coffee.fork(eggBin, [ 'test', '--typescript' ], { cwd })
      .debug()
      .notExpect('stdout', /false == true/)
      .notExpect('stdout', /should not load js files/)
      .expect('stdout', /--- \[string\] 'wrong assert ts'/)
      .expect('code', 1)
      .end();
  });

  it('should start app', () => {
    if (process.env.EGG_VERSION && process.env.EGG_VERSION === '1') {
      console.log('skip egg@1');
      return;
    }
    cwd = path.join(__dirname, './fixtures/example-ts');
    return coffee.fork(eggBin, [ 'dev', '--ts' ], { cwd })
      .debug()
      .expect('stdout', /hi, egg, 12345/)
      .expect('stdout', /egg started/)
      .expect('code', 0)
      .end();
  });
});

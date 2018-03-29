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
      // .debug()
      .expect('stdout', /options.typescript=true/)
      .expect('stdout', /started/)
      .expect('code', 0)
      .end();
  });

  it('should support ts test', () => {
    cwd = path.join(__dirname, './fixtures/ts');
    mm(process.env, 'NODE_ENV', 'development');
    return coffee.fork(eggBin, [ 'test', '--typescript' ], { cwd })
      // .debug()
      .notExpect('stdout', /false == true/)
      .notExpect('stdout', /should not load js files/)
      .expect('stdout', /--- \[string\] 'wrong assert ts'/)
      .expect('code', 1)
      .end();
  });

  describe('real application', () => {
    if (process.env.EGG_VERSION && process.env.EGG_VERSION === '1') {
      console.log('skip egg@1');
      return;
    }

    before(() => {
      cwd = path.join(__dirname, './fixtures/example-ts');
    });

    it('should start app', () => {
      return coffee.fork(eggBin, [ 'dev', '--ts' ], { cwd })
        // .debug()
        .expect('stdout', /hi, egg, 12345/)
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();
    });

    it('should test app', () => {
      return coffee.fork(eggBin, [ 'test', '--ts' ], { cwd })
        // .debug()
        .expect('stdout', /hi, egg, 123456/)
        .expect('stdout', /should work/)
        .expect('code', 0)
        .end();
    });

    it('should cov app', () => {
      return coffee.fork(eggBin, [ 'cov', '--ts' ], { cwd })
        .debug()
        .expect('stdout', /hi, egg, 123456/)
        .expect('stdout', process.env.NYC_ROOT_ID ? /Coverage summary/ : /Statements.*100%/)
        .expect('code', 0)
        .end();
    });
  });

  describe('egg.typescript = true', () => {
    if (process.env.EGG_VERSION && process.env.EGG_VERSION === '1') {
      console.log('skip egg@1');
      return;
    }

    before(() => {
      cwd = path.join(__dirname, './fixtures/example-ts-pkg');
    });

    it('should start app', () => {
      return coffee.fork(eggBin, [ 'dev' ], { cwd })
        // .debug()
        .expect('stdout', /hi, egg, 12345/)
        .expect('stdout', /started/)
        .expect('code', 0)
        .end();
    });

    it('should test app', () => {
      return coffee.fork(eggBin, [ 'test' ], { cwd })
        // .debug()
        .expect('stdout', /hi, egg, 123456/)
        .expect('code', 0)
        .end();
    });

    it('should cov app', () => {
      return coffee.fork(eggBin, [ 'cov' ], { cwd })
        .debug()
        .expect('stdout', /hi, egg, 123456/)
        .expect('stdout', process.env.NYC_ROOT_ID ? /Coverage summary/ : /Statements.*100%/)
        .expect('code', 0)
        .end();
    });
  });
});

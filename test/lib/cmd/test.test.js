'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');

describe('test/lib/cmd/test.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/test-files');

  afterEach(mm.restore);

  it('should success', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, [ 'test' ], { cwd })
      // .debug()
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .expect('stdout', /b\/b\.test\.js/)
      .notExpect('stdout', /\ba\.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should ignore node_modules and fixtures', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, [ 'test' ], { cwd: path.join(__dirname, '../../fixtures/test-files-glob') })
      // .debug()
      .expect('stdout', /should test index/)
      .expect('stdout', /should test sub/)
      .notExpect('stdout', /no-load\.test\.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should only test files specified by TESTS', done => {
    mm(process.env, 'TESTS', 'test/a.test.js');
    coffee.fork(eggBin, [ 'test' ], { cwd })
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .notExpect('stdout', /b\/b.test.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should only test files specified by TESTS argv', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    coffee.fork(eggBin, [ 'test', 'test/a.test.js' ], { cwd })
      .expect('stdout', /should success/)
      .expect('stdout', /a\.test\.js/)
      .notExpect('stdout', /b\/b.test.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should use process.env.TEST_REPORTER', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    mm(process.env, 'TEST_REPORTER', 'json');
    coffee.fork(eggBin, [ 'test' ], { cwd })
      // .debug()
      .expect('stdout', /"stats":/)
      .expect('stdout', /"tests":/)
      .expect('code', 0)
      .end(done);
  });

  it('should use process.env.TEST_TIMEOUT', done => {
    mm(process.env, 'TESTS', 'test/**/*.test.js');
    mm(process.env, 'TEST_TIMEOUT', '60000');
    coffee.fork(eggBin, [ 'test' ], { cwd })
      .expect('stdout', /should success/)
      .expect('code', 0)
      .end(done);
  });

  it('should fail when test fail with power-assert', done => {
    mm(process.env, 'TESTS', 'test/power-assert-fail.js');
    coffee.fork(eggBin, [ 'test' ], { cwd })
      // .coverage(false)
      // .debug()
      .expect('stdout', /1\) should fail/)
      .expect('stdout', /assert\(1 === 2\)/)
      .expect('stdout', /1 failing/)
      .expect('code', 1)
      .end(done);
  });

  it('should warn when require intelli-espower-loader', () => {
    mm(process.env, 'TESTS', 'test/power-assert-fail.js');
    return coffee.fork(eggBin, [ 'test', '-r', 'intelli-espower-loader' ], { cwd })
      // .coverage(false)
      // .debug()
      .expect('stderr', /manually require `intelli-espower-loader`/)
      .expect('stdout', /1\) should fail/)
      .expect('stdout', /assert\(1 === 2\)/)
      .expect('stdout', /1 failing/)
      .expect('code', 1)
      .end();
  });

  it('should auto require test/.setup.js', () => {
    // example: https://github.com/lelandrichardson/enzyme-example-mocha
    return coffee.fork(eggBin, [ 'test' ], { cwd: path.join(__dirname, '../../fixtures/enzyme-example-mocha') })
    // .debug()
    .expect('stdout', /before hook: delay 10ms/)
    .expect('stdout', /3 passing/)
    .expect('code', 0)
    .end();
  });
});

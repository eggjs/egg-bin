'use strict';

const path = require('path');
const coffee = require('coffee');

describe('egg-bin --version, --help', () => {
  const eggBin = require.resolve('../bin/egg-bin.js');
  const appdir = path.join(__dirname, 'fixtures/test-files');

  it('should show version', done => {
    coffee.fork(eggBin, ['--version'], {
      cwd: appdir,
      autoCoverage: true,
    })
    // .debug()
    .expect('stdout', /\d+\.\d+\.\d+/)
    .expect('code', 0)
    .end(done);
  });

  it('should show help', done => {
    coffee.fork(eggBin, ['-h'], {
      cwd: appdir,
      autoCoverage: true,
    })
    // .debug()
    .expect('stdout', /Usage: egg-bin \[command\] \[options\]/)
    .expect('code', 0)
    .end(done);
  });

  it('should show help when command not exists', done => {
    coffee.fork(eggBin, ['not-exists'], {
      cwd: appdir,
      autoCoverage: true,
    })
    // .debug()
    .expect('stdout', /cov \- Run test with coverage/)
    .expect('code', 0)
    .end(done);
  });
});

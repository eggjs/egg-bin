'use strict';

const path = require('path');
const coffee = require('coffee');

const eggBin = require.resolve('../../../bin/egg-bin.js');

describe('test/lib/cmd/autod.test.js', () => {
  it('should autod modify', function* () {
    const cwd = path.join(__dirname, '../../fixtures/autod-missing');
    yield coffee.fork(eggBin, [ 'autod' ], { cwd })
      // .debug()
      .expect('stdout', /"urllib": "\d+.\d+.\d+/)
      .expect('code', 0)
      .end();
  });

  it('should autod check fail', function* () {
    const cwd = path.join(__dirname, '../../fixtures/autod-missing');
    yield coffee.fork(eggBin, [ 'autod', '--check' ], { cwd })
      // .debug()
      .expect('code', 1)
      .expect('stderr', /\[ERROR\] Missing dependencies: \["urllib"\]/)
      .end();
  });

  it('should autod check pass', function* () {
    const cwd = path.join(__dirname, '../../fixtures/autod-exists');
    yield coffee.fork(eggBin, [ 'autod', '--check' ], { cwd })
      // .debug()
      .expect('code', 0)
      .end();
  });
});

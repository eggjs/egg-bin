'use strict';

const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const fs = require('fs');

describe('test/lib/cmd/pkgfiles.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');

  let cwd;
  afterEach(() => fs.writeFileSync(path.join(cwd, 'package.json'), '{}'));

  it('should update pkg.files', async () => {
    cwd = path.join(__dirname, '../../fixtures/pkgfiles');
    fs.writeFileSync(path.join(cwd, 'package.json'), '{}');

    await coffee.fork(eggBin, [ 'pkgfiles' ], { cwd })
      // .debug()
      .expect('code', 0)
      .end();

    const body = fs.readFileSync(path.join(cwd, 'package.json'), 'utf8');
    assert.deepEqual(JSON.parse(body).files, [
      'app',
      'config',
      'app.js',
    ]);
  });

  it('should check pkg.files', () => {
    cwd = path.join(__dirname, '../../fixtures/pkgfiles');
    fs.writeFileSync(path.join(cwd, 'package.json'), '{}');

    return coffee.fork(eggBin, [ 'pkgfiles', '--check' ], { cwd })
      // .debug()
      .expect('stderr', /pkg.files should equal to \[ app, config, app.js ], but got \[ {2}]/)
      .expect('code', 1)
      .end();
  });
});

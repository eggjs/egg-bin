'use strict';

const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const fs = require('mz/fs');

describe('egg-bin pkgfiles', () => {
  const eggBin = require.resolve('../bin/egg-bin.js');

  let cwd;
  afterEach(() => fs.writeFile(path.join(cwd, 'package.json'), '{}'));

  it('should update pkg.files', function* () {
    cwd = path.join(__dirname, 'fixtures/pkgfiles');
    yield fs.writeFile(path.join(cwd, 'package.json'), '{}');

    yield coffee.fork(eggBin, [ 'pkgfiles' ], { cwd })
    // .debug()
    .expect('code', 0)
    .end();

    const body = yield fs.readFile(path.join(cwd, 'package.json'), 'utf8');
    assert.deepEqual(JSON.parse(body).files, [
      'app',
      'config',
      'app.js',
    ]);
  });

});

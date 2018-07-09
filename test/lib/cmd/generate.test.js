'use strict';

const path = require('path');
const coffee = require('coffee');
const mm = require('mm');

describe('test/lib/cmd/generate.test.js', () => {
  const eggBin = require.resolve('../../../bin/egg-bin.js');
  const cwd = path.join(__dirname, '../../fixtures/example-generator');

  afterEach(mm.restore);

  it('should run all generators', () => {
    return coffee.fork(eggBin, [ 'generate', '--foo=bar' ], { cwd })
      // .debug()
      .expect('stdout', /### run genertor from plugin/)
      .expect('stdout', /### run genertor from framework/)
      .expect('stdout', /### run genertor from app/)
      .expect('stdout', /options\.baseDir:.*example-generator/)
      .expect('stdout', /options\.framework:.*duckegg/)
      .expect('stdout', /options\.env: prod/)
      .expect('stdout', /options\.config.env: prod/)
      .expect('stdout', /options\.config.test: abc/)
      .expect('stdout', /options\.argv.foo: bar/)
      .expect('stdout', /options\.loadUnit: true/)
      .expect('stdout', /options\.plugins: true/)
      .expect('stderr', /skip-error generator error/)
      .expect('code', 0)
      .end();
  });

  it('should run special generators', () => {
    return coffee.fork(eggBin, [ 'generate', '--type=test,skipError' ], { cwd })
      // .debug()
      .expect('stdout', /### run genertor from plugin/)
      .notExpect('stdout', /### run genertor from framework/)
      .notExpect('stdout', /### run genertor from app/)
      .expect('stderr', /skip-error generator error/)
      .expect('code', 0)
      .end();
  });
});

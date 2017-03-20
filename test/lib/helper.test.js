'use strict';

const helper = require('../../lib/helper');
const yargs = require('yargs');
const assert = require('assert');

describe('test/lib/helper.test.js', () => {
  const args = [
    'echo',
    '--baseDir=./dist',
    '--debug=5555', '--debug-brk',
    '--inspect', '6666', '--inspect-brk',
    '--es_staging', '--harmony', '--harmony_default_parameters',
  ];

  it('extractArgs', () => {
    const argv = yargs.parse(args);
    const execArgv = helper.extractArgs(argv, {
      includes: [ 'debug', /^harmony.*/ ],
    });

    assert(argv.debug);
    assert(argv.baseDir);
    assert.deepEqual(execArgv, [ '--debug=5555', '--harmony', '--harmony_default_parameters' ]);
  });

  it('extractArgs with remove', () => {
    const argv = yargs.parse(args);
    const execArgv = helper.extractArgs(argv, {
      includes: [ 'debug', /^harmony.*/ ],
      remove: true,
    });

    assert(!argv.debug && !argv.harmony);
    assert(argv.baseDir);
    assert.deepEqual(execArgv, [ '--debug=5555', '--harmony', '--harmony_default_parameters' ]);
  });
});

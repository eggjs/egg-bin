'use strict';

const Command = require('../command');
const debug = require('debug')('egg-bin:test');

class TestCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin test [files] [options]';
    this.options = {
      require: {
        description: 'require the given module',
        alias: 'r',
        type: 'array',
      },
      timeout: {
        description: 'set test-case timeout in milliseconds',
        alias: 't',
        type: 'number',
      },
    };
  }

  get description() {
    return 'Run test with mocha';
  }

  * run({ argv, execArgv }) {
    const newArgs = this.helper.formatTestArgs(argv);
    const opt = {
      env: Object.assign({}, process.env, {
        NODE_ENV: 'test',
      }),
      execArgv,
    };
    const mochaFile = require.resolve('mocha/bin/_mocha');

    debug('run test with %j', newArgs);
    yield this.helper.forkNode(mochaFile, newArgs, opt);
  }
}

module.exports = TestCommand;

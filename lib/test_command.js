'use strict';

const mochaFile = require.resolve('mocha/bin/_mocha');
const Command = require('./command');

class TestCommand extends Command {
  * run(_, args) {
    args = [
      mochaFile,
      '--reporter', process.env.TEST_REPORTER || 'spec',
      '--timeout', process.env.TEST_TIMEOUT || '30000',
      '--require', require.resolve('thunk-mocha'),
    ].concat(this.helper.getTestFiles()).concat(args);

    if (args.indexOf('intelli-espower-loader') !== -1) {
      console.warn('[egg-bin] don\'t need to manually require `intelli-espower-loader` anymore');
    } else {
      args.push('--require');
      args.push(require.resolve('intelli-espower-loader'));
    }

    process.env.NODE_ENV = 'test';

    const opt = {
      env: process.env,
    };

    yield this.helper.checkDeps();
    yield this.helper.forkNode(mochaFile, args, opt);
  }

  help() {
    return 'Run test with mocha';
  }
}

module.exports = TestCommand;

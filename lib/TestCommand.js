'use strict';

const mochaFile = require.resolve('mocha/bin/_mocha');
const thunkMocha = require.resolve('thunk-mocha');
const Command = require('./Command');

class TestCommand extends Command {
  * run() {
    const args = [
      mochaFile,
      '--reporter', process.env.TEST_REPORTER || 'spec',
      '--timeout', process.env.TEST_TIMEOUT || '30000',
      '--require', thunkMocha,
    ].concat(this.helper.getTestFiles());
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

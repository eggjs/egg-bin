'use strict';

const Command = require('common-bin');

class TestCommand extends Command {
  constructor() {
    super();
    this.name = 'test';
    this.description = 'Run test with mocha';
  }

  * run({ rawArgv }) {
    yield this.helper.checkDeps();

    const newArgs = this.helper.formatTestArgs(rawArgv);
    const opt = {
      env: Object.assign({}, process.env, {
        NODE_ENV: 'test',
      }),
      execArgv: this.helper.formatExecArgv(rawArgv),
    };
    const mochaFile = require.resolve('mocha/bin/_mocha');
    yield this.helper.forkNode(mochaFile, newArgs, opt);
  }
}

module.exports = TestCommand;

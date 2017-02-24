'use strict';

const Command = require('./command');

class TestCommand extends Command {
  * run(cwd, args) {
    yield this.helper.checkDeps();

    const newArgs = this.helper.formatTestArgs(args);
    const opt = {
      env: Object.assign({}, process.env, {
        NODE_ENV: 'test',
      }),
      execArgv: this.helper.formatExecArgv(args),
    };
    const mochaFile = require.resolve('mocha/bin/_mocha');
    yield this.helper.forkNode(mochaFile, newArgs, opt);
  }

  help() {
    return 'Run test with mocha';
  }
}

module.exports = TestCommand;

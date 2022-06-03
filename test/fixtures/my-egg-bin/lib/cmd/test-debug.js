'use strict';

const Command = require('../../../../../').TestCommand;

class TestDebugCommand extends Command {
  get description() {
    return 'test';
  }

  async run(context) {
    const testArgs = await this.formatTestArgs(context);
    console.log('%j', testArgs);
  }
}

module.exports = TestDebugCommand;

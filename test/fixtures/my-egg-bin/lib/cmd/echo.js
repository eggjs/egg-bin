'use strict';

const Command = require('../../../../../');

class EchoCommand extends Command {
  get description() {
    return 'echo test';
  }

  * run(context) {
    console.log('%j', context);
  }
}

module.exports = EchoCommand;

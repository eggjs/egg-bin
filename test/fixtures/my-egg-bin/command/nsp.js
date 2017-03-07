'use strict';

const Command = require('../../../..');

class NspCommand extends Command {
  constructor() {
    super();
    this.name = 'nsp';
    this.description = 'nsp check';
  }

  * run({ cwd, rawArgv }) {
    console.log('run nsp check at %s with %j', cwd, rawArgv);
  }
}

module.exports = NspCommand;

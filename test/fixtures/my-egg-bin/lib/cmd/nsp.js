'use strict';

const Command = require('../../../../../');

class NspCommand extends Command {
  get description() {
    return 'nsp check';
  }

  async run({ cwd, rawArgv }) {
    console.log('run nsp check at %s with %j', cwd, rawArgv);
  }
}

module.exports = NspCommand;

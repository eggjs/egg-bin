'use strict';

const Command = require('../../../..').Command;

class NspCommand extends Command {
  * run(cwd, args) {
    console.log('run nsp check at %s with %j', cwd, args);
  }

  help() {
    return 'nsp check';
  }
}

module.exports = NspCommand;

'use strict';

const Command = require('../../../..').Command;

class NspCommand extends Command {
  constructor() {
    super();
    this.name = 'nsp';
    this.description = 'nsp check';
  }
  * run({ cwd, argv }) {
    console.log('run nsp check at %s with %j', cwd, argv);
  }
}

module.exports = NspCommand;

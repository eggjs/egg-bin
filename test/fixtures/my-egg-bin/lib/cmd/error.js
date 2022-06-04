'use strict';

const Command = require('../../../../../');

class ErrorCommand extends Command {
  async run() {
    const err = new Error('this is an error');
    throw err;
  }
}

module.exports = ErrorCommand;

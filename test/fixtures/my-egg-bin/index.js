'use strict';

const path = require('path');
const Command = require('../../..');

class MainCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin [command] [options]';

    // load directory
    this.load(path.join(__dirname, 'command'));
  }
}

module.exports = MainCommand;

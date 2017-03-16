'use strict';

const path = require('path');
const helper = require('./lib/helper');
const Command = require('common-bin');

class MainCommand extends Command {
  constructor() {
    super();
    this.usage = 'Usage: egg-bin [command] [options]';

    Object.assign(this.helper, helper);

    // load directory
    this.load(path.join(__dirname, 'lib/command'));

    if (process.platform === 'win32') {
      console.warn('`cov` is replaced with `test` at windows');
      this.alias('cov', 'test');
    }
  }
}

module.exports = exports = MainCommand;
exports.Command = Command;
exports.CovCommand = require('./lib/command/cov');
exports.DevCommand = require('./lib/command/dev');
exports.TestCommand = require('./lib/command/test');
exports.DebugCommand = require('./lib/command/debug');

'use strict';

const path = require('path');
const BaseProgram = require('common-bin').Program;
const pkg = require('../package.json');

class Program extends BaseProgram {
  constructor() {
    super();
    this.name = pkg.name;
    this.version = pkg.version;
    this.usage = `Usage: ${this.name} [command] [options]`;

    this.addCommand(path.join(__dirname, 'dev_command.js'));
    this.addCommand(path.join(__dirname, 'debug_command.js'));

    if (process.platform === 'win32') {
      // skip cov at win
      this.addCommand(path.join(__dirname, 'test_command.js'), commandObj => {
        commandObj.aliases = [ 'cov' ];
        return commandObj;
      });
    } else {
      this.addCommand(path.join(__dirname, 'test_command.js'));
      this.addCommand(path.join(__dirname, 'cov_command.js'));
    }
  }
}

module.exports = Program;

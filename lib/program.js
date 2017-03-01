'use strict';

const path = require('path');
const Command = require('common-bin');
const pkg = require('../package.json');

class Program extends Command {
  constructor() {
    super();
    this.binName = pkg.name;
    this.version = pkg.version;

    this.yargs
      // .strict()
      .demandCommand(1)
      .usage(`Usage: ${this.binName} [command] [options]`)
      .epilogue('for more information, find our manual at https://github.com/eggjs/egg-bin');

    this.loadCommand(path.join(__dirname, 'dev_command.js'));
    this.loadCommand(path.join(__dirname, 'debug_command.js'));

    if (process.platform === 'win32') {
      // skip cov at win
      this.loadCommand(path.join(__dirname, 'test_command.js'), commandObj => {
        commandObj.aliases = [ 'cov' ];
        return commandObj;
      });
    } else {
      this.loadCommand(path.join(__dirname, 'test_command.js'));
      this.loadCommand(path.join(__dirname, 'cov_command.js'));
    }
  }
}

module.exports = Program;

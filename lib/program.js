'use strict';

const path = require('path');
const BaseProgram = require('common-bin').Program;

class Program extends BaseProgram {
  constructor() {
    super();
    this.version = require('../package.json').version;
    this.addCommand('dev', path.join(__dirname, 'dev_command.js'));
    this.addCommand('debug', path.join(__dirname, 'debug_command.js'));
    this.addCommand('test', path.join(__dirname, 'test_command.js'));
    if (process.platform === 'win32') {
      this.addCommand('cov', path.join(__dirname, 'test_command.js'));
    } else {
      this.addCommand('cov', path.join(__dirname, 'cov_command.js'));
    }
    this.addCommand('pkgfiles', path.join(__dirname, 'pkgfiles_command.js'));
  }
}

module.exports = Program;

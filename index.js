'use strict';

const path = require('path');
const pkg = require('./package.json');
const helper = require('./lib/helper');
const BaseCommand = require('common-bin');

class Command extends BaseCommand {
  start() {
    this.name = pkg.name;
    // this.version = pkg.version;
    this.usage = `Usage: ${this.name} [command] [options]`;

    Object.assign(this.helper, helper);

    // load directory
    this.loadCommand(path.join(__dirname, 'lib/command'));

    // this.version = require('../package.json').version;
    // this.addCommand('dev', path.join(__dirname, 'dev_command.js'));
    // this.addCommand('debug', path.join(__dirname, 'debug_command.js'));
    // this.addCommand('test', path.join(__dirname, 'test_command.js'));
    // if (process.platform === 'win32') {
    //   this.addCommand('cov', path.join(__dirname, 'test_command.js'));
    // } else {
    //   this.addCommand('cov', path.join(__dirname, 'cov_command.js'));
    // }
    // this.addCommand('pkgfiles', path.join(__dirname, 'pkgfiles_command.js'));

    super.start();
  }
}

module.exports = exports = Command;
exports.CovCommand = require('./lib/command/cov');
exports.DevCommand = require('./lib/command/dev');
exports.TestCommand = require('./lib/command/test');
exports.DebugCommand = require('./lib/command/debug');

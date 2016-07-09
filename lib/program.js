'use strict';

const co = require('co');
const path = require('path');
const chalk = require('chalk');

class Program {
  constructor() {
    this._commands = {
      dev: path.join(__dirname, 'dev_command.js'),
      debug: path.join(__dirname, 'debug_command.js'),
      test: path.join(__dirname, 'test_command.js'),
      cov: path.join(__dirname, 'cov_command.js'),
    };
    this.version = require('../package.json').version;
  }

  addCommand(cmd, filepath) {
    // each cmd module should contain two methods: run(args) and help()
    this._commands[cmd] = filepath;
  }

  onAction(cmd, cwd, args) {
    const filepath = this._commands[cmd];
    if (!filepath) {
      this.help();
      return;
    }
    co(function*() {
      const Command = require(filepath);
      yield new Command().run(cwd, args);
    }).catch(err => {
      console.error('[egg-bin] run %s with %j at %s error:', cmd, args, cwd);
      console.error(chalk.red(err.stack));
      process.exit(1);
    });
  }

  help() {
    console.log('');
    for (const cmd in this._commands) {
      const Command = require(this._commands[cmd]);
      console.log('    %s - %s', cmd, new Command().help());
    }
    console.log('');
  }
}

module.exports = Program;

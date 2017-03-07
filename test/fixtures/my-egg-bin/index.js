'use strict';

const path = require('path');
const pkg = require('./package.json');
const BaseCommand = require('../../..');

class Command extends BaseCommand {
  start() {
    this.name = pkg.name;
    this.usage = `Usage: ${this.name} [command] [options]`;

    // load directory
    this.loadCommand(path.join(__dirname, 'command'));

    super.start();
  }
}

module.exports = Command;

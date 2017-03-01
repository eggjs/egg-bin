'use strict';

const path = require('path');
const Program = require('../../../..').Program;
const pkg = require('../package.json');

class MyProgram extends Program {
  constructor() {
    super();
    this.binName = pkg.name;
    this.version = pkg.version;

    this.loadCommand(path.join(__dirname, 'nsp_command.js'));
    this.loadCommand(path.join(__dirname, 'dev_command.js'));
  }
}

module.exports = MyProgram;

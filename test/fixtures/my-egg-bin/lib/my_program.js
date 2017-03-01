'use strict';

const path = require('path');
const Program = require('../../../..').Program;
const pkg = require('../package.json');

class MyProgram extends Program {
  constructor() {
    super();
    this.name = pkg.name;
    this.version = pkg.version;

    this.addCommand(path.join(__dirname, 'nsp_command.js'));
    this.addCommand(path.join(__dirname, 'dev_command.js'));
  }
}

module.exports = MyProgram;

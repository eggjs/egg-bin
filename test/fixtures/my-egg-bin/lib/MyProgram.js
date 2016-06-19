'use strict';

const path = require('path');
const Program = require('../../../..').Program;

class MyProgram extends Program {
  constructor() {
    super();
    this.version = require('../package.json').version;

    this.addCommand('nsp', path.join(__dirname, 'NspCommand.js'));
  }
}

module.exports = MyProgram;

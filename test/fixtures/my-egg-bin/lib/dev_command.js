'use strict';

const DevCommand = require('../../../..').DevCommand;

class MyDevCommand extends DevCommand {
  constructor() {
    super();
    this.name = 'dev';
  }
  * run({ cwd }) {
    console.log('run dev with eggPath: %s', this.getFrameworkOrEggPath(cwd) || 'empty');
  }
}

module.exports = MyDevCommand;

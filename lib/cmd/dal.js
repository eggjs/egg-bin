'use strict';

const Command = require('../command');
const path = require('node:path');

class DalCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.load(path.join(__dirname, 'dal'));
  }

  get description() {
    return '生成 dal DAO、extensions、structure 代码';
  }
}

module.exports = DalCommand;

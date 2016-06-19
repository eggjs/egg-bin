'use strict';

const helper = require('./helper');

class Command {
  constructor() {
    this.helper = helper;
  }

  run(/* cwd, args */) {
    throw new Error('Must impl this method');
  }

  help() {
    throw new Error('Must impl this method');
  }
}

module.exports = Command;

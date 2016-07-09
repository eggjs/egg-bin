'use strict';

const utils = require('egg-utils');
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

  get utils() {
    return utils;
  }
}

module.exports = Command;

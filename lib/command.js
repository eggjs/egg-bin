'use strict';

const utils = require('egg-utils');
const BaseCommand = require('common-bin');
const helper = require('./helper');

class Command extends BaseCommand {
  constructor() {
    super();
    this.helper = Object.assign({}, this.helper, helper);
  }

  get utils() {
    return utils;
  }
}

module.exports = Command;

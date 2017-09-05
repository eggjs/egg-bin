'use strict';

const BaseCommand = require('common-bin');

class Command extends BaseCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.parserOptions = {
      execArgv: true,
      removeAlias: true,
    };
  }

  get context() {
    const context = super.context;

    // compatible
    if (context.debugPort) context.debug = context.debugPort;

    // remove unuse args
    context.argv.$0 = undefined;

    return context;
  }
}

module.exports = Command;

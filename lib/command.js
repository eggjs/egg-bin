'use strict';

const BaseCommand = require('common-bin');
const helper = require('./helper');

class Command extends BaseCommand {
  constructor(rawArgv) {
    super(rawArgv);
    Object.assign(this.helper, helper);
  }

  /**
   * normalize context
   * @param {Object} context - { cwd, argv, rawArgv }
   * @return {Object} return with { cwd, argv, execArgv, rawArgv }
   */
  get context() {
    const context = super.context;

    // remove unuse args
    context.argv.$0 = undefined;

    // extract execArgv to special item
    context.execArgv = this.helper.extractArgs(context.argv, {
      includes: [ /^debug/, 'debug-brk', 'inspect', 'inspect-brk', 'es_staging', /^harmony.*/ ],
      remove: true,
    });
    return context;
  }
}

module.exports = Command;

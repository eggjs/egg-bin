'use strict';

const BaseCommand = require('common-bin');
const changeCase = require('change-case');

class Command extends BaseCommand {
  /**
   * normalize context
   * @param {Object} context - { cwd, argv, rawArgv }
   * @return {Object} return with { cwd, argv, execArgv, rawArgv }
   */
  get context() {
    const context = super.context;
    const argv = context.argv;

    // extract execArgv to special item
    context.execArgv = this.helper.unparseArgv(argv, {
      includes: [ 'debug', 'debug-brk', 'inspect', 'inspect-brk', 'es_staging', /^harmony.*/ ],
    });

    // remove unuse args
    argv.$0 = undefined;
    for (const item of context.execArgv) {
      // --debug=7000 => debug
      const key = item.replace(/--([^=]*)=?.*/, '$1');
      argv[key] = undefined;
      argv[changeCase.camelCase(key)] = undefined;
    }

    return context;
  }
}

module.exports = Command;

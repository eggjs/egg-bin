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
    const execArgvObj = {};
    let debugPort;
    const match = (key, arr) => arr.some(x => x instanceof RegExp ? x.test(key) : x === key); // eslint-disable-line no-confusing-arrow
    for (const key of Object.keys(argv)) {
      let isMatch = false;

      // debug / debug-brk / debug-port / inspect / inspect-brk / inspect-port
      if (match(key, [ /^debug.*/, /^inspect.*/ ])) {
        isMatch = true;
        // extract debug port
        if (debugPort === undefined || typeof argv[key] === 'number') {
          debugPort = argv[key];
        }
      } else if (match(key, [ 'es_staging', 'expose_debug_as', /^harmony.*/ ])) {
        isMatch = true;
      }

      if (isMatch) {
        execArgvObj[key] = argv[key];
        argv[key] = undefined;
        // also remove `debugBrk`
        argv[changeCase.camelCase(key)] = undefined;
      }
    }

    context.execArgv = this.helper.unparseArgv(execArgvObj);
    context.execArgvObj = execArgvObj;
    context.debug = debugPort;

    // remove unuse args
    argv.$0 = undefined;

    return context;
  }
}

module.exports = Command;

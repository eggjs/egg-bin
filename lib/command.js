'use strict';

const BaseCommand = require('common-bin');
const changeCase = require('change-case');
const parser = require('yargs-parser');

class Command extends BaseCommand {
  /**
   * normalize context
   * @param {Object} context - { cwd, argv, rawArgv }
   * @return {Object} return with { cwd, argv, execArgv, rawArgv }
   */
  get context() {
    const context = super.context;
    const argv = context.argv;

    let execArgvObj = {};
    let debugPort;

    // extract from command argv
    debugPort = findDebugPort(argv);
    execArgvObj = extractExecArgv(argv);

    // extract from WebStorm env `$NODE_DEBUG_OPTION`
    if (context.env.NODE_DEBUG_OPTION) {
      console.log('Use $NODE_DEBUG_OPTION: %s', context.env.NODE_DEBUG_OPTION);
      const argvFromEnv = parser(context.env.NODE_DEBUG_OPTION);
      debugPort = findDebugPort(argvFromEnv);
      Object.assign(execArgvObj, extractExecArgv(argvFromEnv));
    }

    context.execArgv = this.helper.unparseArgv(execArgvObj);
    context.execArgvObj = execArgvObj;
    context.debug = debugPort;

    // remove unuse args
    argv.$0 = undefined;
    argv.v = undefined;

    return context;
  }
}

function match(key, arr) {
  return arr.some(x => x instanceof RegExp ? x.test(key) : x === key); // eslint-disable-line no-confusing-arrow
}

function findDebugPort(argv) {
  let debugPort;

  for (const key of Object.keys(argv)) {
    if (match(key, [ /^debug.*/, /^inspect.*/ ]) && typeof argv[key] === 'number') {
      debugPort = argv[key];
    }
  }
  return debugPort;
}

// pick and remove all execArgv from origin `argv`
function extractExecArgv(argv) {
  const execArgvObj = {};
  for (const key of Object.keys(argv)) {
    // debug / debug-brk / debug-port / inspect / inspect-brk / inspect-port
    if (match(key, [ /^debug.*/, /^inspect.*/, 'es_staging', 'expose_debug_as', /^harmony.*/ ])) {
      execArgvObj[key] = argv[key];
      // remove from origin obj
      argv[key] = undefined;
      // also remove `debugBrk`
      argv[changeCase.camelCase(key)] = undefined;
    }
  }
  return execArgvObj;
}

module.exports = Command;

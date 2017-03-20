'use strict';

const unparse = require('dargs');
const changeCase = require('change-case');

/**
 * extract argv then change it to array style
 * @method helper#extractArgs
 * @param {Object} argv - yargs style
 * @param {Object} [options] - options, see more at https://github.com/sindresorhus/dargs
 * @param {Array} [options.includes] - keys or regex of keys to include
 * @param {Array} [options.excludes] - keys or regex of keys to exclude
 * @param {Boolean} [options.remove] - whether remove key from origin object, will also remove camelCase key.
 * @return {Array} [ '--debug=7000', '--debug-brk' ]
 */
exports.extractArgs = function(argv, options = {}) {
  // revert argv object to array
  // yargs will paser `debug-brk` to `debug-brk` and `debugBrk`, so we need to filter
  const newArgv = [ ...new Set(unparse(argv, options)) ];
  if (options.remove) {
    for (const item of newArgv) {
      // --debug=7000 => debug
      const key = item.replace(/--([^=]*)=?.*/, '$1');
      argv[key] = undefined;
      argv[changeCase.camelCase(key)] = undefined;
    }
  }
  return newArgv;
};

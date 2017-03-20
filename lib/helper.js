'use strict';

const unparse = require('dargs');

/**
 * unparse argv then change it to array style
 * @method helper#unparseArgv
 * @param {Object} argv - yargs style
 * @param {Object} [options] - options, see more at https://github.com/sindresorhus/dargs
 * @param {Array} [options.includes] - keys or regex of keys to include
 * @param {Array} [options.excludes] - keys or regex of keys to exclude
 * @return {Array} [ '--debug=7000', '--debug-brk' ]
 */
exports.unparseArgv = function(argv, options = {}) {
  // revert argv object to array
  // yargs will paser `debug-brk` to `debug-brk` and `debugBrk`, so we need to filter
  return [ ...new Set(unparse(argv, options)) ];
};

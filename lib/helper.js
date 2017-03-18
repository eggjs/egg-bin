'use strict';

const existsSync = require('fs').existsSync;
const path = require('path');
// const glob = require('glob');
const detect = require('detect-port');
const debug = require('debug')('egg-bin');
const utils = require('egg-utils');
const unparse = require('dargs');
const changeCase = require('change-case');

exports.defaultPort = 7001;
exports.serverBin = path.join(__dirname, 'start-cluster');

// exports.getTestFiles = () => {
//   const files = process.env.TESTS || 'test/**/*.test.js';
//   const base = process.cwd();
//   return glob.sync(files, {
//     cwd: base,
//   }).map(file => {
//     return path.join(base, file);
//   });
// };

exports.formatTestArgv = argv => {
  const newArgv = Object.assign({}, argv);

  newArgv.timeout = newArgv.timeout || process.env.TEST_TIMEOUT || '30000';
  newArgv.reporter = newArgv.reporter || process.env.TEST_REPORTER;

  // collect require
  let requireArr = newArgv.require || newArgv.r || [];
  if (!Array.isArray(requireArr)) requireArr = [ requireArr ];

  requireArr.push(require.resolve('co-mocha'));

  if (requireArr.includes('intelli-espower-loader')) {
    console.warn('[egg-bin] don\'t need to manually require `intelli-espower-loader` anymore');
  } else {
    requireArr.push(require.resolve('intelli-espower-loader'));
  }

  newArgv.require = requireArr;

  // TODO: glob test skip node_modules
  // collect test files
  let files = newArgv._.slice();
  if (!files.length) {
    files = [ process.env.TESTS || 'test/**/*.test.js' ];
  }

  // auto add setup file as the first test file
  const setupFile = path.join(process.cwd(), 'test/.setup.js');
  if (existsSync(setupFile)) {
    files.unshift(setupFile);
  }
  newArgv._ = files;

  // remove alias
  newArgv.$0 = undefined;
  newArgv.r = undefined;
  newArgv.t = undefined;

  return unparse(newArgv);
};

exports.formatArgv = function* (cwd, argv, options = {}) {
  // TODO: baseDir relate path ?
  argv.baseDir = argv._[0] || argv.baseDir || cwd;
  argv.workers = argv.cluster || 1;
  argv.port = argv.port || argv.p;
  argv.framework = utils.getFrameworkPath({
    framework: argv.framework || options.framework,
    baseDir: argv.baseDir,
  });

  // remove unused properties
  argv.cluster = undefined;
  argv.c = undefined;
  argv.p = undefined;
  argv._ = undefined;
  argv.$0 = undefined;

  // auto detect available port
  if (!argv.port) {
    debug('detect available port');
    const port = yield detect(exports.defaultPort);
    if (port !== exports.defaultPort) {
      argv.port = port;
      console.warn(`[egg-bin] server port ${exports.defaultPort} is in use, now using port ${port}\n`);
    }
    debug(`use available port ${port}`);
  }
  return [ JSON.stringify(argv) ];
};

/**
 * extract argv then change it to array style
 * @param {Object} argv - yargs style
 * @param {Object} [opts] - options, see more at https://github.com/sindresorhus/dargs
 * @param {Array} [opts.includes] - keys or regex of keys to include
 * @param {Array} [opts.excludes] - keys or regex of keys to exclude
 * @param {Boolean} [opts.remove] - whether remove key from origin object, will also remove camelCase key.
 * @return {Array} [ '--debug=7000', '--debug-brk' ]
 */
exports.extractArgv = function(argv, opts = {}) {
  // revert argv object to array
  // yargs will paser `debug-brk` to `debug-brk` and `debugBrk`, so we need to filter
  const newArgv = [ ...new Set(unparse(argv, opts)) ];
  if (opts.remove) {
    for (const item of newArgv) {
      // --debug=7000 => debug
      const key = item.replace(/--([^=]*)=?.*/, '$1');
      argv[key] = undefined;
      argv[changeCase.camelCase(key)] = undefined;
    }
  }
  return newArgv;
};

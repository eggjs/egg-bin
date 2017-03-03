'use strict';

const existsSync = require('fs').existsSync;
const path = require('path');
const glob = require('glob');
const detect = require('detect-port');
const debug = require('debug')('egg-bin');
const utils = require('egg-utils');
const yargs = require('yargs');

exports.defaultPort = 7001;
exports.serverBin = path.join(__dirname, 'start-cluster');

exports.getTestFiles = () => {
  const files = process.env.TESTS || 'test/**/*.test.js';
  const base = process.cwd();
  return glob.sync(files, {
    cwd: base,
  }).map(file => {
    return path.join(base, file);
  });
};

exports.getTestSetupFile = () => {
  const setupFile = path.join(process.cwd(), 'test/.setup.js');
  if (existsSync(setupFile)) {
    return setupFile;
  }
  return null;
};

exports.formatTestArgs = args => {
  const newArgs = [
    '--timeout', process.env.TEST_TIMEOUT || '30000',
    '--require', require.resolve('co-mocha'),
  ];
  if (process.env.TEST_REPORTER) {
    newArgs.push('--reporter');
    newArgs.push(process.env.TEST_REPORTER);
  }

  if (args.indexOf('intelli-espower-loader') !== -1) {
    console.warn('[egg-bin] don\'t need to manually require `intelli-espower-loader` anymore');
  } else {
    // should be require before args
    newArgs.push('--require');
    newArgs.push(require.resolve('intelli-espower-loader'));
  }

  // auto add setup file as the first test file
  const setupFile = exports.getTestSetupFile();
  if (setupFile) {
    newArgs.push(setupFile);
  }

  return newArgs.concat(exports.getTestFiles()).concat(args);
};

// TODO: add egg-dependencies
// const checkDeps = require('egg-dependencies');
exports.checkDeps = function* () {
  return true;
};

exports.formatArgs = function* (cwd, args, options) {
  options = options || {};

  const argv = yargs.parse(args);
  argv.baseDir = argv.baseDir || cwd;
  argv.workers = argv.cluster || 1;
  argv.framework = argv.framework || options.framework;
  argv.framework = utils.getFrameworkPath(argv);
  argv.port = argv.port || argv.p;

  // remove unused properties
  argv.cluster = undefined;
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

exports.formatExecArgv = function(args) {
  args = args || [];
  return process.execArgv.concat(args.filter(passbyArgv));
};

function passbyArgv(arg) {
  if (typeof arg !== 'string') return false;

  return arg.startsWith('--debug')
    || arg.startsWith('--inspect')
    || arg.startsWith('--es_staging')
    || arg.startsWith('--harmony');
}

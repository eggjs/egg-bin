'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const detect = require('detect-port');
const debug = require('debug')('egg-bin');

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
  if (fs.existsSync(setupFile)) {
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
  if (!args.filter(arg => arg.startsWith('--baseDir')).length) {
    args.push('--baseDir');
    args.push(cwd);
  }

  if (!args.filter(arg => arg.startsWith('--cluster')).length) {
    args.push('--cluster');
    args.push('1');
  }

  if (options.eggPath) {
    args.push(`--eggPath=${options.eggPath}`);
  }

  // auto detect available port
  if (args.indexOf('-p') === -1 && args.indexOf('--port') === -1) {
    debug('detect available port');
    const port = yield detect(exports.defaultPort);
    if (port !== exports.defaultPort) {
      args.push('-p', port);
      console.warn(`[egg-bin] server port ${exports.defaultPort} is in use, now using port ${port}\n`);
    }
    debug(`use available port ${port}`);
  }
  return args;
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

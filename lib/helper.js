'use strict';

const path = require('path');
const glob = require('glob');
const detect = require('detect-port');
const utils = require('egg-utils');

exports.defaultPort = 7001;
exports.serverBin = path.join(__dirname, 'start-cluster');

exports.getTestFiles = function() {
  const files = process.env.TESTS || 'test/**/*.test.js';
  const base = process.cwd();
  return glob.sync(files, {
    cwd: base,
  }).map(function(file) {
    return path.join(base, file);
  });
};

// TODO: add egg-dependencies
// const checkDeps = require('egg-dependencies');
exports.checkDeps = function* () {
  return true;
};

exports.formatArgs = function* (cwd, args) {
  args.push('--baseDir');
  args.push(cwd);
  args.push('--cluster');
  args.push('1');

  const eggPath = utils.getFrameworkOrEggPath(cwd);
  if (eggPath) {
    args.push(`--eggPath=${eggPath}`);
  }

  // auto detect available port
  if (args.indexOf('-p') === -1 && args.indexOf('--port') === -1) {
    const port = yield detect(exports.defaultPort);
    if (port !== exports.defaultPort) {
      args.push('-p', port);
      console.warn(`[egg-bin] server port ${exports.defaultPort} is in use, now using port ${port}\n`);
    }
  }
  return args;
};


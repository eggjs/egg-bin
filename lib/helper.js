'use strict';

const path = require('path');
const glob = require('glob');

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

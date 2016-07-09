'use strict';

const path = require('path');
const cp = require('child_process');
const fs = require('fs');
const assert = require('assert');
const glob = require('glob');
const debug = require('debug')('egg-bin');

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

const childs = new Set();
process.once('SIGINT', () => process.exit());
process.once('SIGQUIT', () => process.exit());
process.once('SIGTERM', () => process.exit());
process.once('exit', () => {
  for (const child of childs) {
    child.kill();
  }
});

exports.forkNode = function(modulePath, args, opt) {
  opt = opt || {};
  opt.stdio = opt.stdio || 'inherit';
  debug('Run fork `%j, %j, %j, %j`',
    process.execPath, process.execArgv.join(' '), modulePath, args.join(' '));
  const proc = cp.fork(modulePath, args, opt);
  childs.add(proc);
  return function(cb) {
    proc.once('exit', function(code) {
      childs.delete(proc);
      if (code !== 0) {
        const err = new Error(modulePath + ' ' + args + ' exit with code ' + code);
        err.code = code;
        cb(err);
      } else {
        cb();
      }
    });
  };
};

exports.npmInstall = function(npmCli, name, cwd) {
  const options = {
    stdio: 'inherit',
    env: process.env,
    cwd: cwd,
  };

  const args = [ 'i', name ];
  console.log('[egg-bin] `%s %s` to %s ...', npmCli, args.join(' '), options.cwd);

  return function(callback) {
    const proc = cp.spawn(npmCli, args, options);
    proc.on('error', function(err) {
      const cb = callback;
      callback = null;
      cb(err);
    });
    proc.on('exit', function(code) {
      if (!callback) return;

      if (code !== 0) {
        return callback(new Error('npm ' + args.join(' ') + ' fail, exit code: ' + code));
      }
      callback();
    });
  };
};

exports.getIronNodeBin = function*(npmCli, cwd) {
  const nodeBin = path.join(cwd, 'node_modules/iron-node/bin/run.js');
  let exists;
  try {
    exists = !!fs.statSync(nodeBin);
  } catch (_) {
    // not exists
    exists = false;
  }
  if (exists) {
    return nodeBin;
  }
  const packageName = 'iron-node@3';
  try {
    yield exports.npmInstall(npmCli, packageName, cwd);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
    console.warn('[egg-bin] `%s` not exists, use npm and try again', npmCli);
    // use npm and try again
    yield exports.npmInstall('npm', packageName, cwd);
  }

  assert(!!fs.statSync(nodeBin), `${nodeBin} not exists, please run "npm i ${packageName}"`);
  return nodeBin;
};

// TODO: add egg-dependencies
// const checkDeps = require('egg-dependencies');
exports.checkDeps = function*() {
  return true;
};

/* istanbul ignore next */
'use strict';

const debug = require('debug')('egg-bin:cov');
const path = require('path');
const rimraf = require('mz-modules/rimraf');

const Command = require('./test');
const EXCLUDES = Symbol('cov#excludes');

/* istanbul ignore next */
class CovCommand extends Command {
  constructor(argv) {
    super(argv);

    this.usage = 'Usage: egg-bin cov';

    this.options = {
      x: {
        description: 'istanbul coverage ignore, one or more fileset patterns',
        type: 'string',
      },
    };

    // you can add ignore dirs here
    this[EXCLUDES] = new Set([
      'examples/**',
      'mocks_*/**',
    ]);
  }

  get description() {
    return 'Run test with coverage';
  }

  * run(context) {
    const { cwd, argv, execArgv } = context;
    process.env.NODE_ENV = 'test';

    // ignore coverage
    if (argv.x) {
      this[EXCLUDES].add(argv.x);
      argv.x = undefined;
    }
    const excludes = (process.env.COV_EXCLUDES && process.env.COV_EXCLUDES.split(',')) || [];
    for (const exclude of excludes) {
      this[EXCLUDES].add(exclude);
    }

    const nycCli = require.resolve('nyc/bin/nyc.js');
    const coverageDir = path.join(cwd, 'coverage');
    yield rimraf(coverageDir);

    const opt = {
      cwd,
      execArgv,
      env: Object.assign({}, process.env),
    };

    // save coverage-xxxx.json to $PWD/coverage
    const covArgs = this.getCovArgs(context);
    debug('covArgs: %j', covArgs);
    yield this.helper.forkNode(nycCli, covArgs, opt);
  }

  /**
   * add istanbul coverage ignore
   * @param {String} exclude - glob pattern
   */
  addExclude(exclude) {
    this[EXCLUDES].add(exclude);
  }

  /**
   * get coverage args
   * @param {Object} context - { cwd, argv, ...}
   * @return {Array} args for nyc
   * @protected
   */
  getCovArgs() {
    const covArgs = [
      // '--show-process-tree',
      '--temp-directory', './node_modules/.nyc_output',
      '-r', 'text-summary',
      '-r', 'json-summary',
      '-r', 'json',
      '-r', 'lcov',
    ];

    for (const exclude of this[EXCLUDES]) {
      covArgs.push('-x');
      covArgs.push(exclude);
    }
    covArgs.push('egg-bin');
    covArgs.push('test');
    return covArgs;
  }
}

module.exports = CovCommand;

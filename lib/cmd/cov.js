/* istanbul ignore next */
'use strict';

const debug = require('debug')('egg-bin');
const path = require('path');
const rimraf = require('mz-modules/rimraf');
const testExclude = require('test-exclude');

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
      prerequire: {
        description: 'prerequire files for coverage instrument',
        type: 'boolean',
      },
    };

    // you can add ignore dirs here
    this[EXCLUDES] = new Set([
      'example/',
      'examples/',
      'mocks**/',
      'docs/',
    ].concat(testExclude.defaultExclude));
  }

  get description() {
    return 'Run test with coverage';
  }

  * run(context) {
    const { cwd, argv, execArgv, env } = context;

    if (argv.prerequire) {
      env.EGG_BIN_PREREQUIRE = 'true';
    }
    delete argv.prerequire;

    // ignore coverage
    if (argv.x) {
      if (Array.isArray(argv.x)) {
        for (const exclude of argv.x) {
          this.addExclude(exclude);
        }
      } else {
        this.addExclude(argv.x);
      }
      argv.x = undefined;
    }
    const excludes = (process.env.COV_EXCLUDES && process.env.COV_EXCLUDES.split(',')) || [];
    for (const exclude of excludes) {
      this.addExclude(exclude);
    }

    const nycCli = require.resolve('nyc/bin/nyc.js');
    const coverageDir = path.join(cwd, 'coverage');
    yield rimraf(coverageDir);
    const outputDir = path.join(cwd, 'node_modules/.nyc_output');
    yield rimraf(outputDir);

    const opt = {
      cwd,
      execArgv,
      env: Object.assign({ NODE_ENV: 'test' }, env),
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
  getCovArgs(context) {
    let covArgs = [
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
    covArgs.push(require.resolve('mocha/bin/_mocha'));
    covArgs = covArgs.concat(this.formatTestArgs(context));
    return covArgs;
  }
}

module.exports = CovCommand;

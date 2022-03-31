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
      nyc: {
        description: 'nyc instruments passthrough',
        type: 'string',
        default: '--temp-directory ./node_modules/.nyc_output -r text-summary -r json-summary -r json -r lcov',
      },
      c8: {
        description: 'c8 instruments passthrough',
        type: 'string',
        default: '--temp-directory ./node_modules/.c8_output -r text-summary -r json-summary -r json -r lcov',
      },
      'c8-report': {
        description: 'use c8 to report coverage, default to false',
        type: 'boolean',
        default: false,
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

    const opt = {
      cwd,
      execArgv,
      env: Object.assign({
        NODE_ENV: 'test',
        EGG_TYPESCRIPT: context.argv.typescript,
      }, env),
    };

    // https://github.com/eggjs/egg/issues/3930
    if (context.argv.typescript) {
      opt.env.SPAWN_WRAP_SHIM_ROOT = path.join(cwd, 'node_modules');
    }
    let cli = require.resolve('nyc/bin/nyc.js');
    let outputDir = path.join(cwd, 'node_modules/.nyc_output');
    if (argv['c8-report']) {
      cli = require.resolve('c8/bin/c8.js');
      outputDir = path.join(cwd, 'node_modules/.c8_output');
    }
    yield rimraf(outputDir);
    const coverageDir = path.join(cwd, 'coverage');
    yield rimraf(coverageDir);
    const covArgs = yield this.getCovArgs(context);
    if (!covArgs) return;
    debug('covArgs: %j', covArgs);
    yield this.helper.forkNode(cli, covArgs, opt);
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
  * getCovArgs(context) {
    let covArgs = [
      // '--show-process-tree',
    ];

    // typescript support
    if (context.argv.typescript) {
      covArgs.push('--extension', '.ts');
      this.addExclude('typings/');
      this.addExclude('**/*.d.ts');
    }

    // nyc or c8 args passthrough
    let passthroughArgs = context.argv.nyc;
    if (context.argv['c8-report']) {
      passthroughArgs = context.argv.c8;
      context.argv['c8-report'] = undefined;
    }
    context.argv.nyc = undefined;
    context.argv.c8 = undefined;
    if (passthroughArgs) {
      covArgs = covArgs.concat(passthroughArgs.split(' '));
    }
    for (const exclude of this[EXCLUDES]) {
      covArgs.push('-x');
      covArgs.push(exclude);
    }
    const testArgs = yield this.formatTestArgs(context);
    if (!testArgs) return;
    covArgs.push(require.resolve('mocha/bin/_mocha'));
    covArgs = covArgs.concat(testArgs);
    return covArgs;
  }
}

module.exports = CovCommand;

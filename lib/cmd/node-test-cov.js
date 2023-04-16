const debug = require('util').debuglog('egg-bin:node-test-cov');
const path = require('path');
const fs = require('fs/promises');
const NodeTestCommand = require('./node-test');
const { getNodeTestCommandAndArgs, defaultExcludes } = require('../utils');

const EXCLUDES = Symbol('cov#excludes');

class NodeTestCovCommand extends NodeTestCommand {
  constructor(argv) {
    super(argv);
    this.usage = 'Usage: egg-bin node-test-cov';
    this.options = {
      x: {
        description: 'istanbul coverage ignore, one or more fileset patterns',
        type: 'string',
      },
      prerequire: {
        description: 'prerequire files for coverage instrument',
        type: 'boolean',
      },
      c8: {
        description: 'c8 instruments passthrough',
        type: 'string',
        default: '--temp-directory ./node_modules/.c8_output -r text-summary -r json-summary -r json -r lcov -r cobertura',
      },
    };

    // you can add ignore dirs here
    this[EXCLUDES] = new Set(defaultExcludes);
  }

  get description() {
    return 'Run test with coverage';
  }

  async run(context) {
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
    const cli = require.resolve('c8/bin/c8.js');
    const outputDir = path.join(cwd, 'node_modules/.c8_output');
    await fs.rm(outputDir, { force: true, recursive: true });
    const coverageDir = path.join(cwd, 'coverage');
    await fs.rm(coverageDir, { force: true, recursive: true });
    const covArgs = await this.getCovArgs(context);
    if (!covArgs) return;
    debug('run cov: %s %s', cli, covArgs.join(' '));
    await this.helper.forkNode(cli, covArgs, opt);
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
   * @return {Array} args for c8
   * @protected
   */
  async getCovArgs(context) {
    let covArgs = [
      // '--show-process-tree',
    ];

    // typescript support
    if (context.argv.typescript) {
      covArgs.push('--extension', '.ts');
      this.addExclude('typings/');
      this.addExclude('**/*.d.ts');
    }

    // c8 args passthrough
    const passthroughArgs = context.argv.c8;
    context.argv['c8-report'] = undefined;
    context.argv.c8 = undefined;
    if (passthroughArgs) {
      covArgs = covArgs.concat(passthroughArgs.split(' '));
    }
    for (const exclude of this[EXCLUDES]) {
      covArgs.push('-x');
      covArgs.push(exclude);
    }
    const testArgs = await this.formatTestArgs(context);
    if (!testArgs) return;
    covArgs.push(...this.getTestCommandAndArgs());
    covArgs = covArgs.concat(testArgs);
    return covArgs;
  }

  getTestCommandAndArgs() {
    const { command, args } = getNodeTestCommandAndArgs();
    return [ command, ...args ];
  }
}

module.exports = NodeTestCovCommand;

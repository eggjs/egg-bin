const debug = require('util').debuglog('egg-bin:node-test');
const globby = require('globby');
const Command = require('../command');
const { getChangedTestFiles, getNodeTestCommandAndArgs } = require('../utils');

class NodeTestCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin node-test [files] [options]';
    this.options = {
      require: {
        description: 'require the given module',
        alias: 'r',
        type: 'array',
      },
      grep: {
        description: 'only run tests matching <pattern>',
        alias: 'g',
        type: 'array',
      },
      timeout: {
        description: 'set test-case timeout in milliseconds',
        alias: 't',
        type: 'number',
      },
      changed: {
        description: 'only test with changed files and match ${cwd}/test/**/*.test.(js|ts)',
        alias: 'c',
      },
    };
  }

  get description() {
    return 'Run test with node:test';
  }

  async run(context) {
    const opt = {
      env: Object.assign({
        NODE_ENV: 'test',
      }, context.env),
      execArgv: context.execArgv,
    };
    const testArgs = await this.formatTestArgs(context);
    if (!testArgs) return;

    const { command, args } = getNodeTestCommandAndArgs();
    testArgs.unshift(...args);
    debug('run test: %s %s', command, testArgs.join(' '));
    if (command.endsWith('.js')) {
      await this.helper.forkNode(command, testArgs, opt);
      return;
    }
    await this.helper.spawn(command, testArgs, opt);
  }

  /**
   * format test args then change it to array style
   * @param {Object} context - { cwd, argv, ...}
   * @param {Object} context.argv node-test arguments
   * @return {Array} [ '--require=xxx', 'xx.test.js' ]
   * @protected
   */
  async formatTestArgs({ argv }) {
    const testArgv = Object.assign({}, argv);

    /* istanbul ignore next */
    // testArgv.timeout = testArgv.timeout || process.env.TEST_TIMEOUT || 60000;
    // testArgv.reporter = testArgv.reporter || process.env.TEST_REPORTER;

    // collect require
    let requireArr = testArgv.require || testArgv.r || [];
    /* istanbul ignore next */
    if (!Array.isArray(requireArr)) requireArr = [ requireArr ];

    testArgv.require = requireArr;

    let pattern;
    // changed
    if (testArgv.changed) {
      pattern = await this._getChangedTestFiles();
      if (!pattern.length) {
        console.log('No changed test files');
        return;
      }
    }

    if (!pattern) {
      // specific test files
      pattern = testArgv._.slice();
    }
    if (!pattern.length && process.env.TESTS) {
      pattern = process.env.TESTS.split(',');
    }

    // collect test files
    if (!pattern.length) {
      pattern = [ `test/**/*.test.${testArgv.typescript ? 'ts' : 'js'}` ];
    }
    pattern = pattern.concat([ '!test/fixtures', '!test/node_modules' ]);

    // expand glob and skip node_modules and fixtures
    const files = globby.sync(pattern);
    files.sort();

    if (files.length === 0) {
      console.log(`No test files found with ${pattern}`);
      return;
    }

    testArgv._ = files;

    // remove alias
    testArgv.$0 = undefined;
    testArgv.r = undefined;
    testArgv.t = undefined;
    testArgv.g = undefined;
    testArgv.e = undefined;
    testArgv['dry-run'] = undefined;
    testArgv.dryRun = undefined;
    // not support tscompiler for now
    testArgv.tscompiler = undefined;
    testArgv.eggTsHelper = undefined;
    testArgv['tsconfig-paths'] = undefined;
    testArgv.tsconfigPaths = undefined;

    return this.helper.unparseArgv(testArgv);
  }

  async _getChangedTestFiles() {
    return await getChangedTestFiles(process.cwd());
  }
}

module.exports = NodeTestCommand;

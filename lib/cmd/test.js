'use strict';

const debug = require('debug')('egg-bin');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const Command = require('../command');
const { getChangedTestFiles } = require('../utils');

class TestCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin test [files] [options]';
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
      'full-trace': {
        description: 'display the full stack trace',
      },
      changed: {
        description: 'only test with changed files and match ${cwd}/test/**/*.test.(js|ts)',
        alias: 'c',
      },
      'dry-run': {
        type: 'boolean',
        description: 'whether show test command, no test will be executed',
        alias: 'd',
      },
      espower: {
        type: 'boolean',
        description: 'whether require intelli-espower-loader(js) or espower-typescript(ts) for power-assert',
        default: true,
        alias: 'e',
      },
    };
  }

  get description() {
    return 'Run test with mocha';
  }

  async run(context) {
    const opt = {
      env: Object.assign({
        NODE_ENV: 'test',
      }, context.env),
      execArgv: context.execArgv,
    };
    const mochaFile = require.resolve('mocha/bin/_mocha');
    const testArgs = await this.formatTestArgs(context);
    if (!testArgs) return;

    if (context.argv['dry-run']) {
      debug('test with dry-run');
      console.log(mochaFile);
      console.log(testArgs.join('\n'));
      return;
    }

    debug('run test: %s %s', mochaFile, testArgs.join(' '));
    await this.helper.forkNode(mochaFile, testArgs, opt);
  }

  /**
   * format test args then change it to array style
   * @param {Object} context - { cwd, argv, ...}
   * @param {Object} context.argv test arguments
   * @param {Object} context.debugOptions debug options
   * @return {Array} [ '--require=xxx', 'xx.test.js' ]
   * @protected
   */
  async formatTestArgs({ argv, debugOptions }) {
    const testArgv = Object.assign({}, argv);

    /* istanbul ignore next */
    testArgv.timeout = testArgv.timeout || process.env.TEST_TIMEOUT || 60000;
    testArgv.reporter = testArgv.reporter || process.env.TEST_REPORTER;
    // force exit
    testArgv.exit = true;

    // whether is debug mode, if pass --inspect then `debugOptions` is valid
    // others like WebStorm 2019 will pass NODE_OPTIONS, and egg-bin itself will be debug, so could detect `process.env.JB_DEBUG_FILE`.

    if (debugOptions || process.env.JB_DEBUG_FILE) {
      // --no-timeout
      testArgv.timeout = false;
    }

    // collect require
    let requireArr = testArgv.require || testArgv.r || [];
    /* istanbul ignore next */
    if (!Array.isArray(requireArr)) requireArr = [ requireArr ];

    // clean mocha stack, inspired by https://github.com/rstacruz/mocha-clean
    // [mocha built-in](https://github.com/mochajs/mocha/blob/master/lib/utils.js#L738) don't work with `[npminstall](https://github.com/cnpm/npminstall)`, so we will override it.
    if (!testArgv.fullTrace) requireArr.unshift(require.resolve('../mocha-clean'));

    if (requireArr.includes('intelli-espower-loader')) {
      console.warn('[egg-bin] don\'t need to manually require `intelli-espower-loader` anymore');
    } else if (testArgv.espower) {
      if (testArgv.typescript) {
        // espower-typescript must append after ts-node
        requireArr.push(testArgv.tscompiler, require.resolve('../espower-typescript'));
      } else {
        requireArr.push(require.resolve('intelli-espower-loader'));
      }
    }

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

    // auto add setup file as the first test file
    const setupFile = path.join(process.cwd(), `test/.setup.${testArgv.typescript ? 'ts' : 'js'}`);
    if (fs.existsSync(setupFile)) {
      files.unshift(setupFile);
    }
    testArgv._ = files;

    // remove alias
    testArgv.$0 = undefined;
    testArgv.r = undefined;
    testArgv.t = undefined;
    testArgv.g = undefined;
    testArgv.e = undefined;
    testArgv.typescript = undefined;
    testArgv['dry-run'] = undefined;
    testArgv.dryRun = undefined;

    return this.helper.unparseArgv(testArgv);
  }

  async _getChangedTestFiles() {
    return await getChangedTestFiles(process.cwd());
  }
}

module.exports = TestCommand;

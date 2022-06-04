'use strict';

const debug = require('debug')('egg-bin');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const Command = require('../command');
const { getChangedTestFiles } = require('../utils');

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

    if (parseInt(process.version.split('.')[0].substring(1)) < 18) {
      // using user land test module
      // https://github.com/nodejs/node-core-test
      const nodeTestBin = require.resolve('test/bin/node--test');
      debug('run test: %s %s', nodeTestBin, testArgs.join(' '));
      await this.helper.forkNode(nodeTestBin, testArgs, opt);
      return;
    }
    testArgs.unshift('--test');
    debug('run test: %s %s', process.execPath, testArgs.join(' '));
    await this.helper.spawn(process.execPath, testArgs, opt);
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
    testArgv['dry-run'] = undefined;
    testArgv.dryRun = undefined;
    // not support tscompiler for now
    testArgv.tscompiler = undefined;

    return this.helper.unparseArgv(testArgv);
  }

  async _getChangedTestFiles() {
    return await getChangedTestFiles(process.cwd());
  }
}

module.exports = NodeTestCommand;

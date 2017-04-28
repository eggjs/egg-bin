'use strict';

const debug = require('debug')('egg-bin:test');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const Command = require('../command');

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
    };
  }

  get description() {
    return 'Run test with mocha';
  }

  * run(context) {
    process.env.NODE_ENV = 'test';
    const testArgs = this.formatTestArgs(context);
    const opt = {
      env: Object.assign({}, process.env),
      execArgv: context.execArgv,
    };
    const mochaFile = require.resolve('mocha/bin/_mocha');
    debug('run test: %s %s', mochaFile, testArgs.join(' '));
    yield this.helper.forkNode(mochaFile, testArgs, opt);
  }

  /**
   * format test args then change it to array style
   * @param {Object} context - { cwd, argv, ...}
   * @return {Array} [ '--require=xxx', 'xx.test.js' ]
   * @protected
   */
  formatTestArgs({ argv, debug }) {
    const testArgv = Object.assign({}, argv);

    /* istanbul ignore next */
    testArgv.timeout = testArgv.timeout || process.env.TEST_TIMEOUT || 60000;
    testArgv.reporter = testArgv.reporter || process.env.TEST_REPORTER;

    if (debug) {
      // --no-timeouts
      testArgv.timeouts = false;
      testArgv.timeout = undefined;
    }

    // collect require
    let requireArr = testArgv.require || testArgv.r || [];
    /* istanbul ignore next */
    if (!Array.isArray(requireArr)) requireArr = [ requireArr ];

    requireArr.push(require.resolve('co-mocha'));

    if (requireArr.includes('intelli-espower-loader')) {
      console.warn('[egg-bin] don\'t need to manually require `intelli-espower-loader` anymore');
    } else {
      requireArr.push(require.resolve('intelli-espower-loader'));
    }

    testArgv.require = requireArr;

    // collect test files
    let files = testArgv._.slice();
    if (!files.length) {
      files = [ process.env.TESTS || 'test/**/*.test.js' ];
    }
    // expand glob and skip node_modules and fixtures
    files = globby.sync(files.concat('!test/**/{fixtures, node_modules}/**/*.test.js'));

    // auto add setup file as the first test file
    const setupFile = path.join(process.cwd(), 'test/.setup.js');
    if (fs.existsSync(setupFile)) {
      files.unshift(setupFile);
    }
    testArgv._ = files;

    // remove alias
    testArgv.$0 = undefined;
    testArgv.r = undefined;
    testArgv.t = undefined;
    testArgv.g = undefined;

    return this.helper.unparseArgv(testArgv);
  }
}

module.exports = TestCommand;

'use strict';

const debug = require('debug')('egg-bin:test');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const unparse = require('dargs');
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

  * run({ argv, execArgv }) {
    process.env.NODE_ENV = 'test';
    const newArgs = this.formatTestArgs(argv);
    const opt = {
      env: Object.assign({}, process.env),
      execArgv,
    };
    const mochaFile = require.resolve('mocha/bin/_mocha');
    debug('run test: %s %s', mochaFile, newArgs.join(' '));
    yield this.helper.forkNode(mochaFile, newArgs, opt);
  }

  /**
   * format test args then change it to array style
   * @method helper#formatTestArgs
   * @param {Object} argv - yargs style
   * @return {Array} [ '--require=xxx', 'xx.test.js' ]
   */
  formatTestArgs(argv) {
    const newArgv = Object.assign({}, argv);

    /* istanbul ignore next */
    newArgv.timeout = newArgv.timeout || process.env.TEST_TIMEOUT || '30000';
    newArgv.reporter = newArgv.reporter || process.env.TEST_REPORTER;

    // collect require
    let requireArr = newArgv.require || newArgv.r || [];
    /* istanbul ignore next */
    if (!Array.isArray(requireArr)) requireArr = [ requireArr ];

    requireArr.push(require.resolve('co-mocha'));

    if (requireArr.includes('intelli-espower-loader')) {
      console.warn('[egg-bin] don\'t need to manually require `intelli-espower-loader` anymore');
    } else {
      requireArr.push(require.resolve('intelli-espower-loader'));
    }

    newArgv.require = requireArr;

    // collect test files
    let files = newArgv._.slice();
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
    newArgv._ = files;

    // remove alias
    newArgv.$0 = undefined;
    newArgv.r = undefined;
    newArgv.t = undefined;
    newArgv.g = undefined;

    return unparse(newArgv);
  }
}

module.exports = TestCommand;

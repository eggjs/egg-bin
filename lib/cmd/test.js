const debug = require('util').debuglog('egg-bin:test');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const Command = require('../command');
const { getChangedTestFiles } = require('../utils');
const os = require('os');

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
        type: 'boolean',
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
      parallel: {
        type: 'boolean',
        description: 'mocha parallel mode',
        default: false,
        alias: 'p',
      },
      'auto-agent': {
        description: 'auto bootstrap agent in mocha master process',
        type: 'boolean',
        default: true,
      },
      jobs: {
        description: 'number of jobs to run in parallel',
        type: 'number',
        default: os.cpus().length - 1,
      },
      mochawesome: {
        type: 'boolean',
        description: 'enable mochawesome reporter',
        default: true,
      },
    };
  }

  get description() {
    return 'Run test with mocha';
  }

  async run(context) {
    const mochaFile = process.env.MOCHA_FILE || require.resolve('mocha/bin/_mocha');
    const testArgs = await this.formatTestArgs(context);
    if (!testArgs) return;

    if (context.argv['dry-run']) {
      debug('test with dry-run');
      console.log(mochaFile);
      console.log(testArgs.join('\n'));
      return;
    }
    if (context.argv.parallel) {
      context.env.ENABLE_MOCHA_PARALLEL = 'true';
    }
    if (context.argv.parallel && context.argv['auto-agent']) {
      context.env.AUTO_AGENT = 'true';
    }

    debug('run test: %s %s', mochaFile, testArgs.join(' '));
    const opt = {
      env: Object.assign({
        NODE_ENV: 'test',
      }, context.env),
      execArgv: [
        ...context.execArgv,
        // https://github.com/mochajs/mocha/issues/2640#issuecomment-1663388547
        '--unhandled-rejections=strict',
      ],
    };
    await this.helper.forkNode(mochaFile, testArgs, opt);
  }

  /**
   * format test args then change it to array style
   * @param {Object} context - { cwd, argv, ...}
   * @param {Object} context.argv test arguments
   * @param {Object} context.debugOptions debug options
   * @param {Object} context.execArgvObj exec argv object
   * @return {Array} [ '--require=xxx', 'xx.test.js' ]
   * @protected
   */
  async formatTestArgs({ argv, debugOptions, execArgvObj }) {
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
    const requireArr = execArgvObj.require;
    if (Array.isArray(testArgv.require)) {
      for (const r of testArgv.require) {
        requireArr.push(r);
      }
    }

    // clean mocha stack, inspired by https://github.com/rstacruz/mocha-clean
    // [mocha built-in](https://github.com/mochajs/mocha/blob/master/lib/utils.js#L738) don't work with `[npminstall](https://github.com/cnpm/npminstall)`, so we will override it.
    if (!testArgv.fullTrace) requireArr.unshift(require.resolve('../mocha-clean'));
    try {
      requireArr.push(require.resolve('egg-mock/register'));
    } catch (_) {
      // ...
    }
    // handle mochawesome enable
    if (!testArgv.reporter && testArgv.mochawesome) {
      // use https://github.com/node-modules/mochawesome/pull/1 instead
      testArgv.reporter = require.resolve('mochawesome-with-mocha');
      testArgv['reporter-options'] = 'reportDir=node_modules/.mochawesome-reports';
      if (testArgv.parallel) {
        // https://github.com/adamgruber/mochawesome#parallel-mode
        requireArr.push(require.resolve('mochawesome-with-mocha/register'));
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
    testArgv.mochawesome = undefined;

    return this.helper.unparseArgv(testArgv);
  }

  async _getChangedTestFiles() {
    return await getChangedTestFiles(process.cwd());
  }
}

module.exports = TestCommand;

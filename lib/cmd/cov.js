/* istanbul ignore next */
'use strict';

const debug = require('debug')('egg-bin:cov');
const path = require('path');
const mkdirp = require('mz-modules/mkdirp');
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
        type: 'array',
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

  * run({ cwd, argv, execArgv }) {
    const tmpDir = path.join(cwd, '.tmp');
    yield mkdirp(tmpDir);

    process.env.NODE_ENV = 'test';
    process.env.TMPDIR = tmpDir;

    // istanbul coverage ignore
    const excludes = argv.x || (process.env.COV_EXCLUDES && process.env.COV_EXCLUDES.split(',')) || [];
    for (const exclude of excludes) {
      this[EXCLUDES].add(exclude);
    }
    argv.x = undefined;

    const covFile = require.resolve('istanbul/lib/cli.js');
    const coverageDir = path.join(cwd, 'coverage');
    yield rimraf(coverageDir);

    const opt = {
      execArgv,
      // resolve istanbul path for coffee
      env: Object.assign({
        istanbul_bin_path: covFile,
      }, process.env),
    };

    // save coverage-xxxx.json to $PWD/coverage
    const covArgs = this.getCovArgs(argv);
    debug('covArgs: %j', covArgs);
    yield this.helper.forkNode(covFile, covArgs, opt);
    yield rimraf(tmpDir);

    // create coverage report
    const reportArgs = this.getReportArgs(coverageDir);
    yield this.helper.forkNode(covFile, reportArgs, opt);
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
   * @param {Object} argv - use to extract test args
   * @return {Array} args for istanbul
   * @protected
   */
  getCovArgs(argv) {
    const covArgs = [
      'cover',
      '--report', 'none',
      '--print', 'none',
      '--include-pid',
    ];

    for (const exclude of this[EXCLUDES]) {
      covArgs.push('-x');
      covArgs.push(exclude);
    }
    const mochaFile = require.resolve('mocha/bin/_mocha');
    const testArgs = this.formatTestArgs(argv);
    debug('testArgs: %j', testArgs);
    return covArgs.concat(mochaFile, '--', ...testArgs);
  }

  /**
   * get coverage report args
   * @param {String} coverageDir - coverage result directory
   * @return {Array} args for istanbul coverage report
   * @protected
   */
  getReportArgs(coverageDir) {
    return [
      'report',
      '--root', coverageDir,
      'text-summary',
      'json',
      'lcov',
    ];
  }
}

module.exports = CovCommand;

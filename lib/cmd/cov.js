'use strict';

const path = require('path');
const mkdirp = require('mz-modules/mkdirp');
const rimraf = require('mz-modules/rimraf');
const Command = require('../command');

class CovCommand extends Command {
  constructor(argv) {
    super(argv);

    this.usage = 'Usage: egg-bin cov';

    // you can add ignore dirs here
    this.excludes = [
      'examples/**',
      'mocks_*/**',
    ];
    if (process.env.COV_EXCLUDES) {
      const excludes = process.env.COV_EXCLUDES.split(',');
      for (const exclude of excludes) {
        this.excludes.push(exclude);
      }
    }
  }

  get description() {
    return 'Run test with coverage';
  }

  * run({ cwd, argv, execArgv }) {
    const tmpDir = path.join(cwd, '.tmp');
    yield mkdirp(tmpDir);

    const opt = {
      env: Object.assign({}, process.env, {
        NODE_ENV: 'test',
        TMPDIR: tmpDir,
      }),
      execArgv,
    };

    const covFile = require.resolve('istanbul/lib/cli.js');
    // resolve istanbul path for coffee
    /* istanbul ignore next */
    process.env.istanbul_bin_path = covFile;
    const coverageDir = path.join(cwd, 'coverage');
    yield rimraf(coverageDir);

    // save coverage-xxxx.json to $PWD/coverage
    const covArgs = this.getCovArgs(argv);
    yield this.helper.forkNode(covFile, covArgs, opt);
    yield rimraf(tmpDir);

    // create coverage report
    const reportArgs = this.getReportArgs(coverageDir);
    yield this.helper.forkNode(covFile, reportArgs, opt);
  }

  addExclude(exclude) {
    this.excludes.push(exclude);
  }

  getCovArgs(argv) {
    const covArgs = [
      'cover',
      '--report', 'none',
      '--print', 'none',
      '--include-pid',
    ];
    for (const exclude of this.excludes) {
      covArgs.push('-x');
      covArgs.push(exclude);
    }
    const mochaFile = require.resolve('mocha/bin/_mocha');
    const testArgs = this.helper.formatTestArgv(argv);
    return covArgs.concat([
      mochaFile, '--',
    ]).concat(testArgs);
  }

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

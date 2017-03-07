'use strict';

const path = require('path');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const Command = require('common-bin');

class CovCommand extends Command {
  constructor() {
    super();
    this.name = 'cov';
    this.description = 'Run test with coverage';

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

  * run({ cwd, rawArgv }) {
    process.env.NODE_ENV = 'test';
    process.env.TMPDIR = path.join(cwd, '.tmp');
    mkdirp.sync(process.env.TMPDIR);

    yield this.helper.checkDeps();

    const covFile = require.resolve('istanbul/lib/cli.js');
    // resolve istanbul path for coffee
    /* istanbul ignore next */
    process.env.istanbul_bin_path = covFile;
    const opt = {
      env: process.env,
      execArgv: this.helper.formatExecArgv(rawArgv),
    };
    const coverageDir = path.join(cwd, 'coverage');
    rimraf.sync(coverageDir);

    // save coverage-xxxx.json to $PWD/coverage
    const covArgs = this.getCovArgs(rawArgv);
    yield this.helper.forkNode(covFile, covArgs, opt);
    rimraf.sync(process.env.TMPDIR);

    // create coverage report
    const reportArgs = this.getReportArgs(coverageDir);
    yield this.helper.forkNode(covFile, reportArgs, opt);
  }

  addExclude(exclude) {
    this.excludes.push(exclude);
  }

  getCovArgs(args) {
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
    const testArgs = this.helper.formatTestArgs(args);
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

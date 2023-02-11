import { debuglog } from 'node:util';
import os from 'node:os';
import fs from 'node:fs/promises';
import {
  DefineCommand, Option, Options, Command,
  Middleware, CommandContext,
  Inject,
} from '@artus-cli/artus-cli';
import runscript from 'runscript';
import globby from 'globby';
import { OPTIONS } from './constant';

const debug = debuglog('egg-bin:test');

@DefineCommand({
  command: 'test [files...]',
  description: 'Run the unittest',
  alias: [ 't' ],
})
export class TestCommand extends Command {
  @Option({
    default: [],
    array: true,
    type: 'string',
  })
  files: string[];

  @Option(OPTIONS.baseDir)
  baseDir: string;

  @Option(OPTIONS.require)
  require: string[];

  @Option({
    description: 'only run tests matching <pattern>',
    alias: 'g',
    array: true,
    default: [],
  })
  grep: string[];

  @Option({
    description: 'set test-case timeout in milliseconds, default is 60000',
    alias: 't',
    default: process.env.TEST_TIMEOUT ?? 60000,
  })
  timeout: number;

  @Option({
    description: 'display the full stack trace, default is false',
    type: 'boolean',
    default: false,
  })
  fullTrace: boolean;

  @Option({
    description: 'only test with changed files and match test/**/*.test.(js|ts), default is false',
    alias: 'c',
    type: 'boolean',
    default: false,
  })
  changed: boolean;

  @Option({
    description: 'whether show test command, no test will be executed, default is false',
    alias: 'd',
    type: 'boolean',
    default: false,
  })
  dryRun: boolean;

  @Option({
    description: 'mocha parallel mode, default is false',
    alias: 'p',
    type: 'boolean',
    default: false,
  })
  parallel: boolean;

  @Option({
    description: 'number of jobs to run in parallel',
    type: 'number',
    default: os.cpus().length - 1,
  })
  jobs: number;

  @Option({
    description: 'auto bootstrap agent in mocha master process, default is true',
    type: 'boolean',
    default: true,
  })
  autoAgent: boolean;

  @Option({
    description: 'enable mochawesome reporter, default is true',
    type: 'boolean',
    default: true,
  })
  mochawesome: boolean;

  @Options()
  args: any;

  @Inject()
  ctx: CommandContext;

  @Middleware([
    async (_ctx: CommandContext, next) => {
      console.info('test command middleware 2');
      // console.log(_ctx);
      // console.log(_ctx.input);
      await next();
    },
    async (_ctx, next) => {
      console.info('test command middleware 3');
      await next();
    },
  ])
  @Middleware(async (_ctx, next) => {
    console.info('test command middleware 1');
    await next();
  })
  async run() {
    try {
      await fs.access(this.baseDir)
    } catch (err) {
      console.error('baseDir: %o not exists', this.baseDir);
      throw err;
    }

    const mochaFile = process.env.MOCHA_FILE || require.resolve('mocha/bin/_mocha');

    if (this.dryRun) {
      debug('test with dry-run');
      console.log(mochaFile);
      console.info('test baseDir', this.baseDir);
      console.info('test files', this.files);
      console.info('test require', this.require);
      console.info('test timeout', this.timeout);
      console.info('test fullTrace', this.fullTrace);
      console.info('test autoAgent', this.autoAgent);
      console.info('test mochawesome', this.mochawesome);
      console.info('test parallel', this.parallel);
      console.info('test jobs', this.jobs);
      console.info('test args: %o', this.args);
      return;
    }
    const env = { ...this.ctx.env };
    if (this.parallel) {
      env.ENABLE_MOCHA_PARALLEL = 'true';
      if (this.autoAgent) {
        env.AUTO_AGENT = 'true';
      }
    }

    const mochaArgs = await this.formatTestArgs();
    const cmd = `${process.execPath} ${mochaFile} ${mochaArgs}`;
    debug('run test: %s %o', mochaFile, this.args);

    if (!mochaArgs) return;
    debug('%s', cmd);
    await runscript(cmd, { env });
  }

  protected async formatTestArgs() {
    // const testArgv = Object.assign({}, argv);

    // /* istanbul ignore next */
    // testArgv.timeout = testArgv.timeout || process.env.TEST_TIMEOUT || 60000;
    // testArgv.reporter = testArgv.reporter || process.env.TEST_REPORTER;
    // // force exit
    // testArgv.exit = true;

    // // whether is debug mode, if pass --inspect then `debugOptions` is valid
    // // others like WebStorm 2019 will pass NODE_OPTIONS, and egg-bin itself will be debug, so could detect `process.env.JB_DEBUG_FILE`.

    // if (debugOptions || process.env.JB_DEBUG_FILE) {
    //   // --no-timeout
    //   testArgv.timeout = false;
    // }

    // // collect require
    // const requireArr = execArgvObj.require;
    // if (Array.isArray(testArgv.require)) {
    //   for (const r of testArgv.require) {
    //     requireArr.push(r);
    //   }
    // }

    // // clean mocha stack, inspired by https://github.com/rstacruz/mocha-clean
    // // [mocha built-in](https://github.com/mochajs/mocha/blob/master/lib/utils.js#L738) don't work with `[npminstall](https://github.com/cnpm/npminstall)`, so we will override it.
    // if (!testArgv.fullTrace) requireArr.unshift(require.resolve('../mocha-clean'));
    // try {
    //   requireArr.push(require.resolve('egg-mock/register'));
    // } catch (_) {
    //   // ...
    // }
    // // handle mochawesome enable
    // if (!testArgv.reporter && testArgv.mochawesome) {
    //   // use https://github.com/node-modules/mochawesome/pull/1 instead
    //   testArgv.reporter = require.resolve('mochawesome-with-mocha');
    //   testArgv['reporter-options'] = 'reportDir=node_modules/.mochawesome-reports';
    //   if (testArgv.parallel) {
    //     // https://github.com/adamgruber/mochawesome#parallel-mode
    //     requireArr.push(require.resolve('mochawesome-with-mocha/register'));
    //   }
    // }

    // testArgv.require = requireArr;

    let pattern = this.files;
    // changed
    if (this.changed) {
      // pattern = await this._getChangedTestFiles();
      // if (!pattern.length) {
      //   console.log('No changed test files');
      //   return;
      // }
    }

    if (!pattern.length && process.env.TESTS) {
      pattern = process.env.TESTS.split(',');
    }

    // collect test files
    if (!pattern.length) {
      pattern = [ `test/**/*.test.${this.args.typescript ? 'ts' : 'js'}` ];
    }
    pattern = pattern.concat([ '!test/fixtures', '!test/node_modules' ]);

    // expand glob and skip node_modules and fixtures
    const files = globby.sync(pattern);
    files.sort();

    if (files.length === 0) {
      console.log(`No test files found with ${pattern}`);
      return;
    }

    // // auto add setup file as the first test file
    // const setupFile = path.join(process.cwd(), `test/.setup.${testArgv.typescript ? 'ts' : 'js'}`);
    // if (fs.existsSync(setupFile)) {
    //   files.unshift(setupFile);
    // }
    // testArgv._ = files;

    // // remove alias
    // testArgv.$0 = undefined;
    // testArgv.r = undefined;
    // testArgv.t = undefined;
    // testArgv.g = undefined;
    // testArgv.e = undefined;
    // testArgv.typescript = undefined;
    // testArgv['dry-run'] = undefined;
    // testArgv.dryRun = undefined;
    // testArgv.mochawesome = undefined;

    return `--timeout ${this.timeout} ` + files.join(' ');
  }

  // async _getChangedTestFiles() {
  //   return await getChangedTestFiles(process.cwd());
  // }
}

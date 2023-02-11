import { debuglog } from 'node:util';
import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  DefineCommand, Option, Options, Command,
  CommandContext,
  Inject,
} from '@artus-cli/artus-cli';
import runscript, { Options as RunScriptOptions } from 'runscript';
import globby from 'globby';
import { getChangedFilesForRoots } from 'jest-changed-files';
import { OPTIONS } from './constant';

const debug = debuglog('egg-bin:test');

@DefineCommand({
  command: 'test [files...]',
  description: 'Run the test',
  alias: [ 't' ],
})
export class TestCommand extends Command {
  @Option({
    default: [],
    array: true,
    type: 'string',
  })
  files: string[];

  @Option(OPTIONS.require)
  require: string[];

  @Option({
    description: 'set test-case timeout in milliseconds, default is 60000',
    alias: 't',
    default: process.env.TEST_TIMEOUT ?? 60000,
  })
  timeout: number | boolean;

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

  async run() {
    try {
      await fs.access(this.args.base, fs.constants.R_OK);
    } catch (err) {
      console.error('baseDir: %o not exists', this.args.base);
      throw err;
    }

    const mochaFile = process.env.MOCHA_FILE || require.resolve('mocha/bin/_mocha');
    if (this.parallel) {
      this.ctx.env.ENABLE_MOCHA_PARALLEL = 'true';
      if (this.autoAgent) {
        this.ctx.env.AUTO_AGENT = 'true';
      }
    }

    debug('run test: %s %o', mochaFile, this.args);

    const mochaArgs = await this.formatTestArgs();
    if (!mochaArgs) return;

    const mochaCmd = [
      mochaFile,
      ...mochaArgs,
    ].filter(argv => argv.trim()).join(' ');
    await this.runNodeCmd(mochaCmd, { env: this.ctx.env, cwd: this.args.base });
  }

  protected async runNodeCmd(nodeCmd: string, options: RunScriptOptions) {
    const cmd = `node ${nodeCmd}`;
    debug('%s', cmd);
    if (this.dryRun) {
      console.log('dry run: $ %o', cmd);
    }
    await runscript(cmd, options);
  }

  protected async formatTestArgs() {
    // collect require
    const requires = this.require;
    try {
      const eggMockRegister = require.resolve('egg-mock/register');
      requires.push(eggMockRegister);
      debug('auto register egg-mock: %o', eggMockRegister);
    } catch {
      // ignore egg-mock not exists
    }

    // handle mochawesome enable
    let reporter = this.ctx.env.TEST_REPORTER;
    let reporterOptions = '';
    if (!reporter && this.mochawesome) {
      // use https://github.com/node-modules/mochawesome/pull/1 instead
      reporter = require.resolve('mochawesome-with-mocha');
      reporterOptions = 'reportDir=node_modules/.mochawesome-reports';
      if (this.parallel) {
        // https://github.com/adamgruber/mochawesome#parallel-mode
        requires.push(require.resolve('mochawesome-with-mocha/register'));
      }
    }

    const ext = this.args.typescript ? 'ts' : 'js';
    let pattern = this.files;
    // changed
    if (this.changed) {
      pattern = await this.getChangedTestFiles(this.args.base, ext);
      if (!pattern.length) {
        console.log('No changed test files');
        return;
      }
      debug('changed files: %o', pattern);
    }

    if (!pattern.length && process.env.TESTS) {
      pattern = process.env.TESTS.split(',');
    }

    // collect test files
    if (!pattern.length) {
      pattern = [ `test/**/*.test.${ext}` ];
    }
    pattern = pattern.concat([ '!test/fixtures', '!test/node_modules' ]);

    // expand glob and skip node_modules and fixtures
    const files = globby.sync(pattern, { cwd: this.args.base });
    files.sort();

    if (files.length === 0) {
      console.log(`No test files found with ${pattern}`);
      return;
    }

    // auto add setup file as the first test file
    const setupFile = path.join(this.args.base, `test/.setup.${ext}`);
    try {
      await fs.access(setupFile, fs.constants.R_OK);
      files.unshift(setupFile);
    } catch {
      // ignore
    }

    return [
      this.dryRun ? '--dry-run' : '',
      // force exit
      '--exit',
      this.timeout === false ? '--no-timeout' : `--timeout ${this.timeout}`,
      this.parallel ? '--parallel' : '',
      this.parallel && this.jobs ? `--jobs ${this.jobs}` : '',
      reporter ? `--reporter ${reporter}` : '',
      reporterOptions ? `--reporter-options ${reporterOptions}` : '',
      ...requires.map(r => `--require ${r}`),
      ...files,
    ];
  }

  protected async getChangedTestFiles(dir: string, ext: string) {
    const res = await getChangedFilesForRoots([ path.join(dir, 'test') ], {});
    const changedFiles = res.changedFiles;
    const files: string[] = [];
    for (const file of changedFiles) {
      // only find test/**/*.test.(js|ts)
      if (file.endsWith(`.test.${ext}`)) {
        files.push(file);
      }
    }
    return files;
  }
}

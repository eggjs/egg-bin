'use strict';

const debug = require('debug')('egg-bin:debug');
const Command = require('common-bin');

class DebugCommand extends Command {
  constructor() {
    super();

    // you can change to your team npm cli
    this.npmCli = 'cnpm';
  }

  get description() {
    return 'Debug mode start';
  }

  * run({ cwd, argv }) {
    const framework = this.getFrameworkOrEggPath(cwd);
    const args = yield this.helper.formatArgs(cwd, argv, { framework });

    const options = {
      env: Object.assign({}, process.env),
      execArgv: this.helper.formatExecArgv(args).concat([ '--inspect' ]),
    };

    options.env.NODE_ENV = options.env.NODE_ENV || 'development';
    options.env.EGG_DEBUG = 'true';

    yield this.helper.checkDeps();

    debug('%s %s, NODE_ENV:%s, cwd:%s', this.helper.serverBin, args.join(' '), options.env.NODE_ENV, process.cwd());

    this.helper.forkNode(this.helper.serverBin, args, options);
  }

  getFrameworkOrEggPath() {

  }
}

module.exports = DebugCommand;

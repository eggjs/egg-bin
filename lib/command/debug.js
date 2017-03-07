'use strict';

const debug = require('debug')('egg-bin:debug');
const Command = require('common-bin');

class DebugCommand extends Command {
  constructor() {
    super();
    this.name = 'debug';
    this.description = 'Debug mode start';

    // you can change to your team npm cli
    this.npmCli = 'cnpm';
  }

  * run({ cwd, rawArgv }) {
    const framework = this.getFrameworkOrEggPath(cwd);
    const args = yield this.helper.formatArgs(cwd, rawArgv, { framework });

    const options = {
      env: Object.assign({}, process.env),
      execArgv: this.helper.formatExecArgv(args).concat([ '--inspect' ]),
    };

    options.env.NODE_ENV = options.env.NODE_ENV || 'development';
    options.env.EGG_DEBUG = 'true';

    yield this.helper.checkDeps();

    debug('%s %s, NODE_ENV:%s, cwd:%s',
      this.helper.serverBin, args.join(' '), options.env.NODE_ENV, process.cwd());

    this.helper.forkNode(this.helper.serverBin, args, options);
  }

  getFrameworkOrEggPath() {

  }
}

module.exports = DebugCommand;

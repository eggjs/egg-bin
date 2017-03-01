'use strict';

const debug = require('debug')('egg-bin:debug');
const Command = require('./command');

class DebugCommand extends Command {
  constructor() {
    super();
    // you can change to your team npm cli
    this.npmCli = 'cnpm';
    this.name = 'debug';
    this.description = 'start at debug mode';
  }

  * run({ cwd, rawArgv }) {
    const eggPath = this.getFrameworkOrEggPath(cwd);
    const args = yield this.helper.formatArgs(cwd, rawArgv, { eggPath });

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

  getFrameworkOrEggPath(cwd) {
    return this.utils.getFrameworkOrEggPath(cwd);
  }
}

module.exports = DebugCommand;

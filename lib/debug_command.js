'use strict';

const debug = require('debug')('egg-bin:debug');
const Command = require('./command');

class DebugCommand extends Command {
  constructor() {
    super();
    // you can change to your team npm cli
    this.npmCli = 'cnpm';
  }

  * run(cwd, args) {
    const framework = this.getFrameworkOrEggPath(cwd);
    args = yield this.helper.formatArgs(cwd, args, { framework });

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

  help() {
    return 'Debug mode start';
  }
}

module.exports = DebugCommand;

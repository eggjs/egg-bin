'use strict';

const debug = require('debug')('egg-bin:dev');
const Command = require('./command');

class DevCommand extends Command {
  constructor() {
    super();
    this.name = 'dev';
    this.description = 'start with local env';
    this.options = undefined;
  }

  * run({ cwd, rawArgv }) {
    const eggPath = this.getFrameworkOrEggPath(cwd);
    const devArgs = yield this.helper.formatArgs(cwd, rawArgv, { eggPath });

    const options = {
      env: Object.assign({}, process.env),
      execArgv: this.helper.formatExecArgv(rawArgv),
    };

    options.env.NODE_ENV = options.env.NODE_ENV || 'development';

    debug('%s %j %j, %j', this.helper.serverBin, devArgs, options.execArgv, options.env.NODE_ENV);
    yield this.helper.checkDeps();
    yield this.helper.forkNode(this.helper.serverBin, devArgs, options);
  }

  getFrameworkOrEggPath(cwd) {
    return this.utils.getFrameworkOrEggPath(cwd);
  }
}

module.exports = DevCommand;

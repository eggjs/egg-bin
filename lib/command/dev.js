'use strict';

const debug = require('debug')('egg-bin:dev');
const Command = require('common-bin');

class DevCommand extends Command {

  get description() {
    return 'Start server at local dev mode';
  }

  * run({ cwd, argv, rawArgv }) {
    const framework = this.getFrameworkOrEggPath(cwd);
    const devArgs = yield this.helper.formatArgs(cwd, argv, { framework });

    const options = {
      env: Object.assign({}, process.env),
      execArgv: this.helper.formatExecArgv(rawArgv),
    };

    options.env.NODE_ENV = options.env.NODE_ENV || 'development';

    debug('%s %j %j, %j', this.helper.serverBin, devArgs, options.execArgv, options.env.NODE_ENV);
    yield this.helper.checkDeps();
    yield this.helper.forkNode(this.helper.serverBin, devArgs, options);
  }

  getFrameworkOrEggPath() {

  }
}

module.exports = DevCommand;

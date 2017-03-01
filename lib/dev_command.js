'use strict';

const debug = require('debug')('egg-bin:dev');
const Command = require('./command');

class DevCommand extends Command {
  * run(cwd, args = []) {
    const framework = this.getFrameworkOrEggPath(cwd);
    const devArgs = yield this.helper.formatArgs(cwd, args, { framework });

    const options = {
      env: Object.assign({}, process.env),
      execArgv: this.helper.formatExecArgv(args),
    };

    options.env.NODE_ENV = options.env.NODE_ENV || 'development';

    debug('%s %j %j, %j', this.helper.serverBin, devArgs, options.execArgv, options.env.NODE_ENV);
    yield this.helper.checkDeps();
    yield this.helper.forkNode(this.helper.serverBin, devArgs, options);
  }

  getFrameworkOrEggPath() {

  }

  help() {
    return 'local env start';
  }
}

module.exports = DevCommand;

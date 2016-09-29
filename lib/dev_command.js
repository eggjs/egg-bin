'use strict';

const debug = require('debug')('egg-bin:dev');
const Command = require('./command');

class DevCommand extends Command {
  * run(cwd, args) {
    const execArgv = args ? args.filter(str => str.indexOf('--debug') === 0 || str.indexOf('--inspect') === 0) : [];

    args.push('--baseDir');
    args.push(cwd);
    args.push('--cluster');
    args.push('1');

    const eggPath = this.getFrameworkOrEggPath(cwd);

    if (eggPath) {
      args.push(`--eggPath=${eggPath}`);
    }

    const options = {
      env: process.env,
      execArgv,
    };

    options.env.NODE_ENV = options.env.NODE_ENV || 'development';

    debug('%s %j %j, %j', this.helper.serverBin, args, execArgv, options.env.NODE_ENV);
    yield this.helper.checkDeps();
    yield this.helper.forkNode(this.helper.serverBin, args, options);
  }

  help() {
    return 'local env start';
  }

  getFrameworkOrEggPath(cwd) {
    return this.utils.getFrameworkOrEggPath(cwd);
  }
}

module.exports = DevCommand;

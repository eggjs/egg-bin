'use strict';

const debug = require('debug')('egg-bin:dev');
const Command = require('./Command');

class DevCommand extends Command {
  * run(cwd, args) {
    args.push('--baseDir');
    args.push(cwd);
    args.push('--cluster');
    args.push('1');

    const eggPath = this.helper.getFrameworkOrEggPath(cwd);
    if (eggPath) {
      args.push(`--eggPath=${eggPath}`);
    }

    const options = {
      env: process.env,
    };

    options.env.NODE_ENV = options.env.NODE_ENV || 'development';

    debug('%s %j %j', this.helper.serverBin, args, options.env.NODE_ENV);
    yield this.helper.checkDeps();
    yield this.helper.forkNode(this.helper.serverBin, args, options);
  }

  help() {
    return 'local env start';
  }
}

module.exports = DevCommand;

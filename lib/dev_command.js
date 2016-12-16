'use strict';

const debug = require('debug')('egg-bin:dev');
const Command = require('./command');

class DevCommand extends Command {
  * run(cwd, args) {
    const execArgv = args ? args.filter(str => str.indexOf('--debug') === 0 || str.indexOf('--inspect') === 0) : [];

    args = yield this.helper.formatArgs(cwd, args);

    const options = {
      env: Object.assign({}, process.env),
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
}

module.exports = DevCommand;

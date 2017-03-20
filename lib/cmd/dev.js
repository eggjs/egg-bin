'use strict';

const debug = require('debug')('egg-bin:dev');
const Command = require('../command');

class DevCommand extends Command {

  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin dev [dir] [options]';
    this.options = {
      baseDir: {
        description: 'directory of application, default to `process.cwd()`',
        type: 'string',
      },
      cluster: {
        description: 'numbers of app workers, if not provide then only 1 worker, provide without value then `os.cpus().length`',
        type: 'number',
        alias: 'c',
      },
      port: {
        description: 'listening port, default to 7001',
        type: 'number',
        alias: 'p',
      },
      framework: {
        description: 'specify framework that can be absolute path or npm package',
        type: 'string',
      },
    };
  }

  get description() {
    return 'Start server at local dev mode';
  }

  * run(context) {
    const { cwd, argv, execArgv } = context;
    const framework = this.getFrameworkOrEggPath(context);
    const devArgs = yield this.helper.formatArgs(cwd, argv, { framework });
    const options = {
      execArgv,
      env: Object.assign({ NODE_ENV: 'development' }, process.env),
    };
    debug('%s %j %j, %j', this.helper.serverBin, devArgs, options.execArgv, options.env.NODE_ENV);
    yield this.helper.forkNode(this.helper.serverBin, devArgs, options);
  }

  getFrameworkOrEggPath() {}
}

module.exports = DevCommand;

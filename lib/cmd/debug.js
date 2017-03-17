'use strict';

const Command = require('./dev');

class DebugCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin debug [dir] [options]';
    this.options = {
      inspect: {
        description: 'v8 Inspector port',
        default: '',
      },
      'inspect-brk': {
        description: 'whether break at start',
      },
    };
    process.env.EGG_DEBUG = 'true';
  }

  get description() {
    return 'Debug mode start';
  }

  getFrameworkOrEggPath() {}
}

module.exports = DebugCommand;

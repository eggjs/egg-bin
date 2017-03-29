'use strict';

const Command = require('./dev');

class DebugCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin debug [dir] [options]';
    this.options = {
      // set default to empty so `--inspect` will always pass to fork
      inspect: {
        description: 'V8 Inspector port',
        default: '',
      },
      'inspect-brk': {
        description: 'whether break at start',
      },
    };
    process.env.EGG_DEBUG = 'true';
  }

  get description() {
    return 'Start server at local debug mode';
  }
}

module.exports = DebugCommand;

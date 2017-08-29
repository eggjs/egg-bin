'use strict';

const semver = require('semver');
const Command = require('./dev');

class DebugCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    const newDebugger = semver.gte(process.version, '8.0.0');
    this.usage = 'Usage: egg-bin debug [dir] [options]';
    this.options = {
      // set default to empty so `--inspect` will always pass to fork
      inspect: {
        description: 'V8 Inspector port',
        default: newDebugger ? '' : undefined,
      },
      'inspect-brk': {
        description: 'whether break at start',
      },
      debug: {
        description: 'legacy debugger',
        default: newDebugger ? undefined : '',
      },
    };
    process.env.EGG_DEBUG = 'true';
  }

  get description() {
    return 'Start server at local debug mode';
  }
}

module.exports = DebugCommand;

'use strict';

const semver = require('semver');
const Command = require('./dev');

class DebugCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    // egg-bin debug --debug-port=6666 --agent=5555 --brk --agent-brk
    this.usage = 'Usage: egg-bin debug [dir] [options]';
    this.options = {
      debug: {
        alias: 'inspect',
        description: 'auto detect the protocol used by the targeted runtime, use inspect at 8.x+',
        default: true,
      },
      'debug-port': {
        description: 'worker debug port, default to 9229(inspect) or 5858(debug)',
      },
      'debug-brk': {
        alias: 'brk',
        description: 'whether stop at the top of worker initial script',
      },
      'debug-agent': {
        alias: 'agent',
        description: 'whether debug agent, could pass Number as debugPort, default to 9227(inspect) or 5856(debug)',
      },
      'debug-agent-brk': {
        description: 'whether stop at the top of agent initial script',
      },
    };
    process.env.EGG_DEBUG = 'true';
  }

  get description() {
    return 'Start server at local debug mode';
  }

  get context() {
    const context = super.context;
    const { argv, execArgvObj, debugOptions, debugPort } = context;

    // use debugPort extract from `--inspect=9999 / --debug-port=1111` etc, if not provide just pass true
    argv.debug = debugPort || true;

    if (debugOptions['inspect-brk'] || debugOptions['debug-brk']) {
      argv.debugBrk = true;
    }

    // remove unused
    argv['debug-port'] = undefined;
    argv['debug-brk'] = undefined;
    argv['debug-agent'] = undefined;
    argv['debug-agent-brk'] = undefined;

    // remove all debug options from execArgv
    for (const key of Object.keys(debugOptions)) {
      execArgvObj[key] = undefined;
    }

    // recreate execArgv array
    context.execArgv = this.helper.unparseArgv(execArgvObj);

    return context;
  }
}

module.exports = DebugCommand;

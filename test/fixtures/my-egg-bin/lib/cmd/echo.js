'use strict';

const Command = require('../../../../../');

class EchoCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);

    this.options = {
      eggTsHelper: {
        description: 'egg-ts-helper register, default use `egg-ts-helper/register`',
        type: 'string',
        alias: 'ets',
        default: 'custom-egg-ts-helper/register',
      },
    };
  }

  get description() {
    return 'echo test';
  }

  async run(context) {
    console.log('argv: %j', context.argv);
    console.log('debugPort: %s', context.debugPort);
    console.log('debugOptions: %j', context.debugOptions);
    console.log('execArgv: %j', context.execArgv);
  }
}

module.exports = EchoCommand;

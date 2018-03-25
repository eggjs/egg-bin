'use strict';

const path = require('path');
const BaseCommand = require('common-bin');

class Command extends BaseCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.parserOptions = {
      execArgv: true,
      removeAlias: true,
    };

    // common-bin setter, don't care about override at sub class
    // https://github.com/node-modules/common-bin/blob/master/lib/command.js#L158
    this.options = {
      typescript: {
        description: 'whether enable typescript support, will load `ts-node/register` etc',
        type: 'boolean',
        alias: 'ts',
      },
    };
  }

  get context() {
    const context = super.context;
    const { argv, debugPort, execArgvObj } = context;

    // compatible
    if (debugPort) context.debug = debugPort;

    // remove unuse args
    argv.$0 = undefined;

    // execArgv
    if (argv.typescript) {
      execArgvObj.require = execArgvObj.require || [];
      execArgvObj.require.push(path.join(__dirname, './ts-helper.js'));
    }

    return context;
  }
}

module.exports = Command;

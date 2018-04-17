'use strict';

const path = require('path');
const fs = require('fs');
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
        default: undefined,
      },
    };
  }

  get context() {
    const context = super.context;
    const { argv, debugPort, execArgvObj, cwd, env } = context;

    // compatible
    if (debugPort) context.debug = debugPort;

    // remove unuse args
    argv.$0 = undefined;

    // read `egg.typescript` from package.json if not pass argv
    if (argv.typescript === undefined) {
      let baseDir = argv._[0] || argv.baseDir || cwd;
      if (!path.isAbsolute(baseDir)) baseDir = path.join(cwd, baseDir);
      const pkgFile = path.join(baseDir, 'package.json');
      if (fs.existsSync(pkgFile)) {
        const pkgInfo = require(pkgFile);
        if (pkgInfo && pkgInfo.egg && pkgInfo.egg.typescript === true) {
          argv.typescript = true;
        }
      }
    }

    // execArgv
    if (argv.typescript) {
      execArgvObj.require = execArgvObj.require || [];
      execArgvObj.require.push(path.join(__dirname, './ts-helper.js'));
      env.EGG_TYPESCRIPT = true;
    }

    return context;
  }
}

module.exports = Command;

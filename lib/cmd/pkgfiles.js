'use strict';

const Command = require('../command');

class PkgfilesCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin pkgfiles';
    this.options = {
      check: {
        description: 'assert whether it\'s same',
      },
    };
  }

  get description() {
    return 'Generate pkg.files automatically';
  }

  async run({ cwd, argv }) {
    const args = [
      '--entry', 'app',
      '--entry', 'config',
      '--entry', '*.js',
    ];
    if (argv.check) args.push('--check');
    const pkgfiles = require.resolve('ypkgfiles/bin/ypkgfiles.js');
    await this.helper.forkNode(pkgfiles, args, { cwd });
  }
}

module.exports = PkgfilesCommand;

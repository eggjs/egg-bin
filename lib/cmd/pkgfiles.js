'use strict';

const Command = require('../command');

class PkgfilesCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin pkgfiles';
  }

  get description() {
    return 'Generate pkg.files automatically';
  }

  * run({ cwd }) {
    const args = [
      '--entry', 'app',
      '--entry', 'config',
      '--entry', '*.js',
    ];
    const pkgfiles = require.resolve('ypkgfiles/bin/ypkgfiles.js');
    yield this.helper.forkNode(pkgfiles, args, { cwd });
  }
}

module.exports = PkgfilesCommand;

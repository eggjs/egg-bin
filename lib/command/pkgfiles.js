'use strict';

const Command = require('common-bin');

class PkgfilesCommand extends Command {
  constructor() {
    super();
    this.name = 'pkgfiles';
    this.description = 'Generate pkg.files automatically';
  }

  * run({ cwd }) {
    const args = [
      '--entry', 'app',
      '--entry', 'config',
      '--entry', '*.js',
    ];
    const pkgfiles = require.resolve('ypkgfiles/bin/pkgfiles.js');
    yield this.helper.forkNode(pkgfiles, args, { cwd });
  }
}

module.exports = PkgfilesCommand;

'use strict';

const Command = require('./command');

class PkgfilesCommand extends Command {
  * run(cwd) {
    const args = [
      '--entry', 'app',
      '--entry', 'config',
      '--entry', '*.js',
    ];
    const pkgfiles = require.resolve('ypkgfiles/bin/pkgfiles.js');
    yield this.helper.forkNode(pkgfiles, args, { cwd });
  }

  help() {
    return 'Generate pkg.files automatically';
  }
}

module.exports = PkgfilesCommand;

'use strict';

const Command = require('../command');
const path = require('path');

class CheckCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin check';
    this.options = {
      baseDir: {
        description: 'directory of application, default to `process.cwd()`',
        type: 'string',
      },
    };
  }

  get description() {
    return 'Check egg project for collect useful infomation to report issue';
  }

  * run({ cwd, argv }) {
    /* istanbul ignore next */
    let baseDir = argv._[0] || argv.baseDir || cwd;
    /* istanbul ignore next */
    if (!path.isAbsolute(baseDir)) baseDir = path.join(cwd, baseDir);

    // check eggache
    const eslintBin = require.resolve('eslint/bin/eslint');
    const eslintArgs = this.helper.unparseArgv({
      _: [ '.' ],
      config: require.resolve('../check-eslintrc'),
      'no-eslintrc': true,
      format: 'codeframe',
    });
    console.info('[egg-bin] run check: %s %s', eslintBin, eslintArgs.join(' '));
    yield this.helper.forkNode(eslintBin, eslintArgs, { cwd: baseDir });
  }
}

module.exports = CheckCommand;

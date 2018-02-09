'use strict';

const Command = require('../command');
const path = require('path');

class CheckCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-bin check';
    this.options = {
      format: {
        description: 'eslint output format',
        default: 'codeframe',
      },
    };
  }

  get description() {
    return 'Check egg project for collect useful infomation to report issue';
  }

  * run({ cwd, argv }) {
    const eslintBin = require.resolve('eslint/bin/eslint');
    argv.config = require.resolve('../check-eslintrc');
    argv['no-eslintrc'] = true;
    if (argv._.length === 0) argv._[0] = cwd;
    const args = this.helper.unparseArgv(argv);
    console.info('[egg-bin] run check: %s %s', eslintBin, args.join(' '));
    yield this.helper.forkNode(eslintBin, args, { cwd });
  }
}

module.exports = CheckCommand;
